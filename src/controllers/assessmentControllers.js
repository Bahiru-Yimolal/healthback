const {
    createPregnantAssessmentService,
    updatePregnantAssessmentService,
    getPregnantAssessmentByIdService,
    deletePregnantAssessmentService,
    createPostnatalAssessmentService,
    updatePostnatalAssessmentService,
    getPostnatalAssessmentByIdService,
    deletePostnatalAssessmentService,
    createChildAssessmentService,
    updateChildAssessmentService,
    getChildAssessmentByIdService,
    deleteChildAssessmentService,
} = require("../services/assessmentService");

/**
 * POST /api/assessments/pregnant
 * Records a new pregnant assessment
 */
const createPregnantAssessmentController = async (req, res, next) => {
    try {
        const assessment = await createPregnantAssessmentService(req.body);

        res.status(201).json({
            success: true,
            message: req.t("success.pregnant_assessment_created"),
            data: assessment
        });
    } catch (error) {
        if (error.message === "visit_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.visit_not_found")
            });
        }
        if (error.message === "pregnant_mother_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.pregnant_mother_not_found")
            });
        }
        next(error);
    }
};

/**
 * PATCH /api/assessments/pregnant/:id
 * Updates an existing pregnant assessment
 */
const updatePregnantAssessmentController = async (req, res, next) => {
    try {
        const assessment = await updatePregnantAssessmentService(req.params.id, req.body);

        res.status(200).json({
            success: true,
            message: req.t("success.pregnant_assessment_updated"),
            data: assessment
        });
    } catch (error) {
        if (error.message === "pregnant_assessment_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.pregnant_assessment_not_found")
            });
        }
        if (error.message === "referral_already_processed") {
            return res.status(400).json({
                success: false,
                message: req.t("errors.referral_already_processed")
            });
        }
        next(error);
    }
};

/**
 * GET /api/assessments/pregnant/:id
 * Retrieves a single pregnant assessment
 */
const getPregnantAssessmentByIdController = async (req, res, next) => {
    try {
        const assessment = await getPregnantAssessmentByIdService(req.params.id);

        res.status(200).json({
            success: true,
            data: assessment
        });
    } catch (error) {
        if (error.message === "pregnant_assessment_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.pregnant_assessment_not_found")
            });
        }
        next(error);
    }
};

/**
 * POST /api/assessments/postnatal
 * Record a postnatal assessment
 */
const createPostnatalAssessmentController = async (req, res, next) => {
    try {
        const assessment = await createPostnatalAssessmentService(req.body);

        res.status(201).json({
            success: true,
            message: req.t("success.postnatal_assessment_created"),
            data: assessment
        });
    } catch (error) {
        if (error.message === "visit_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.visit_not_found")
            });
        }
        if (error.message === "lactating_mother_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.lactating_mother_not_found")
            });
        }
        next(error);
    }
};

/**
 * PATCH /api/assessments/postnatal/:id
 * Update a postnatal assessment
 */
const updatePostnatalAssessmentController = async (req, res, next) => {
    try {
        const assessment = await updatePostnatalAssessmentService(req.params.id, req.body);

        res.status(200).json({
            success: true,
            message: req.t("success.postnatal_assessment_updated"),
            data: assessment
        });
    } catch (error) {
        if (error.message === "postnatal_assessment_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.postnatal_assessment_not_found")
            });
        }
        if (error.message === "referral_already_processed") {
            return res.status(400).json({
                success: false,
                message: req.t("errors.referral_already_processed")
            });
        }
        next(error);
    }
};

/**
 * GET /api/assessments/postnatal/:id
 * Get a postnatal assessment by ID
 */
const getPostnatalAssessmentByIdController = async (req, res, next) => {
    try {
        const assessment = await getPostnatalAssessmentByIdService(req.params.id);

        res.status(200).json({
            success: true,
            data: assessment
        });
    } catch (error) {
        if (error.message === "postnatal_assessment_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.postnatal_assessment_not_found")
            });
        }
        next(error);
    }
};

/**
 * DELETE /api/assessments/pregnant/:id
 * Delete a pregnant assessment
 */
const deletePregnantAssessmentController = async (req, res, next) => {
    try {
        await deletePregnantAssessmentService(req.params.id);

        res.status(200).json({
            success: true,
            message: req.t("success.pregnant_assessment_deleted")
        });
    } catch (error) {
        if (error.message === "pregnant_assessment_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.pregnant_assessment_not_found")
            });
        }
        if (error.message === "referral_already_processed") {
            return res.status(400).json({
                success: false,
                message: req.t("errors.referral_already_processed")
            });
        }
        next(error);
    }
};

/**
 * DELETE /api/assessments/postnatal/:id
 * Delete a postnatal assessment
 */
const deletePostnatalAssessmentController = async (req, res, next) => {
    try {
        await deletePostnatalAssessmentService(req.params.id);

        res.status(200).json({
            success: true,
            message: req.t("success.postnatal_assessment_deleted")
        });
    } catch (error) {
        if (error.message === "postnatal_assessment_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.postnatal_assessment_not_found")
            });
        }
        if (error.message === "referral_already_processed") {
            return res.status(400).json({
                success: false,
                message: req.t("errors.referral_already_processed")
            });
        }
        next(error);
    }
};

/**
 * POST /api/assessments/child
 * Record a child assessment
 */
const createChildAssessmentController = async (req, res, next) => {
    try {
        const assessment = await createChildAssessmentService(req.body);

        res.status(201).json({
            success: true,
            message: req.t("success.child_assessment_created"),
            data: assessment
        });
    } catch (error) {
        if (error.message === "visit_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.visit_not_found")
            });
        }
        if (error.message === "child_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.child_not_found")
            });
        }
        next(error);
    }
};

/**
 * PATCH /api/assessments/child/:id
 * Update a child assessment
 */
const updateChildAssessmentController = async (req, res, next) => {
    try {
        const assessment = await updateChildAssessmentService(req.params.id, req.body);

        res.status(200).json({
            success: true,
            message: req.t("success.child_assessment_updated"),
            data: assessment
        });
    } catch (error) {
        if (error.message === "child_assessment_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.child_assessment_not_found")
            });
        }
        if (error.message === "referral_already_processed") {
            return res.status(400).json({
                success: false,
                message: req.t("errors.referral_already_processed")
            });
        }
        next(error);
    }
};

/**
 * GET /api/assessments/child/:id
 * Get child assessment by ID
 */
const getChildAssessmentByIdController = async (req, res, next) => {
    try {
        const assessment = await getChildAssessmentByIdService(req.params.id);

        res.status(200).json({
            success: true,
            data: assessment
        });
    } catch (error) {
        if (error.message === "child_assessment_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.child_assessment_not_found")
            });
        }
        next(error);
    }
};

/**
 * DELETE /api/assessments/child/:id
 * Delete a child assessment
 */
const deleteChildAssessmentController = async (req, res, next) => {
    try {
        await deleteChildAssessmentService(req.params.id);

        res.status(200).json({
            success: true,
            message: req.t("success.child_assessment_deleted")
        });
    } catch (error) {
        if (error.message === "child_assessment_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.child_assessment_not_found")
            });
        }
        if (error.message === "referral_already_processed") {
            return res.status(400).json({
                success: false,
                message: req.t("errors.referral_already_processed")
            });
        }
        next(error);
    }
};

module.exports = {
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
};
