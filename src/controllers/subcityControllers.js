const {
  createSubcityService,
  listSubcitiesService,
  updateSubcityService,
  deleteSubcityService,
  assignSubcityAdminService,
  createCityLevelUserService,
  updateCityLevelUserService,
} = require("../services/subcityService");

const createSubcityController = async (req, res, next) => {
  try {
    const { name } = req.body;
    // req.user is populated by authMiddleware and assignmentMiddleware
    const newSubcity = await createSubcityService(name, req.user);

    res.status(201).json({
      success: true,
      message: req.t("success.subcity_created"),
      data: newSubcity,
    });
  } catch (error) {
    next(error);
  }
};

const listSubcitiesController = async (req, res, next) => {
  try {
    const subcities = await listSubcitiesService(req.user);

    res.status(200).json({
      success: true,
      subcities,
    });
  } catch (error) {
    next(error);
  }
};

const updateSubcityController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedSubcity = await updateSubcityService(id, name, req.user);

    res.status(200).json({
      success: true,
      message: req.t("success.subcity_updated"),
      data: updatedSubcity,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSubcityController = async (req, res, next) => {
  try {
    const { id } = req.params;

    await deleteSubcityService(id, req.user);

    res.status(200).json({
      success: true,
      message: req.t("success.subcity_deleted"),
    });
  } catch (error) {
    next(error);
  }
};

const assignSubcityAdminController = async (req, res, next) => {
  try {
    const { userId, subcityId, permissions } = req.body;

    const assignment = await assignSubcityAdminService({
      userId,
      subcityId,
      permissions,
      currentUser: req.user,
    });

    res.status(201).json({
      success: true,
      message: req.t("success.subcity_admin_assigned"),
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

const createCityLevelUserController = async (req, res, next) => {
  try {
    const { user_id, role, permissions } = req.body; // Matches validator schema

    const assignment = await createCityLevelUserService({
      userId: user_id,
      roleName: role,
      permissions,
      actor: req.user,
    });

    res.status(201).json({
      success: true,
      message: req.t("success.city_level_user_created"),
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

const updateCityLevelUserController = async (req, res, next) => {
  try {
    const { user_id, role, permissions } = req.body;

    const result = await updateCityLevelUserService({
      userId: user_id,
      roleName: role,
      permissions,
      actor: req.user,
    });

    res.status(200).json({
      success: true,
      message: req.t("success.subcity_level_user_updated"),
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubcityController,
  listSubcitiesController,
  updateSubcityController,
  deleteSubcityController,
  assignSubcityAdminController,
  createCityLevelUserController,
  updateCityLevelUserController,
};
