const supervision = require("../services/supervisionService");
const { AppError } = require("../middlewares/errorMiddleware");

/**
 * Controller to handle the submission of a new supervision record
 */
const createSupervision = async (req, res, next) => {
  try {
    const {
      evaluatee_id,
      evaluator_id: body_evaluator_id,
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
    } = req.body;

    // Use current logged-in user as Evaluator or fallback to body payload
    const evaluator_id = req.user?.id || body_evaluator_id;

    // Call service to handle logic
    const record = await supervision.createSupervisionRecord({
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
    });

    res.status(201).json({
      success: true,
      message: "Supervision finalized successfully",
      record
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch the history of a specific person
 */
const fetchHistory = async (req, res, next) => {
  try {
    const { evaluateeId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const history = await supervision.getEvaluateeHistory(evaluateeId, page, limit);

    res.status(200).json({
      success: true,
      ...history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch the last progress of a person
 */
const fetchLatest = async (req, res, next) => {
  try {
    const { evaluateeId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const latest = await supervision.getLatestReport(evaluateeId, page, limit);

    res.status(200).json({
      success: true,
      ...latest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch supervisions performed by a specific evaluator
 */
const fetchByEvaluator = async (req, res, next) => {
  try {
    const { evaluatorId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const supervisions = await supervision.getSupervisionsByEvaluator(evaluatorId, page, limit);

    res.status(200).json({
      success: true,
      ...supervisions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch supervisions for Health Centers
 */
const getHealthCenterSupervisions = async (req, res, next) => {
  try {
    const filters = {
      ...req.query,
      level: 'HEALTH_CENTER',
      user_unit_id: req.user.unit.id,
      user_level: req.user.unit.level
    };
    const result = await supervision.getFilteredSupervisions(filters);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch supervisions for Sub-cities
 */
const getSubcitySupervisions = async (req, res, next) => {
  try {
    const filters = {
      ...req.query,
      level: 'SUBCITY',
      user_unit_id: req.user.unit.id,
      user_level: req.user.unit.level
    };
    const result = await supervision.getFilteredSupervisions(filters);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch a single supervision record by ID
 */
const getSupervisionDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await supervision.getSupervisionById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch supervisions for Cities
 */
const getCitySupervisions = async (req, res, next) => {
  try {
    const filters = {
      ...req.query,
      level: 'CITY',
      user_unit_id: req.user.unit.id,
      user_level: req.user.unit.level
    };
    const result = await supervision.getFilteredSupervisions(filters);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing supervision record
 */
const updateSupervision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // User performing the update
    const currentUserId = req.user.payload ? req.user.payload.user_id : req.user.id;

    const updatedRecord = await supervision.updateSupervisionRecord(id, updateData, currentUserId);

    res.status(200).json({
      success: true,
      message: "Supervision record updated successfully",
      record: updatedRecord
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete (Soft Delete) an existing supervision record
 */
const deleteSupervision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.payload ? req.user.payload.user_id : req.user.id;

    await supervision.deleteSupervisionRecord(id, currentUserId);

    res.status(200).json({
      success: true,
      message: "Supervision record deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSupervision,
  fetchHistory,
  fetchLatest,
  fetchByEvaluator,
  getHealthCenterSupervisions,
  getSubcitySupervisions,
  getCitySupervisions,
  getSupervisionDetail,
  updateSupervision,
  deleteSupervision
};
