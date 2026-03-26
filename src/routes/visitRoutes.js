const express = require("express");
const {
    protect,
    assignmentMiddleware,
    permissionMiddleware,
} = require("../middlewares/authMiddleware");

const {
    validateVisitStartingInput,
    validateVisitUpdateInput,
} = require("../validators/visitValidator");
const {
    startVisitController,
    updateVisitController,
    getVisitDetailsController,
    getFamilyVisitHistoryController,
} = require("../controllers/visitController");

const router = express.Router();

// Start Visit
router.post(
    "/",
    protect,
    assignmentMiddleware,
    permissionMiddleware("MANAGE_VISITS"),
    validateVisitStartingInput,
    startVisitController
);

// Update Visit
router.patch(
    "/:id",
    protect,
    assignmentMiddleware,
    permissionMiddleware("MANAGE_VISITS"),
    validateVisitUpdateInput,
    updateVisitController
);

/**
 * @route GET /api/visits/:id
 * @desc Get visit details including assessments
 * @access Private (PC Worker)
 */
router.get(
    "/:id",
    protect,
    assignmentMiddleware,
    permissionMiddleware("MANAGE_VISITS"),
    getVisitDetailsController
);

/**
 * @route GET /api/visits/family/:family_id
 * @desc Get visit history for a family with pagination
 * @access Private (PC Worker)
 */
router.get(
    "/family/:family_id",
    protect,
    assignmentMiddleware,
    permissionMiddleware("MANAGE_VISITS"),
    getFamilyVisitHistoryController
);

module.exports = router;
