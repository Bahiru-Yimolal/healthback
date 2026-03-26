const { Op, fn, col } = require("sequelize");
const HouseholdVisit = require("../models/householdVisit");
const Family = require("../models/familyModel");
const PregnantAssessment = require("../models/pregnantAssessment");
const PostnatalAssessment = require("../models/postnatalAssessment");
const ChildAssessment = require("../models/childAssessment");
const Child = require("../models/childModel");
const PregnantMother = require("../models/pregnantMotherModel");
const LactatingMother = require("../models/lactatingMotherModel");
const Referral = require("../models/referral");
const AdministrativeUnit = require("../models/administrativeUnitModel");
const sequelize = require("../config/database");

/**
 * Helper to calculate age from DOB and reference date
 * Supports row-level demographics calculation
 */
const calculateAge = (dob, refDate) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const reference = new Date(refDate);
    if (isNaN(birthDate.getTime())) return 0;

    let age = reference.getFullYear() - birthDate.getFullYear();
    const m = reference.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && reference.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

/**
 * Core Helper to get full stats for an indicator
 * Handles both Worker-level and Unit-level (Aggregate) reporting
 */
const getIndicatorStats = async ({
    userId,
    unitId,
    startDate,
    endDate,
    idField,
    entityModel,
    mainModel,
    mainWhere = {},
    ageKey,
    genderKey,
    ageBrackets,
    isMother = false,
    reportDate,
    blockIds = [] // Passed if already resolved
}) => {
    // 1. Resolve blocks if not passed
    if (unitId && blockIds.length === 0) {
        const blocksQuery = `
            WITH RECURSIVE Hierarchy AS (
                SELECT id, level FROM "AdministrativeUnits" WHERE id = :unitId
                UNION ALL
                SELECT au.id, au.level FROM "AdministrativeUnits" au
                INNER JOIN Hierarchy h ON au.parent_id = h.id
            )
            SELECT id FROM Hierarchy WHERE level = 'BLOCK';
        `;
        const blocks = await sequelize.query(blocksQuery, {
            replacements: { unitId },
            type: sequelize.QueryTypes.SELECT
        });
        blockIds = blocks.map(b => b.id);
        if (blockIds.length === 0) blockIds = [unitId]; // Fallback for BLOCK level
    }

    const isMainVisit = mainModel === HouseholdVisit;
    const include = [];
    let processedMainWhere = { ...mainWhere };

    if (isMainVisit) {
        // Querying HouseholdVisit directly
        processedMainWhere = {
            ...processedMainWhere,
            ...(userId ? { visitor_id: userId } : {}),
            visit_date: { [Op.between]: [startDate, endDate] }
        };
        if (unitId) {
            include.push({
                model: Family,
                as: 'Family',
                required: true,
                where: { block_id: { [Op.in]: blockIds } }
            });
        }
    } else {
        // Querying Assessments, Need to Join HouseholdVisit
        include.push({
            model: HouseholdVisit,
            as: 'visit',
            required: true,
            where: {
                ...(userId ? { visitor_id: userId } : {}),
                visit_date: { [Op.between]: [startDate, endDate] }
            },
            ...(unitId ? {
                include: [{
                    model: Family,
                    as: 'Family',
                    required: true,
                    where: { block_id: { [Op.in]: blockIds } }
                }]
            } : {})
        });
    }

    // 2. Find all unique matches
    const matchedRecords = await mainModel.findAll({
        attributes: [[fn('DISTINCT', col(`${mainModel.name}.${idField}`)), 'id']],
        where: processedMainWhere,
        include,
        raw: true
    });

    const ids = matchedRecords.map(r => r.id);
    const stats = { new: 0, repeat: 0, age: { cat1: 0, cat2: 0 }, sex: { M: 0, F: 0 } };

    if (!ids.length) return stats;

    // 3. New vs Repeat segmentation (Earliest visit ever)
    const earliestVisits = await (isMainVisit ? HouseholdVisit : mainModel).findAll({
        attributes: [idField, [fn('MIN', col(isMainVisit ? 'visit_date' : 'createdAt')), 'first_time']],
        where: { [idField]: ids },
        group: [idField],
        raw: true
    });

    const newIds = [];
    const startObj = new Date(startDate);
    earliestVisits.forEach(ev => {
        if (new Date(ev.first_time) >= startObj) newIds.push(ev[idField]);
        else stats.repeat++;
    });
    stats.new = newIds.length;

    // 4. Detailed Demographics
    const allEntities = await entityModel.findAll({
        where: { id: ids },
        attributes: ['id', ageKey, genderKey]
    });

    allEntities.forEach(e => {
        const isNew = newIds.includes(e.id);
        if (isNew) {
            const age = calculateAge(e[ageKey], reportDate);
            if (ageBrackets.lt !== undefined && age < ageBrackets.lt) stats.age.cat1++;
            else if (ageBrackets.gt !== undefined && age > ageBrackets.gt) stats.age.cat2++;
            else if (ageBrackets.range !== undefined) {
                if (age >= ageBrackets.range[0] && age <= ageBrackets.range[1]) stats.age.cat2++;
                else if (age < ageBrackets.lt) stats.age.cat1++;
            }
        }
        if (isMother) stats.sex.F++;
        else {
            const gender = e[genderKey];
            if (gender === 'MALE' || gender === 'M') stats.sex.M++;
            else stats.sex.F++;
        }
    });

    return stats;
};

const getReportForContext = async (userId, unitId, startDate, endDate, reportDate) => {
    // Resolve blockIds once to reuse
    let blockIds = [];
    if (unitId) {
        const blocksQuery = `
            WITH RECURSIVE Hierarchy AS (
                SELECT id, level FROM "AdministrativeUnits" WHERE id = :unitId
                UNION ALL
                SELECT au.id, au.level FROM "AdministrativeUnits" au
                INNER JOIN Hierarchy h ON au.parent_id = h.id
            )
            SELECT id FROM Hierarchy WHERE level = 'BLOCK';
        `;
        const blocks = await sequelize.query(blocksQuery, {
            replacements: { unitId },
            type: sequelize.QueryTypes.SELECT
        });
        blockIds = blocks.map(b => b.id);
        if (blockIds.length === 0) blockIds = [unitId];
    }

    const baseParams = { userId, unitId, startDate, endDate, reportDate, blockIds };

    // --- Section 1: Service Coverage (Households) ---
    const p1 = { ...baseParams, idField: 'family_id', entityModel: Family, mainModel: HouseholdVisit, ageKey: 'guardian_dob', genderKey: 'guardian_gender', ageBrackets: { lt: 18, gt: 45 } };
    const stats_1_1 = await getIndicatorStats(p1);
    const stats_1_2 = await getIndicatorStats({ ...p1, mainWhere: { is_vulnerable: true } });
    const stats_1_3 = await getIndicatorStats({ ...p1, mainWhere: { is_eligible_for_support: true } });
    const stats_1_4 = await getIndicatorStats({ ...p1, mainWhere: { course_completed: true } });

    // --- Section 2: Pregnant Women ---
    const p2 = { ...baseParams, idField: 'mother_id', entityModel: PregnantMother, mainModel: PregnantAssessment, ageKey: 'dob', genderKey: 'id', ageBrackets: { lt: 18, gt: 45 }, isMother: true };
    const stats_2_1 = await getIndicatorStats(p2);
    const stats_2_2 = await getIndicatorStats({ ...p2, mainWhere: { referred_to_facility: true } });

    // 2.3 logic (Referral based)
    const referrals23 = await Referral.findAll({
        where: {
            ...(userId ? { pc_worker_id: userId } : {}),
            beneficiary_type: 'PREGNANT_MOTHER',
            status: { [Op.in]: ['ACCEPTED', 'COMPLETED'] },
            createdAt: { [Op.between]: [startDate, endDate] }
        },
        include: unitId ? [{
            model: HouseholdVisit,
            required: true,
            include: [{ model: Family, as: 'Family', required: true, where: { block_id: { [Op.in]: blockIds } } }]
        }] : []
    });
    const motherIds23 = Array.from(new Set(referrals23.map(r => r.beneficiary_id)));
    const stats_2_3 = { new: motherIds23.length, repeat: 0, age: { cat1: 0, cat2: 0 }, sex: { M: 0, F: motherIds23.length } };

    // --- Section 3: Postnatal Women ---
    const p3 = { ...baseParams, idField: 'mother_id', entityModel: LactatingMother, mainModel: PostnatalAssessment, ageKey: 'dob', genderKey: 'id', ageBrackets: { lt: 18, gt: 45 }, isMother: true };
    const stats_3_1 = await getIndicatorStats(p3);
    const stats_3_2 = await getIndicatorStats({ ...p3, mainWhere: { referred_to_facility: true } });

    // --- Section 4: Child (<6 years) ---
    const p4 = { ...baseParams, idField: 'child_id', entityModel: Child, mainModel: ChildAssessment, ageKey: 'dob', genderKey: 'gender', ageBrackets: { lt: 4, range: [4, 6] } };
    const stats_4_1 = await getIndicatorStats(p4);
    const stats_4_2 = await getIndicatorStats({ ...p4, mainWhere: { nutritional_status: { [Op.ne]: 'NA' } } });
    const stats_4_3 = await getIndicatorStats({ ...p4, mainWhere: { nutritional_status: 'SAM' } });
    const stats_4_4 = await getIndicatorStats({ ...p4, mainWhere: { nutritional_status: 'MAM' } });
    const stats_4_5 = await getIndicatorStats({ ...p4, mainWhere: { abuse_violence_signs: true } });
    const stats_4_6 = await getIndicatorStats({ ...p4, mainWhere: { disability_screening: { [Op.not]: [] } } });
    const stats_4_7 = await getIndicatorStats({ ...p4, mainWhere: { developmental_milestone: { [Op.in]: ['ND', 'SD', 'DD'] } } });
    const stats_4_8 = await getIndicatorStats({ ...p4, mainWhere: { developmental_milestone: 'SD' } });
    const stats_4_9 = await getIndicatorStats({ ...p4, mainWhere: { developmental_milestone: 'DD' } });
    const stats_4_10 = await getIndicatorStats({ ...p4, mainWhere: { referred_to_facility: true } });

    // --- Section 5: Care Giving Behaviors ---
    const getCareIds = async (where) => {
        const assessments = await ChildAssessment.findAll({
            where,
            include: [{
                model: HouseholdVisit,
                as: 'visit',
                required: true,
                where: {
                    ...(userId ? { visitor_id: userId } : {}),
                    visit_date: { [Op.between]: [startDate, endDate] }
                },
                ...(unitId ? {
                    include: [{ model: Family, as: 'Family', required: true, where: { block_id: { [Op.in]: blockIds } } }]
                } : [])
            }],
            attributes: [[fn('DISTINCT', col('visit.family_id')), 'family_id']],
            raw: true
        });
        return assessments.map(a => a.family_id);
    };

    const careIds_5_1 = await getCareIds({ [Op.or]: [{ talk_sing_frequency: { [Op.gt]: 0 } }, { play_frequency: { [Op.gt]: 0 } }, { story_read_frequency: { [Op.gt]: 0 } }] });
    const careIds_5_2 = await getCareIds({ outdoor_play_frequency: { [Op.gt]: 0 } });
    const careIds_5_3 = await getCareIds({ responsive_care: true });
    const careIds_5_4 = await getCareIds({ positive_discipline: { [Op.not]: [] } });

    const stats_5_1 = await getIndicatorStats({ ...baseParams, idField: 'family_id', entityModel: Family, mainModel: HouseholdVisit, mainWhere: { id: careIds_5_1 }, ageKey: 'guardian_dob', genderKey: 'guardian_gender', ageBrackets: { lt: 18, gt: 65 } });
    const stats_5_2 = await getIndicatorStats({ ...baseParams, idField: 'family_id', entityModel: Family, mainModel: HouseholdVisit, mainWhere: { id: careIds_5_2 }, ageKey: 'guardian_dob', genderKey: 'guardian_gender', ageBrackets: { lt: 18, gt: 65 } });
    const stats_5_3 = await getIndicatorStats({ ...baseParams, idField: 'family_id', entityModel: Family, mainModel: HouseholdVisit, mainWhere: { id: careIds_5_3 }, ageKey: 'guardian_dob', genderKey: 'guardian_gender', ageBrackets: { lt: 18, gt: 65 } });
    const stats_5_4 = await getIndicatorStats({ ...baseParams, idField: 'family_id', entityModel: Family, mainModel: HouseholdVisit, mainWhere: { id: careIds_5_4 }, ageKey: 'guardian_dob', genderKey: 'guardian_gender', ageBrackets: { lt: 18, gt: 65 } });

    return {
        section_1: { stats_1_1, stats_1_2, stats_1_3, stats_1_4 },
        section_2: { stats_2_1, stats_2_2, stats_2_3 },
        section_3: { stats_3_1, stats_3_2 },
        section_4: { stats_4_1, stats_4_2, stats_4_3, stats_4_4, stats_4_5, stats_4_6, stats_4_7, stats_4_8, stats_4_9, stats_4_10 },
        section_5: { stats_5_1, stats_5_2, stats_5_3, stats_5_4 }
    };
};

const getPCWorkerReportService = async (userId, startDate, endDate) => {
    return await getReportForContext(userId, null, startDate, endDate, endDate);
};

const getAggregateReportService = async (unitId, startDate, endDate) => {
    return await getReportForContext(null, unitId, startDate, endDate, endDate);
};

module.exports = {
    getPCWorkerReportService,
    getAggregateReportService
};
