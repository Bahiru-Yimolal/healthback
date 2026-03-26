const { getPCWorkerReportService, getAggregateReportService } = require("../services/reportService");
const AdministrativeUnit = require("../models/administrativeUnitModel");

/**
 * GET /api/reports/worker
 * Generates the PC Worker level activity and assessment report
 */
const getPCWorkerReportController = async (req, res, next) => {
    // ... (logic remains same, just ensuring export is correct)
    try {
        const { startDate, endDate, userId } = req.query;

        if (!startDate || !endDate || !userId) {
            return res.status(400).json({
                success: false,
                message: req.t("errors.field_required", { field: "startDate, endDate, and userId" })
            });
        }

        const report = await getPCWorkerReportService(userId, startDate, endDate);

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error("Error in getPCWorkerReportController:", error);
        next(error);
    }
};

/**
 * GET /api/reports/aggregate
 * Generates aggregate reports for HC, Subcity, City, or Ethiopia level
 */
const getAggregateReportController = async (req, res, next) => {
    try {
        const { startDate, endDate, unitId } = req.query;

        if (!startDate || !endDate || !unitId) {
            return res.status(400).json({
                success: false,
                message: req.t("errors.field_required", { field: "startDate, endDate, and unitId" })
            });
        }

        // Check if Administrative Unit exists
        const unit = await AdministrativeUnit.findByPk(unitId);
        if (!unit) {
            return res.status(404).json({
                success: false,
                message: req.t("errors.not_found", { item: "Administrative Unit" })
            });
        }

        const report = await getAggregateReportService(unitId, startDate, endDate);

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error("Error in getAggregateReportController:", error);
        next(error);
    }
};

module.exports = {
    getPCWorkerReportController,
    getAggregateReportController
};
