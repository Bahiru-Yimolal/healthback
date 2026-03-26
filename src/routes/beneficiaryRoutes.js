const express = require("express");
const { protect, assignmentMiddleware } = require("../middlewares/authMiddleware");
const { getBeneficiariesByAdminUnitController } = require("../controllers/beneficiaryControllers");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Beneficiaries
 *   description: Beneficiary specific filtering and assessment lists
 */

// Filter beneficiaries (pregnant, postpartum, child) by administrative units and assessment criteria
router.get(
    "/filter",
    protect,
    assignmentMiddleware,
    getBeneficiariesByAdminUnitController
);

module.exports = router;
