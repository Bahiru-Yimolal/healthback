const express = require("express");
const {
  protect,
  assignmentMiddleware,
  levelGuard,
  permissionMiddleware
} = require("../middlewares/authMiddleware");

const {
  validateSubcityInput,
  validateAssignSubcityAdminInput,
  validateCreateCityUserInput,
} = require("../validators/subcityValidators");

const {
  createSubcityController,
  listSubcitiesController,
  updateSubcityController,
  deleteSubcityController,
  assignSubcityAdminController,
  createCityLevelUserController,
  updateCityLevelUserController,
} = require("../controllers/subcityControllers");

const router = express.Router();

// Create Subcity
router.post(
  "/",
  protect,
  assignmentMiddleware,
  levelGuard(["CITY"]), // Only City Admins can create subcities
  permissionMiddleware("ADMIN_PERMISSIONS"), // Or specific CREATE_SUBCITY permission
  validateSubcityInput,
  createSubcityController
);

// List Subcities
router.get(
  "/",
  protect,
  assignmentMiddleware,
  levelGuard(["CITY"]), // Only City Admins can view *their* subcities via this route
  permissionMiddleware("ADMIN_PERMISSIONS"), // Or READ_SUBCITY
  listSubcitiesController
);

// Update Subcity
router.put(
  "/:id",
  protect,
  assignmentMiddleware,
  levelGuard(["CITY"]),
  permissionMiddleware("ADMIN_PERMISSIONS"),
  validateSubcityInput,
  updateSubcityController
);

// Delete Subcity
router.delete(
  "/:id",
  protect,
  assignmentMiddleware,
  levelGuard(["CITY"]),
  permissionMiddleware("ADMIN_PERMISSIONS"),
  deleteSubcityController
);

// Assign Subcity Admin
router.post(
  "/assign/subcity-admin",
  protect,
  assignmentMiddleware,
  levelGuard(["CITY"]), // Only City Admin can assign
  permissionMiddleware("ADMIN_PERMISSIONS"),
  validateAssignSubcityAdminInput,
  assignSubcityAdminController
);

// Assign Subcity Level User
router.post(
  "/assign/users",
  protect,
  assignmentMiddleware,
  levelGuard(["CITY"]), // Only SUBCITY Admins
  permissionMiddleware("ADMIN_PERMISSIONS"),
  validateCreateCityUserInput,
  createCityLevelUserController
);

// Update Subcity Level User
router.put(
  "/assign/users",
  protect,
  assignmentMiddleware,
  levelGuard(["CITY"]),
  permissionMiddleware("ADMIN_PERMISSIONS"),
  validateCreateCityUserInput,
  updateCityLevelUserController
);

module.exports = router;
