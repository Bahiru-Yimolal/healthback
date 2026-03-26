const HouseholdVisit = require("../models/householdVisit");
const Family = require("../models/familyModel");
const UserAssignment = require("../models/userAssignment");
const PostnatalAssessment = require("../models/postnatalAssessment");
const PregnantAssessment = require("../models/pregnantAssessment");
const ChildAssessment = require("../models/childAssessment");
const Referral = require("../models/referral");
const sequelize = require("../config/database");

/**
 * Start a new household visit
 * @param {Object} visitData - Data for starting the visit
 * @returns {Object} - Created visit record
 */
const startVisitService = async (visitData) => {
    const { family_id, visitor_id, latitude, longitude } = visitData;

    // Verify family exists
    const family = await Family.findByPk(family_id);
    if (!family) {
        throw new Error("family_not_found");
    }

    // Authorization: Ensure PC worker is assigned to the family's block
    const assignment = await UserAssignment.findOne({
        where: {
            user_id: visitor_id,
            unit_id: family.block_id
        }
    });

    if (!assignment) {
        throw new Error("pc_worker_unauthorized_visit");
    }

    // Calculate visit number (count existing visits + 1)
    const visitCount = await HouseholdVisit.count({
        where: { family_id }
    });
    const visit_number = visitCount + 1;

    // Create the visit record
    const visit = await HouseholdVisit.create({
        family_id,
        visitor_id,
        visit_date: new Date(),
        visit_number,
        latitude,
        longitude,
        service_type: "ASSESSMENT" // Default type when starting a standard flow
    });

    return visit;
};

/**
 * Update an existing household visit
 * @param {string} visitId - ID of the visit to update
 * @param {Object} updateData - Data to update
 * @param {Object} actor - The user performing the update
 * @returns {Object} - Updated visit record
 */
const updateVisitService = async (visitId, updateData, actor) => {
    return await sequelize.transaction(async (t) => {
        const visit = await HouseholdVisit.findByPk(visitId, { transaction: t });

        if (!visit) {
            throw new Error("visit_not_found");
        }

        // Authorization: Only the original visitor or a supervisor can update
        if (visit.visitor_id !== actor.id) {
            // Check if supervisor (optional refinement later)
        }

        // Update allowed fields and prepare family sync data
        const allowedFields = [
            "next_appointment_date",
            "service_type",
            "is_eligible_for_support",
            "is_vulnerable",
            "course_completed"
        ];

        const familySyncMapping = {
            is_eligible_for_support: "is_temporary_direct_support_beneficiary",
            is_vulnerable: "is_vulnerable",
            course_completed: "course_completed"
        };

        const familyUpdateData = {};

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                visit[field] = updateData[field];

                // If it's a shared field, add to family update
                if (familySyncMapping[field]) {
                    familyUpdateData[familySyncMapping[field]] = updateData[field];
                }
            }
        });

        // 1. Save Visit
        await visit.save({ transaction: t });

        // 2. Sync to Family if any mapped fields changed
        if (Object.keys(familyUpdateData).length > 0) {
            await Family.update(familyUpdateData, {
                where: { id: visit.family_id },
                transaction: t
            });
        }

        return visit;
    });
};

/**
 * Get visit details including assessments
 * @param {string} visitId - ID of the visit
 * @returns {Object} - Visit record with assessments
 */
const getVisitDetailsService = async (visitId) => {
    const visit = await HouseholdVisit.findByPk(visitId, {
        include: [
            {
                model: PregnantAssessment,
                include: [{ model: Referral }]
            },
            {
                model: PostnatalAssessment,
                include: [{ model: Referral }]
            },
            {
                model: ChildAssessment,
                include: [{ model: Referral }]
            }
        ]
    });

    if (!visit) {
        throw new Error("visit_not_found");
    }

    return visit;
};

/**
 * Get visit history for a family with pagination
 * @param {string} familyId - ID of the family
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} - Paginated visit records
 */
const getFamilyVisitHistoryService = async (familyId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const { count, rows } = await HouseholdVisit.findAndCountAll({
        where: { family_id: familyId },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["visit_date", "DESC"]],
        include: [
            {
                model: PregnantAssessment,
                include: [{ model: Referral }]
            },
            {
                model: PostnatalAssessment,
                include: [{ model: Referral }]
            },
            {
                model: ChildAssessment,
                include: [{ model: Referral }]
            }
        ]
    });

    return {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        visits: rows
    };
};

module.exports = {
    startVisitService,
    updateVisitService,
    getVisitDetailsService,
    getFamilyVisitHistoryService,
};
