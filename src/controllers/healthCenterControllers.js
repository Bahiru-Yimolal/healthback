const {
  createHealthCenterService,
  listHealthCentersService,
  updateHealthCenterService,
  deleteHealthCenterService,
  assignHealthCenterAdminService,
  createHealthCenterLevelUserService,
  updateHealthCenterLevelUserService,
  createOwnHealthCenterUserService,
  updateOwnHealthCenterUserService,
  assignPCWorkerService,
  updatePCWorkerAssignmentService,
  listPCWorkersInHealthCenterService,
} = require("../services/healthCenterService");

const listPCWorkersController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workers = await listPCWorkersInHealthCenterService(id, req.user);
    res.status(200).json({
      success: true,
      data: workers,
    });
  } catch (error) {
    next(error);
  }
};

const createHealthCenterLevelUserController = async (req, res, next) => {
  try {
    const { user_id, role, permissions } = req.body;

    const assignment = await createHealthCenterLevelUserService({
      userId: user_id,
      roleName: role,
      permissions,
      actor: req.user,
    });

    res.status(201).json({
      success: true,
      message: req.t("success.health_center_level_user_created"),
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

const updateHealthCenterLevelUserController = async (req, res, next) => {
  try {
    const { user_id, role, permissions } = req.body;

    const result = await updateHealthCenterLevelUserService({
      userId: user_id,
      roleName: role,
      permissions,
      actor: req.user,
    });

    res.status(200).json({
      success: true,
      message: req.t("success.health_center_level_user_updated"),
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createOwnHealthCenterUserController = async (req, res, next) => {
  try {
    const { user_id, role, permissions } = req.body;

    const assignment = await createOwnHealthCenterUserService({
      userId: user_id,
      roleName: role,
      permissions,
      actor: req.user,
    });

    res.status(201).json({
      success: true,
      message: req.t("success.own_health_center_user_created"),
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

const updateOwnHealthCenterUserController = async (req, res, next) => {
  try {
    const { user_id, role, permissions } = req.body;

    const result = await updateOwnHealthCenterUserService({
      userId: user_id,
      roleName: role,
      permissions,
      actor: req.user,
    });

    res.status(200).json({
      success: true,
      message: req.t("success.own_health_center_user_updated"),
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createHealthCenterController = async (req, res, next) => {
  try {
    const { name } = req.body;
    const newHealthCenter = await createHealthCenterService(name, req.user);
    res.status(201).json({
      success: true,
      message: req.t("success.health_center_created"),
      data: newHealthCenter,
    });
  } catch (error) {
    next(error);
  }
};

const listHealthCentersController = async (req, res, next) => {
  try {
    const healthCenters = await listHealthCentersService(req.user);
    res.status(200).json({
      success: true,
      data: healthCenters,
    });
  } catch (error) {
    next(error);
  }
};

const updateHealthCenterController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updatedHealthCenter = await updateHealthCenterService(id, name, req.user);
    res.status(200).json({
      success: true,
      message: req.t("success.health_center_updated"),
      data: updatedHealthCenter,
    });
  } catch (error) {
    next(error);
  }
};

const deleteHealthCenterController = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteHealthCenterService(id, req.user);
    res.status(200).json({
      success: true,
      message: req.t("success.health_center_deleted"),
    });
  } catch (error) {
    next(error);
  }
};

const assignHealthCenterAdminController = async (req, res, next) => {
  try {
    const { userId, healthCenterId, permissions } = req.body;

    const assignment = await assignHealthCenterAdminService({
      userId,
      healthCenterId,
      permissions,
      currentUser: req.user,
    });

    res.status(201).json({
      success: true,
      message: req.t("success.health_center_admin_assigned"),
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

const assignPCWorkerController = async (req, res, next) => {
  try {
    const { userId, unitIds, role, permissions } = req.body;

    const assignment = await assignPCWorkerService({
      userId,
      unitIds,
      roleName: role || "PC_WORKER",
      permissions,
      actor: req.user,
    });

    res.status(201).json({
      success: true,
      message: req.t("success.pc_worker_assigned", "PC Worker successfully assigned to the logical unit."),
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};


const updatePCWorkerAssignmentController = async (req, res, next) => {
  try {
    const { userId, unitIds, role, permissions } = req.body;

    const result = await updatePCWorkerAssignmentService({
      userId,
      unitIds,
      roleName: role || "PC_WORKER",
      permissions,
      actor: req.user,
    });

    res.status(200).json({
      success: true,
      message: req.t("success.pc_worker_assignment_updated", "PC Worker assignments successfully updated."),
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHealthCenterController,
  listHealthCentersController,
  updateHealthCenterController,
  deleteHealthCenterController,
  assignHealthCenterAdminController,
  createHealthCenterLevelUserController,
  updateHealthCenterLevelUserController,
  updateHealthCenterLevelUserController,
  createOwnHealthCenterUserController,
  updateOwnHealthCenterUserController,
  assignPCWorkerController,
  updatePCWorkerAssignmentController,
  listPCWorkersController,
};
