const express = require("express");
const { protect, assignmentMiddleware, permissionMiddleware } = require("../middlewares/authMiddleware");
const { getPCWorkerReportController, getAggregateReportController } = require("../controllers/reportController");

const router = express.Router();

// GET /api/reports/worker
router.get(
    "/worker",
    protect,
    assignmentMiddleware,
    permissionMiddleware("EXPORT_REPORTS"),
    getPCWorkerReportController
);

// GET /api/reports/aggregate
router.get(
    "/aggregate",
    protect,
    assignmentMiddleware,
    permissionMiddleware("EXPORT_REPORTS"),
    getAggregateReportController
);

module.exports = router;
