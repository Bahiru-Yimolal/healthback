const { Op, literal } = require("sequelize");
const {
  Family,
  PregnantMother,
  LactatingMother,
  Child,
  AdministrativeUnit,
  PregnantAssessment,
  PostnatalAssessment,
  ChildAssessment,
  HouseholdVisit,
  User,
} = require("../models");
const sequelize = require("../config/database");
const { AppError } = require("../middlewares/errorMiddleware");

/**
 * Builds a robust administrative unit include for filtering, with hierarchical defaults.
 * Replicates the logic from familyService.js for consistency.
 */
const buildAdminFilter = (filters, user) => {
  const { block_id, ketena_id, woreda_id, health_center_id, subcity_id, city_id } = filters;
  const { level: userLevel, id: userUnitId } = user.unit;

  const hasAdminFilter = block_id || ketena_id || woreda_id || health_center_id || subcity_id || city_id;

  let effectiveBlockId = block_id;
  let effectiveKetenaId = ketena_id;
  let effectiveWoredaId = woreda_id;
  let effectiveHealthCenterId = health_center_id;
  let effectiveSubcityId = subcity_id;
  let effectiveCityId = city_id;

  // Data Scoping: If no filter provided, default to user's level
  if (!hasAdminFilter) {
    if (userLevel === "BLOCK") effectiveBlockId = userUnitId;
    else if (userLevel === "KETENA") effectiveKetenaId = userUnitId;
    else if (userLevel === "WOREDA") effectiveWoredaId = userUnitId;
    else if (userLevel === "HEALTH_CENTER") effectiveHealthCenterId = userUnitId;
    else if (userLevel === "SUBCITY") effectiveSubcityId = userUnitId;
    else if (userLevel === "CITY") effectiveCityId = userUnitId;
  }

  // TODO: Add strict scoping check here if needed (e.g. user at HC level trying to see other HC)
  // For now, following familyService.js pattern which trusts the effective IDs if provided.

  let blockInclude = {
    model: AdministrativeUnit,
    as: "Block",
    required: !!(effectiveBlockId || effectiveKetenaId || effectiveWoredaId || effectiveHealthCenterId || effectiveSubcityId || effectiveCityId),
    include: [
      {
        model: AdministrativeUnit,
        as: "ParentUnit", // Ketena
        include: [
          {
            model: AdministrativeUnit,
            as: "ParentUnit", // Woreda
          },
        ],
      },
    ],
  };

  let familyWhere = {};
  if (effectiveBlockId) {
    familyWhere.block_id = effectiveBlockId;
  } else if (effectiveKetenaId) {
    blockInclude.where = { parent_id: effectiveKetenaId };
  } else if (effectiveWoredaId) {
    blockInclude.include = [{
      model: AdministrativeUnit,
      as: "ParentUnit",
      where: { parent_id: effectiveWoredaId },
      required: true,
    }];
  } else if (effectiveHealthCenterId) {
    blockInclude.include = [{
      model: AdministrativeUnit,
      as: "ParentUnit",
      required: true,
      include: [{
        model: AdministrativeUnit,
        as: "ParentUnit",
        where: { parent_id: effectiveHealthCenterId },
        required: true,
      }]
    }];
  } else if (effectiveSubcityId) {
    blockInclude.include = [{
        model: AdministrativeUnit,
        as: "ParentUnit",
        required: true,
        include: [{
          model: AdministrativeUnit,
          as: "ParentUnit",
          required: true,
          include: [{
            model: AdministrativeUnit,
            as: "ParentUnit",
            where: { parent_id: effectiveSubcityId },
            required: true,
          }]
        }]
      }];
  } else if (effectiveCityId) {
    blockInclude.include = [{
        model: AdministrativeUnit,
        as: "ParentUnit",
        required: true,
        include: [{
          model: AdministrativeUnit,
          as: "ParentUnit",
          required: true,
          include: [{
            model: AdministrativeUnit,
            as: "ParentUnit",
            required: true,
            include: [{
                model: AdministrativeUnit,
                as: "ParentUnit",
                where: { parent_id: effectiveCityId },
                required: true,
            }]
          }]
        }]
      }];
  }

  return { blockInclude, familyWhere };
};

const getBeneficiariesByAdminUnitService = async (filters, page, limit, user) => {
  try {
    const { type, search, ...assessmentFilters } = filters;
    const offset = (page - 1) * limit;

    let Model, AssessmentModel, assessmentTable, foreignKey;
    if (type === "pregnant") {
      Model = PregnantMother;
      AssessmentModel = PregnantAssessment;
      assessmentTable = "PregnantAssessments";
      foreignKey = "mother_id";
    } else if (type === "postpartum") {
      Model = LactatingMother;
      AssessmentModel = PostnatalAssessment;
      assessmentTable = "PostnatalAssessments";
      foreignKey = "mother_id";
    } else if (type === "child") {
      Model = Child;
      AssessmentModel = ChildAssessment;
      assessmentTable = "ChildAssessments";
      foreignKey = "child_id";
    } else {
      throw new AppError("Invalid beneficiary type.", 400);
    }

    const { blockInclude, familyWhere } = buildAdminFilter(filters, user);

    if (search) {
      familyWhere[Op.or] = [
        { head_of_household_name: { [Op.iLike]: `%${search}%` } },
        { registration_number: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Build assessment-specific where clauses via subqueries
    let modelWhere = {};
    const subqueryConditions = [];

    // Common filters
    const commonAssessmentFilters = ["referred_to_facility", "substance_use", "maternal_depression_signs", "violence_signs"];
    
    // Type-specific filters
    const childSpecificFilters = ["nutritional_status", "up_to_date_vaccination", "developmental_milestone", "has_books", "plays_with_toys"];
    const pregnantSpecificFilters = ["anc_followup_started", "anc_followup_dropped", "iron_folic_acid_supplement"];
    const postpartumSpecificFilters = ["pnc_followup_started", "pnc_followup_dropped"];

    const allowedAssessmentFilters = [...commonAssessmentFilters, ...childSpecificFilters, ...pregnantSpecificFilters, ...postpartumSpecificFilters];

    Object.keys(assessmentFilters).forEach(key => {
        const val = assessmentFilters[key];
        if (val !== undefined && val !== null && val !== "" && allowedAssessmentFilters.includes(key)) {
            subqueryConditions.push(`ca."${key}" = '${val}'`);
        }
    });

    if (subqueryConditions.length > 0) {
        modelWhere[Op.and] = [
            literal(`
                EXISTS (
                    SELECT 1 FROM "${assessmentTable}" ca
                    WHERE ca."${foreignKey}" = "${Model.name}".id
                    AND ${subqueryConditions.join(" AND ")}
                    AND ca.id = (
                        SELECT id FROM "${assessmentTable}" ca2
                        WHERE ca2."${foreignKey}" = "${Model.name}".id
                        ORDER BY ca2."createdAt" DESC LIMIT 1
                    )
                )
            `)
        ];
    }

    const { count, rows } = await Model.findAndCountAll({
      where: modelWhere,
      include: [
        {
          model: Family,
          where: familyWhere,
          required: true,
          include: [blockInclude],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    // Efficiently fetch latest assessments for the returned rows
    const enrichedBeneficiaries = await Promise.all(
      rows.map(async (beneficiary) => {
        const beneficiaryJson = beneficiary.toJSON();
        const latestAssessment = await AssessmentModel.findOne({
          where: { [foreignKey]: beneficiary.id },
          include: [
            {
              model: HouseholdVisit,
              as: "visit",
              attributes: ["latitude", "longitude", "visit_date", "visit_number"],
            },
          ],
          order: [["createdAt", "DESC"]],
        });
        beneficiaryJson.latest_assessment = latestAssessment;
        return beneficiaryJson;
      })
    );

    return {
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
      data: enrichedBeneficiaries,
    };
  } catch (error) {
    console.error("Fetch Beneficiaries Error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError("errors.internal_error", 500);
  }
};

module.exports = {
  getBeneficiariesByAdminUnitService,
};
