const express = require("express");
const {
  createCityController,
  listCitiesController,
  updateCityController,
  deleteCityController,
  assignCityAdminController,
  createEthiopiaLevelUserController,
  unassignUserController,
  updateUserPermissionsController,
  updateEthiopiaLevelUserController,
  getAllPermissionsController,
  getAllRolesController,
  getPersonnelByRoleController,
  getUnitPersonnelDetailsController,
} = require("../controllers/cityControllers");
const {
  validateCityInput,
  validateAssignUserInput,
  validateCreateEthiopiaUserInput,
  validateUnassignUserInput,
  validateUpdatePermissionsInput,
} = require("../validators/cityValidators");

const { protect, assignmentMiddleware, levelGuard, permissionMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  assignmentMiddleware,
  levelGuard(["ETHIOPIA"]), // ensures user is Ethiopia-level
  permissionMiddleware("ADMIN_PERMISSIONS"),
  validateCityInput, // optional: validate name, etc.
  createCityController
);
router.get(
  "/",
  protect,
  assignmentMiddleware,
  levelGuard(["ETHIOPIA"]), // Only Ethiopia-level
  permissionMiddleware("ADMIN_PERMISSIONS"),
  listCitiesController
);
router.put(
  "/:id",
  protect,
  assignmentMiddleware,
  levelGuard(["ETHIOPIA"]),
  permissionMiddleware("ADMIN_PERMISSIONS"), // Or CREATE_CITY if preferred
  validateCityInput,
  updateCityController
);
router.delete(
  "/:id",
  protect,
  assignmentMiddleware,
  levelGuard(["ETHIOPIA"]),
  permissionMiddleware("ADMIN_PERMISSIONS"),
  deleteCityController
);

router.post(
  "/assign/city-admin",
  protect,
  assignmentMiddleware,
  levelGuard(["ETHIOPIA"]), // only Ethiopia-level Super Admin
  permissionMiddleware("ADMIN_PERMISSIONS"), // must have manage users permission
  validateAssignUserInput, // validate { userId, cityId }
  assignCityAdminController
);


router.post(
  "/assign/users",
  protect,
  assignmentMiddleware,
  levelGuard(["ETHIOPIA"]),
  permissionMiddleware("ADMIN_PERMISSIONS"),
  validateCreateEthiopiaUserInput,
  createEthiopiaLevelUserController
);

router.put(
  "/assign/users",
  protect,
  assignmentMiddleware,
  levelGuard(["ETHIOPIA"]),
  permissionMiddleware("ADMIN_PERMISSIONS"),
  validateCreateEthiopiaUserInput, // same validator ✔
  updateEthiopiaLevelUserController
);


router.delete(
  "/users/unassign",
  protect,
  assignmentMiddleware,
  permissionMiddleware("ADMIN_PERMISSIONS"), // only users with MANAGE_USERS can unassign
  validateUnassignUserInput,
  unassignUserController
);

router.put(
  "/users/permissions",
  protect,
  assignmentMiddleware,
  permissionMiddleware("ADMIN_PERMISSIONS"),
  validateUpdatePermissionsInput,
  updateUserPermissionsController
);

router.get(
  "/permissions",
  protect,
  assignmentMiddleware,
  permissionMiddleware("ADMIN_PERMISSIONS"),
  getAllPermissionsController
);

router.get(
  "/roles",
  protect,
  assignmentMiddleware,
  permissionMiddleware("ADMIN_PERMISSIONS"),
  getAllRolesController
);


// Personnel Fetching (Group Leaders, Officers, etc. within the unit)
router.get(
  "/personnel",
  protect,
  assignmentMiddleware,
  getPersonnelByRoleController
);

router.get(
  "/personnel/unit-details",
  protect,
  assignmentMiddleware,
  permissionMiddleware("ADMIN_PERMISSIONS"),
  getUnitPersonnelDetailsController
);

module.exports = router;
