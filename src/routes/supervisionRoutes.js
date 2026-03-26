const express = require("express");
const router = express.Router();
const supervisionController = require("../controllers/supervisionController");
const { protect, assignmentMiddleware } = require("../middlewares/authMiddleware");

// All supervision routes require authentication and unit context
router.use(protect);
router.use(assignmentMiddleware);

/**
 * @route   POST /api/supervision
 * @desc    Submit a new supervision record
 */
router.post("/", supervisionController.createSupervision);

/**
 * @route   GET /api/supervision/history/:evaluateeId
 * @desc    Fetch all previous visits for a user
 */
router.get("/history/:evaluateeId", supervisionController.fetchHistory);

/**
 * @route   GET /api/supervision/latest/:evaluateeId
 * @desc    Fetch only the most recent visit
 */
router.get("/latest/:evaluateeId", supervisionController.fetchLatest);

/**
 * @route   GET /api/supervision/evaluator/:evaluatorId
 * @desc    Fetch all supervisions performed by an evaluator
 */
router.get("/evaluator/:evaluatorId", supervisionController.fetchByEvaluator);

/**
 * @route   GET /api/supervision/health-centers
 * @desc    Fetch supervisions for Health Centers with filtering and pagination
 * @access  Private (requires protect and assignmentMiddleware)
 */
router.get("/health-centers", supervisionController.getHealthCenterSupervisions);

/**
 * @route   GET /api/supervision/sub-cities
 * @desc    Fetch supervisions for Sub-cities with filtering and pagination
 * @access  Private (requires protect and assignmentMiddleware)
 */
router.get("/sub-cities", supervisionController.getSubcitySupervisions);

/**
 * @route   GET /api/supervision/cities
 * @desc    Fetch supervisions for Cities with filtering and pagination
 * @access  Private (requires protect and assignmentMiddleware)
 */
router.get("/cities", supervisionController.getCitySupervisions);

/**
 * @route   GET /api/supervision/:id
 * @desc    Fetch a single supervision record by ID
 */
router.get("/:id", supervisionController.getSupervisionDetail);

/**
 * @route   PUT /api/supervision/:id
 * @desc    Update an existing supervision record by ID
 */
router.put("/:id", supervisionController.updateSupervision);

/**
 * @route   DELETE /api/supervision/:id
 * @desc    Soft delete a supervision record by ID
 */
router.delete("/:id", supervisionController.deleteSupervision);

module.exports = router;
