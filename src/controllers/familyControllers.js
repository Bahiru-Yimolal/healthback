const {
  createFamilyService,
  updateFamilyService,
  deleteFamilyService,
  getFamilyByIdService,
  getFamiliesByCreatorService,
  getFamiliesByAdminUnitService,
  getAssignedFamiliesService,
} = require("../services/familyService");

const createFamilyController = async (req, res, next) => {
  try {
    // req.body contains the unified family JSON block
    const newFamily = await createFamilyService(req.body, req.user);

    res.status(201).json({
      success: true,
      message: req.t("success.family_created"),
      data: newFamily,
    });
  } catch (error) {
    next(error);
  }
};

const updateFamilyController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedFamily = await updateFamilyService(id, req.body, req.user);

    res.status(200).json({
      success: true,
      message: req.t("success.family_updated"),
      data: updatedFamily,
    });
  } catch (error) {
    next(error);
  }
};

const deleteFamilyController = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteFamilyService(id, req.user);

    res.status(200).json({
      success: true,
      message: req.t("success.family_deleted"),
    });
  } catch (error) {
    next(error);
  }
};

const getFamilyByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const family = await getFamilyByIdService(id, req.user);

    res.status(200).json({
      success: true,
      message: req.t("success.family_fetched"),
      data: family,
    });
  } catch (error) {
    next(error);
  }
};

const getFamiliesByCreatorController = async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await getFamiliesByCreatorService(
      creatorId,
      page,
      limit,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: req.t("success.families_fetched_by_user"),
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getFamiliesByAdminUnitController = async (req, res, next) => {
  try {
    const {
      block_id,
      ketena_id,
      woreda_id,
      health_center_id,
      subcity_id,
      city_id,
      is_vulnerable,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filters = {
      block_id,
      ketena_id,
      woreda_id,
      health_center_id,
      subcity_id,
      city_id,
      is_vulnerable,
      search,
    };

    const result = await getFamiliesByAdminUnitService(
      filters,
      page,
      limit,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: req.t("success.families_filtered"),
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getAssignedFamiliesController = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await getAssignedFamiliesService(req.user, page, limit);

    res.status(200).json({
      success: true,
      message: req.t("success.assigned_families_fetched"),
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFamilyController,
  updateFamilyController,
  deleteFamilyController,
  getFamilyByIdController,
  getFamiliesByCreatorController,
  getFamiliesByAdminUnitController,
  getAssignedFamiliesController,
};
