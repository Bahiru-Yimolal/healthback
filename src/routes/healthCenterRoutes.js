const express = require("express");
const {
  protect,
  assignmentMiddleware,
  levelGuard,
  permissionMiddleware,
} = require("../middlewares/authMiddleware");

const {
  validateHealthCenterInput,
  validateAssignHealthCenterAdminInput,
  validateCreateHealthCenterUserInput,
  validateAssignPCWorkerInput
} = require("../validators/healthCenterValidators");

const {
  createHealthCenterController,
  listHealthCentersController,
  updateHealthCenterController,
  deleteHealthCenterController,
  assignHealthCenterAdminController,
  createHealthCenterLevelUserController,
  updateHealthCenterLevelUserController,
  createOwnHealthCenterUserController,
  updateOwnHealthCenterUserController,
  assignPCWorkerController,
  updatePCWorkerAssignmentController,
  listPCWorkersController,
} = require("../controllers/healthCenterControllers");

const router = express.Router();

// Create HealthCenter
router.post(
  "/",
  protect,
  assignmentMiddleware,
  levelGuard(["SUBCITY"]), // Only Subcity Admins can create healthCenters
  permissionMiddleware("ADMIN_PERMISSIONS"), // Or specific CREATE_HEALTH_CENTER permission
  validateHealthCenterInput,
  createHealthCenterController
);

// List HealthCenters
router.get(
  "/",
  protect,
  assignmentMiddleware,
  levelGuard(["SUBCITY"]), // Only Subcity Admins can view *their* healthCenters via this route
  permissionMiddleware("ADMIN_PERMISSIONS"), // Or READ_HEALTH_CENTER
  listHealthCentersController
);

// Update HealthCenter
router.put(
  "/:id",
  protect,
  assignmentMiddleware,
  levelGuard(["SUBCITY"]),
  permissionMiddleware("ADMIN_PERMISSIONS"),
  validateHealthCenterInput,
  updateHealthCenterController
);

// Delete HealthCenter
router.delete(
  "/:id",
  protect,
  assignmentMiddleware,
  levelGuard(["SUBCITY"]),
  permissionMiddleware("ADMIN_PERMISSIONS"),
  deleteHealthCenterController
);

// Assign HealthCenter Admin
router.post(
  "/assign/healthCenter-admin",
  protect,
  assignmentMiddleware,
  levelGuard(["SUBCITY"]), // Only Subcity Admin can assign
  permissionMiddleware("ADMIN_PERMISSIONS"),
  validateAssignHealthCenterAdminInput,
  assignHealthCenterAdminController
);

// Assign HealthCenter Level User
router.post(
  "/assign/users",
  protect,
  assignmentMiddleware,
  levelGuard(["SUBCITY"]), // Only SUBCITY Admins
  permissionMiddleware("ADMIN_PERMISSIONS"),
  validateCreateHealthCenterUserInput,
  createHealthCenterLevelUserController
);

// Update HealthCenter Level User
router.put(
  "/assign/users",
  protect,
  assignmentMiddleware,
  levelGuard(["SUBCITY"]),
  permissionMiddleware("ADMIN_PERMISSIONS"),
  validateCreateHealthCenterUserInput,
  updateHealthCenterLevelUserController
);

// HealthCenter Admin matching their OWN healthCenter management
router.post(
  "/assign/own-users",
  protect,
  assignmentMiddleware,
  levelGuard(["HEALTH_CENTER"]),
  permissionMiddleware("ADMIN_PERMISSIONS"),
  validateCreateHealthCenterUserInput,
  createOwnHealthCenterUserController
);

// Update HealthCenter Admin matching their OWN healthCenter management
router.put(
  "/assign/own-users",
  protect,
  assignmentMiddleware,
  levelGuard(["HEALTH_CENTER"]),
  permissionMiddleware("ADMIN_PERMISSIONS"),
  validateCreateHealthCenterUserInput,
  updateOwnHealthCenterUserController
);

// Assign PC Worker
router.post(
  "/assign/pc-worker",
  protect,
  assignmentMiddleware,
  levelGuard(["HEALTH_CENTER"]),
  permissionMiddleware("ASSIGN_PC_WORKERS"),
  validateAssignPCWorkerInput,
  assignPCWorkerController
);

router.patch(
  "/assign/pc-worker",
  protect,
  assignmentMiddleware,
  levelGuard(["HEALTH_CENTER"]),
  permissionMiddleware("ASSIGN_PC_WORKERS"),
  validateAssignPCWorkerInput,
  updatePCWorkerAssignmentController
);

router.get(
  "/:id/pc-workers",
  protect,
  assignmentMiddleware,
  permissionMiddleware("ASSIGN_PC_WORKERS"),
  listPCWorkersController
);

module.exports = router;
