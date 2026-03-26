const express = require("express");
const {
    protect,
    assignmentMiddleware,
    permissionMiddleware,
} = require("../middlewares/authMiddleware");

const {
    validatePregnantAssessmentInput,
    validatePregnantAssessmentUpdateInput,
    validatePostnatalAssessmentInput,
    validatePostnatalAssessmentUpdateInput,
    validateChildAssessmentInput,
    validateChildAssessmentUpdateInput,
} = require("../validators/assessmentValidators");

const {
    createPregnantAssessmentController,
    updatePregnantAssessmentController,
    getPregnantAssessmentByIdController,
    deletePregnantAssessmentController,
    createPostnatalAssessmentController,
    updatePostnatalAssessmentController,
    getPostnatalAssessmentByIdController,
    deletePostnatalAssessmentController,
    createChildAssessmentController,
    updateChildAssessmentController,
    getChildAssessmentByIdController,
    deleteChildAssessmentController,
} = require("../controllers/assessmentControllers");

const router = express.Router();

/**
 * @route POST /api/assessments/pregnant
 * @desc Record a pregnant assessment
 * @access Private (PC Worker)
 */
router.post(
    "/pregnant",
    protect,
    assignmentMiddleware,
    permissionMiddleware("MANAGE_VISITS"),
    validatePregnantAssessmentInput,
    createPregnantAssessmentController
);

/**
 * @route PATCH /api/assessments/pregnant/:id
 * @desc Update a pregnant assessment
 * @access Private (PC Worker)
 */
router.patch(
    "/pregnant/:id",
    protect,
    assignmentMiddleware,
    permissionMiddleware("MANAGE_VISITS"),
    validatePregnantAssessmentUpdateInput,
    updatePregnantAssessmentController
);

/**
 * @route GET /api/assessments/pregnant/:id
 * @desc Get a pregnant assessment by ID
 * @access Private (PC Worker)
 */
router.get(
    "/pregnant/:id",
    protect,
    assignmentMiddleware,
    permissionMiddleware("MANAGE_VISITS"),
    getPregnantAssessmentByIdController
);

/**
 * @route POST /api/assessments/postnatal
 * @desc Record a postnatal assessment
 * @access Private (PC Worker)
 */
router.post(
    "/postnatal",
    protect,
    assignmentMiddleware,
    permissionMiddleware("MANAGE_VISITS"),
    validatePostnatalAssessmentInput,
    createPostnatalAssessmentController
);

/**
 * @route GET/PATCH/DELETE /api/assessments/postnatal/:id
 * @desc Get, Update or Delete a postnatal assessment
 * @access Private (PC Worker)
 */
router.get(
    "/postnatal/:id",
    protect,
    assignmentMiddleware,
    permissionMiddleware("MANAGE_VISITS"),
    getPostnatalAssessmentByIdController
);

router.patch(
    "/postnatal/:id",
    protect,
    assignmentMiddleware,
    permissionMiddleware("MANAGE_VISITS"),
    validatePostnatalAssessmentUpdateInput,
    updatePostnatalAssessmentController
);

router.delete(
    "/postnatal/:id",
    protect,
    assignmentMiddleware,
    permissionMiddleware("MANAGE_VISITS"),
    deletePostnatalAssessmentController
);

router.delete(
    "/pregnant/:id",
    protect,
    assignmentMiddleware,
    permissionMiddleware("MANAGE_VISITS"),
    deletePregnantAssessmentController
);

/**
 * @route POST/PATCH /api/assessments/child
 * @desc Record or Update a child assessment
 * @access Private (PC Worker)
 */
router.post(
    "/child",
    protect,
    assignmentMiddleware,
    permissionMiddleware("MANAGE_VISITS"),
    validateChildAssessmentInput,
    createChildAssessmentController
);

router.patch(
    "/child/:id",
    protect,
    assignmentMiddleware,
    permissionMiddleware("MANAGE_VISITS"),
    validateChildAssessmentUpdateInput,
    updateChildAssessmentController
);

router.get(
    "/child/:id",
    protect,
    assignmentMiddleware,
    permissionMiddleware("MANAGE_VISITS"),
    getChildAssessmentByIdController
);

router.delete(
    "/child/:id",
    protect,
    assignmentMiddleware,
    permissionMiddleware("MANAGE_VISITS"),
    deleteChildAssessmentController
);

module.exports = router;
