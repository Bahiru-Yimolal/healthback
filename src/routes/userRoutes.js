const express = require("express");
const {
  userRegistrationController,
  authUserController,
  getAllUsersController,
  updateUserController,
  updateUserPasswordController,
  resetEmailPasswordController,
  resetPasswordController,
  resetUserPasswordController,
  resetUserPasswordByIdController,
  updateLanguagePreferenceController,
  getUserByIdController,
  getAllUsersWithPendingStatusController,
  getUserLoginInfoController,
  deleteUserController,
  deactivateUserController,
  activateUserController
} = require("../controllers/userControllers");

const {
  getUserContextController,
  getUserHierarchyController,
} = require("../controllers/userContextControllers");

const {
  validateUser,
  validateUserUpdate,
  validatePassword,
  validateLoginInfo,
  validateEmail,
  validateResetPassword,
  validateEmailAttributes,
} = require("../validators/userValidators");

const { protect, assignmentMiddleware, permissionMiddleware } = require("../middlewares/authMiddleware");



const router = express.Router();

// ─── User Context & Hierarchy (new) ────────────────────────────────────────
router.get("/me/context", protect, assignmentMiddleware, getUserContextController);
router.get("/me/hierarchy", protect, assignmentMiddleware, getUserHierarchyController);

// ─── User CRUD ──────────────────────────────────────────────────────────────
router.route("/").post(validateUser, userRegistrationController);
router.post("/login", validateLoginInfo, authUserController);
router
  .route("/updateInfo")
  .patch(protect, validateUserUpdate, updateUserController);
router
  .route("/updatePassword")
  .patch(protect, validatePassword, updateUserPasswordController);
router.route("/").get(protect, getAllUsersController);
router
  .route("/forgot-password")
  .post(validateEmail, resetEmailPasswordController);
router
  .route("/reset-password")
  .post(protect, validateResetPassword, resetPasswordController);
router
  .route("/resetPassword/:phoneNumber")
  .patch(protect,
    assignmentMiddleware,
    permissionMiddleware("ADMIN_PERMISSIONS"), resetUserPasswordController);
router
  .route("/resetPasswordById/:userId")
  .patch(protect,
    assignmentMiddleware,
    permissionMiddleware("ADMIN_PERMISSIONS"), resetUserPasswordByIdController);
router.route("/pendingStatus").get(protect, getAllUsersWithPendingStatusController);
router.patch("/language", protect, updateLanguagePreferenceController);
router.get("/login-info", protect, getUserLoginInfoController);
router
  .route("/:userId")
  .get(protect, getUserByIdController)
  .delete(protect, assignmentMiddleware, permissionMiddleware("ADMIN_PERMISSIONS"), deleteUserController);

router.patch("/:userId/deactivate", protect, assignmentMiddleware, permissionMiddleware("ADMIN_PERMISSIONS"), deactivateUserController);
router.patch("/:userId/activate", protect, assignmentMiddleware, permissionMiddleware("ADMIN_PERMISSIONS"), activateUserController);

// router.route("/sendBulkEmail").post(protect,validateEmailAttributes, sendBulkEmailController);





module.exports = router;
