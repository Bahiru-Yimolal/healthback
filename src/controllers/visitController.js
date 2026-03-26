const {
    startVisitService,
    updateVisitService,
    getVisitDetailsService,
    getFamilyVisitHistoryService
} = require("../services/visitService");

/**
 * POST /api/visits
 * Starts a new household visit
 */
const startVisitController = async (req, res, next) => {
    try {
        const visitData = {
            family_id: req.body.family_id,
            visitor_id: req.user.id, // Match the user_id path from token payload
            latitude: req.body.latitude,
            longitude: req.body.longitude
        };

        const visit = await startVisitService(visitData);

        return res.status(201).json({
            success: true,
            message: req.t("success.visit_started"),
            data: {
                visit_id: visit.id,
                visit_number: visit.visit_number
            }
        });
    } catch (error) {
        console.error("Error in startVisit controller:", error);

        // Following standard pattern: if it's a known error key, use it, otherwise pass to next
        if (error.message === "family_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.family_not_found")
            });
        }

        if (error.message === "pc_worker_unauthorized_visit") {
            return res.status(403).json({
                success: false,
                message: req.t("errors.pc_worker_unauthorized_visit")
            });
        }

        next(error);
    }
};

/**
 * PATCH /api/visits/:id
 * Updates an existing household visit
 */
const updateVisitController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const actor = req.user;

        const updatedVisit = await updateVisitService(id, updateData, actor);

        res.status(200).json({
            success: true,
            message: req.t("success.visit_updated"),
            data: updatedVisit
        });
    } catch (error) {
        if (error.message === "visit_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.visit_not_found")
            });
        }
        next(error);
    }
};

/**
 * GET /api/visits/:id
 * Fetches details of a household visit including assessments
 */
const getVisitDetailsController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const visitDetails = await getVisitDetailsService(id);

        res.status(200).json({
            success: true,
            message: req.t("success.visit_details_fetched"),
            data: visitDetails
        });
    } catch (error) {
        if (error.message === "visit_not_found") {
            return res.status(404).json({
                success: false,
                message: req.t("errors.visit_not_found")
            });
        }
        next(error);
    }
};

/**
 * GET /api/visits/family/:family_id
 * Fetches paginated visit history for a specific family
 */
const getFamilyVisitHistoryController = async (req, res, next) => {
    try {
        const { family_id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const history = await getFamilyVisitHistoryService(family_id, page, limit);

        res.status(200).json({
            success: true,
            message: req.t("success.visit_history_fetched", "Household visit history fetched successfully."),
            data: history
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    startVisitController,
    updateVisitController,
    getVisitDetailsController,
    getFamilyVisitHistoryController,
};
