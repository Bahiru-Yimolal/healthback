const { getBeneficiariesByAdminUnitService } = require("../services/beneficiaryService");

/**
 * Controller to fetch beneficiaries filtered by administrative units and assessment criteria.
 */
const getBeneficiariesByAdminUnitController = async (req, res, next) => {
  try {
    const {
      type, // 'pregnant', 'postpartum', 'child'
      block_id,
      ketena_id,
      woreda_id,
      health_center_id,
      subcity_id,
      city_id,
      search,
      page = 1,
      limit = 10,
      // Assessment filters (dynamic)
      ...assessmentFilters
    } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Missing beneficiary type. Must be 'pregnant', 'postpartum', or 'child'.",
      });
    }

    const filters = {
      type,
      block_id,
      ketena_id,
      woreda_id,
      health_center_id,
      subcity_id,
      city_id,
      search,
      ...assessmentFilters
    };

    const result = await getBeneficiariesByAdminUnitService(
      filters,
      page,
      limit,
      req.user
    );

    res.status(200).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} beneficiaries filtered successfully.`,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBeneficiariesByAdminUnitController,
};
