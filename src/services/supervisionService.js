const { SupervisionRecord, User, AdministrativeUnit } = require("../models");
const { Op } = require("sequelize");
const { AppError } = require("../middlewares/errorMiddleware");

/**
 * Creates a new supervision record with automated frequency counting
 */
const createSupervisionRecord = async (data) => {
  const {
    evaluator_id,
    evaluatee_id,
    unit_id,
    level,
    scores,
    na_explanations,
    strong_points,
    recommendations,
    supervisor_name,
    mentor_name,
    authority_name,
    next_appointment_date,
    latitude,
    longitude
  } = data;

  // 1. Calculate Automated Visit Counter
  const previousVisitCount = await SupervisionRecord.count({
    where: { evaluatee_id }
  });
  const currentVisitNumber = previousVisitCount + 1;

  // 2. Perform Scoring Logic (Achieved / (Total - N/A))
  let achievedSum = 0;
  let possibleCount = 0;

  Object.values(scores).forEach(val => {
    if (val !== "NA" && val !== null) {
      achievedSum += parseFloat(val) || 0;
      possibleCount += 1;
    }
  });

  const percentage = possibleCount > 0 ? (achievedSum / possibleCount) * 100 : 0;

  // 3. Create the record
  const record = await SupervisionRecord.create({
    evaluator_id,
    evaluatee_id,
    unit_id,
    level,
    mentoring_visit: currentVisitNumber,
    scores,
    total_possible_score: possibleCount,
    total_achieved_score: achievedSum,
    percentage_achieved: parseFloat(percentage.toFixed(2)),
    na_explanations,
    strong_points,
    recommendations,
    supervisor_name,
    mentor_name,
    authority_name,
    next_appointment_date,
    latitude,
    longitude,
    verification_date: new Date(),
    status: "COMPLETED"
  });

  return record;
};

/**
 * Retrieves the full supervision history for a specific worker/admin
 */
const getEvaluateeHistory = async (evaluateeId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await SupervisionRecord.findAndCountAll({
    where: { evaluatee_id: evaluateeId },
    order: [["mentoring_visit", "ASC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [
      { model: User, as: "Evaluator", attributes: ["first_name", "last_name"] },
      { model: AdministrativeUnit, as: "Unit", attributes: ["name", "level"] }
    ]
  });

  return {
    total: count,
    pages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: rows
  };
};

/**
 * Gets the most recent supervision report
 */
const getLatestReport = async (evaluateeId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await SupervisionRecord.findAndCountAll({
    where: { evaluatee_id: evaluateeId },
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    total: count,
    pages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: rows
  };
};

/**
 * Retrieves the supervisions performed by a specific evaluator
 */
const getSupervisionsByEvaluator = async (evaluatorId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await SupervisionRecord.findAndCountAll({
    where: { evaluator_id: evaluatorId },
    order: [["createdAt", "DESC"]], // or "mentoring_visit" DESC
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [
      { model: User, as: "Evaluatee", attributes: ["first_name", "last_name", "username"] },
      { model: AdministrativeUnit, as: "Unit", attributes: ["name", "level"] }
    ]
  });

  return {
    total: count,
    pages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: rows
  };
};

/**
 * Get filtered supervisions for specific levels (Health Centers or Sub-cities)
 */
const getFilteredSupervisions = async (query) => {
  const {
    level, // 'HEALTH_CENTER' or 'SUBCITY'
    unit_id,
    status,
    evaluatee_id,
    evaluator_id,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    user_unit_id,
    user_level
  } = query;

  let where = {};
  if (level) where.level = level;
  if (status) where.status = status;
  if (evaluatee_id) where.evaluatee_id = evaluatee_id;
  if (evaluator_id) where.evaluator_id = evaluator_id;

  // Date range filtering
  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  } else if (startDate) {
    where.createdAt = { [Op.gte]: new Date(startDate) };
  } else if (endDate) {
    where.createdAt = { [Op.lte]: new Date(endDate) };
  }

  // --- Hierarchical Filtering ---
  if (user_level === 'SUBCITY') {
    // If specific unit_id provided (e.g., from HC selector), use it
    if (unit_id) {
      where.unit_id = unit_id;
    } else {
      // Find all HCs under this Subcity to show aggregated data
      const subUnits = await AdministrativeUnit.findAll({
        where: { parent_id: user_unit_id, level: 'HEALTH_CENTER' },
        attributes: ['id']
      });
      const unitIds = [user_unit_id, ...subUnits.map(u => u.id)]; // Include themselves and their HCs
      where.unit_id = { [Op.in]: unitIds };
    }
  } else if (user_level === 'CITY') {
    if (unit_id) where.unit_id = unit_id;
    // Otherwise show all (no unit_id filter)
  } else if (user_level === 'HEALTH_CENTER') {
    if (unit_id) {
      where.unit_id = unit_id;
    } else {
      // Find all Woredas directly assigned to HC
      const woredas = await AdministrativeUnit.findAll({ where: { parent_id: user_unit_id }, attributes: ['id'] });
      const woredaIds = woredas.map(u => u.id);

      // Find all Ketenas under those Woredas
      const ketenas = woredaIds.length ? await AdministrativeUnit.findAll({ where: { parent_id: { [Op.in]: woredaIds } }, attributes: ['id'] }) : [];
      const ketenaIds = ketenas.map(u => u.id);

      // Find all Blocks under those Ketenas  
      const blocks = ketenaIds.length ? await AdministrativeUnit.findAll({ where: { parent_id: { [Op.in]: ketenaIds } }, attributes: ['id'] }) : [];

      const allDescendantIds = [
        user_unit_id,
        ...woredaIds,
        ...ketenaIds,
        ...blocks.map(u => u.id)
      ];
      where.unit_id = { [Op.in]: allDescendantIds };
    }
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await SupervisionRecord.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [
      { model: User, as: "Evaluatee", attributes: ["first_name", "last_name", "username"] },
      { model: User, as: "Evaluator", attributes: ["first_name", "last_name"] },
      { model: AdministrativeUnit, as: "Unit", attributes: ["name", "level"] }
    ],
    order: [["createdAt", "DESC"]]
  });

  return {
    total: count,
    pages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: rows
  };
};

/**
 * Fetch a single supervision record by ID with associations
 */
const getSupervisionById = async (id) => {
  return await SupervisionRecord.findByPk(id, {
    include: [
      { model: User, as: "Evaluatee", attributes: ["first_name", "last_name", "username"] },
      { model: User, as: "Evaluator", attributes: ["first_name", "last_name"] },
      { model: AdministrativeUnit, as: "Unit", attributes: ["name", "level"] }
    ]
  });
};

/**
 * Updates an existing supervision record
 */
const updateSupervisionRecord = async (id, data, currentUserId) => {
  const record = await SupervisionRecord.findByPk(id);

  if (!record) {
    throw new AppError("errors.supervision_not_found", 404);
  }

  // If scores are being updated, we must recalculate totals
  if (data.scores) {
    let achievedSum = 0;
    let possibleCount = 0;

    Object.values(data.scores).forEach(val => {
      if (val !== "NA" && val !== null) {
        achievedSum += parseFloat(val) || 0;
        possibleCount += 1;
      }
    });

    const percentage = possibleCount > 0 ? (achievedSum / possibleCount) * 100 : 0;

    data.total_possible_score = possibleCount;
    data.total_achieved_score = achievedSum;
    data.percentage_achieved = parseFloat(percentage.toFixed(2));
  }

  // Prevent modifying critical base identifiers
  delete data.evaluatee_id;
  delete data.evaluator_id;
  delete data.unit_id;
  delete data.level;

  await record.update(data);
  return record;
};

/**
 * Soft deletes a supervision record
 */
const deleteSupervisionRecord = async (id, currentUserId) => {
  const record = await SupervisionRecord.findByPk(id);

  if (!record) {
    throw new AppError("errors.supervision_not_found", 404);
  }

  // Soft delete using Sequelize's paranoid feature
  await record.destroy();
  return true;
};

module.exports = {
  createSupervisionRecord,
  getEvaluateeHistory,
  getLatestReport,
  getSupervisionsByEvaluator,
  getFilteredSupervisions,
  getSupervisionById,
  updateSupervisionRecord,
  deleteSupervisionRecord
};
