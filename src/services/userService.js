const {
  User,
  AdministrativeUnit,
  Role,
  Permission,
  UserAssignment,
  UserPermission,
  RolePermission,
  AuditLog,
  LoginLog,
} = require("../models");

const { hashPassword, comparePassword } = require("../utils/hashUtils");
const { AppError } = require("../middlewares/errorMiddleware");
const { Op } = require("sequelize");
const generateToken = require("../utils/tokenUtil");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail"); // Utility to send emails
const { JWT_SECRET, RESET_PASSWORD_TOKEN_EXPIRY, CLIENT_URL } = process.env;
const sequelize = require("../config/database");
const { Roles, Permissions, DefaultRolePermissions } = require("../config/rolePermissions");

const registerUserService = async (
  first_name,
  last_name,
  username,
  email,
  phone_number,
  password,
  language_preference
) => {
  const transaction = await sequelize.transaction();
  try {
    // ✅ Check duplicates
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { phone_number },
          { username: username || null },
          { email: email || null }
        ]
      },
      transaction
    });

    if (existingUser) {
      if (existingUser.phone_number === phone_number) throw new AppError("errors.phone_exists", 400);
      if (existingUser.username && existingUser.username === username) throw new AppError("errors.username_exists", 400);
      if (existingUser.email && existingUser.email === email) throw new AppError("errors.email_exists", 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Check if this is the first user
    const firstUser = !(await User.findOne({ transaction }));

    // Create user
    const user = await User.create({
      first_name,
      last_name,
      username: username || null,
      email: email || null,
      phone_number,
      password: hashedPassword,
      language_preference, // New field
      status: firstUser ? "ACTIVE" : "UNASSIGNED",
    }, { transaction });

    // ----------- Bootstrap first user -------------
    if (firstUser) {
      // Ethiopia unit
      const [ethiopiaUnit] = await AdministrativeUnit.findOrCreate({
        where: { level: "ETHIOPIA" },
        defaults: { name: "Ethiopia", parent_id: null },
        transaction,
      });

      // Admin role
      const [adminRole] = await Role.findOrCreate({
        where: { name: Roles.ADMIN },
        defaults: { description: "Main administrator role" },
        transaction,
      });

      // Assign user to Ethiopia unit as Admin
      await UserAssignment.create({
        user_id: user.user_id,
        unit_id: ethiopiaUnit.id,
        role_id: adminRole.id,
      }, { transaction });

      // Identify standard permissions for ADMIN
      const standardPermNames = DefaultRolePermissions[Roles.ADMIN] || [];

      const permissions = await Promise.all(
        standardPermNames.map((name) =>
          Permission.findOrCreate({
            where: { name },
            defaults: { description: `${name.replace(/_/g, " ").toLowerCase()}` },
            transaction,
          }).then(([perm]) => perm)
        )
      );

      // Link all permissions to ADMIN Role (The Standard)
      await Promise.all(
        permissions.map((perm) =>
          RolePermission.findOrCreate({
            where: {
              role_id: adminRole.id,
              permission_id: perm.id,
            },
            transaction,
          })
        )
      );
    }

    await transaction.commit();
    return user;
  } catch (error) {
    await transaction.rollback();

    // Log the error for internal tracking
    console.error("Registration Error Detailed:", error);

    if (error instanceof AppError) throw error;

    // Handle Sequelize Unique Constraint Errors
    if (error.name === "SequelizeUniqueConstraintError") {
      const field = error.errors[0].path;
      if (field === "email") throw new AppError("errors.email_exists", 400);
      if (field === "username") throw new AppError("errors.username_exists", 400);
      if (field === "phone_number") throw new AppError("errors.phone_exists", 400);
    }

    if (error.name === "SequelizeValidationError") {
      throw new AppError(error.errors[0].message, 400);
    }

    throw new AppError("Database error: Unable to create user", 500);
  }
};


const loginService = async (phone_number, password, ip_address, user_agent) => {
  // 1️⃣ Find user by phone number
  const user = await User.findOne({ where: { phone_number } });

  const logAttempt = async (status, failure_reason = null) => {
    try {
      await LoginLog.create({
        user_id: user ? user.user_id : null,
        identifier: phone_number,
        ip_address: ip_address || null,
        user_agent: user_agent || null,
        status,
        failure_reason
      });
    } catch (logError) {
      console.error("Failed to create login log:", logError);
    }
  };

  if (!user) {
    await logAttempt("FAILED", "invalid_credentials");
    throw new AppError("errors.invalid_credentials", 401);
  }

  // 2️⃣ Check password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    await logAttempt("FAILED", "invalid_password");
    throw new AppError("errors.invalid_credentials", 401);
  }

  // 3️⃣ Check if user is assigned
  if (user.status === "UNASSIGNED") {
    await logAttempt("SUCCESS", "account_pending"); // Log as success but pending status
    return {
      message: "errors.account_pending",
      status: "UNASSIGNED",
    };
  }

  if (user.status === "DEACTIVATED") {
    await logAttempt("FAILED", "account_deactivated");
    throw new AppError("errors.account_deactivated", 403);
  }

  // 4️⃣ Fetch all assignments for this user
  const assignments = await UserAssignment.findAll({
    where: { user_id: user.user_id },
    include: [
      { model: Role, attributes: ["name", "description"] },
      { model: AdministrativeUnit, attributes: ["id", "name", "level"] },
    ],
  });

  // 5️⃣ Fetch Role-level permissions (The Standard)
  const rolePermissions = await RolePermission.findAll({
    where: { role_id: assignments.map((a) => a.role_id) },
    include: [{ model: Permission, attributes: ["name"] }],
  });

  // 6️⃣ Fetch User-level overrides (The Exception)
  const userOverrides = await UserPermission.findAll({
    where: { assignment_id: assignments.map((a) => a.id) },
    include: [{ model: Permission, attributes: ["name"] }],
  });

  // 7️⃣ Merge permissions into a unique list
  const permissionSet = new Set();
  rolePermissions.forEach((rp) => permissionSet.add(rp.Permission.name));
  userOverrides.forEach((uo) => permissionSet.add(uo.Permission.name));

  const permissionList = Array.from(permissionSet);

  // 8️⃣ Generate JWT token
  const tokenPayload = {
    user_id: user.user_id,
    status: user.status,
    assignments: assignments.map((a) => ({
      assignment_id: a.id,
      role: a.Role.name,
      unit: {
        id: a.AdministrativeUnit.id,
        name: a.AdministrativeUnit.name,
        level: a.AdministrativeUnit.level,
      },
    })),
    permissions: permissionList,
    language_preference: user.language_preference, // New claim
  };

  const token = generateToken(tokenPayload);

  await logAttempt("SUCCESS");

  return {
    token,
    user: {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      email: user.email,
      status: user.status,
      mustChangePassword: user.mustChangePassword,
      language_preference: user.language_preference, // New field
    },
    assignments: tokenPayload.assignments,
    permissions: permissionList,
  };
};

const updateUserService = async (
  userId,
  firstName,
  lastName,
  email,
  phoneNumber,
  username,
  language_preference
) => {
  // Check if the user exists
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("errors.user_not_found", 404);
  }

  // Check if phone number or username is already in use by another user
  if (phoneNumber || username) {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          phoneNumber ? { phone_number: phoneNumber } : null,
          username ? { username: username } : null,
        ].filter(Boolean),
        user_id: { [Op.ne]: userId }
      },
    });

    if (existingUser) {
      const key = existingUser.phone_number === phoneNumber ? "errors.phone_exists" : "errors.username_exists";
      throw new AppError(key, 400);
    }
  }

  // Update user details
  user.first_name = firstName || user.first_name;
  user.last_name = lastName || user.last_name;
  user.phone_number = phoneNumber || user.phone_number;
  user.email = email === "" ? null : (email || user.email);
  user.username = username === "" ? null : (username || user.username);
  user.language_preference = language_preference || user.language_preference;

  await user.save();

  return user;
};

const updatePasswordService = async (userId, currentPassword, newPassword) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError("errors.user_not_found", 404);
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new AppError("errors.current_password_incorrect", 400);
  }

  user.password = await hashPassword(newPassword);
  user.mustChangePassword = false;
  await user.save();

  return { success: true, message: "success.password_updated" };
};

const getAllUsersService = async () => {
  try {
    // Fetch all registered users
    const users = await User.findAll({
      attributes: [
        "user_id",
        "first_name",
        "last_name",
        "phone_number",
        "status",
        "username",
        "email"
      ],
      include: [
        {
          model: UserAssignment,
          include: [
            { model: Role, attributes: ["name"] },
            { model: AdministrativeUnit, attributes: ["id", "name", "level", "parent_id"] }
          ]
        }
      ]
    });

    if (!users || users.length === 0) {
      return []; // Return empty array instead of throwing if no users
    }

    return users;
  } catch (error) {
    throw new AppError(
      error.message || "Database error: Unable to fetch users",
      500
    );
  }
};


const resetEmailPasswordService = async (email) => {
  const existingUser = await User.findOne({ where: { email } });

  if (!existingUser) {
    throw new AppError("No user found with this email", 404);
  }

  // Generate reset token (expires in 15 minutes or so)
  const token = jwt.sign(
    { id: existingUser.user_id, email: existingUser.email },
    JWT_SECRET,
    { expiresIn: RESET_PASSWORD_TOKEN_EXPIRY || "15m" }
  );

  // Construct reset link
  const resetLink = `${CLIENT_URL}/reset-password/${token}`;

  // console.log(token);

  // Send email
  const subject = "Password Reset Request";
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
          }
          .header {
              text-align: center;
              padding: 10px 0;
              background-color: #0f766e;
              color: white;
              border-radius: 8px 8px 0 0;
          }
          .logo {
              font-size: 24px;
              font-weight: bold;
              color: #ffffff;
          }
          .content {
              background-color: white;
              padding: 20px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #0f766e;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 15px 0;
              text-align: center;
          }
          .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #777;
          }
          .highlight {
              color: #E74C3C;
              font-weight: bold;
          }
      </style>
  </head>
  <body>
      <div class="header">
          <div class="logo">Addis Ababa Coders</div>
          <p>Empowering the Future of Tech in Ethiopia</p>
      </div>
      <div class="content">
          <p>Hello <strong>${existingUser.first_name} ${existingUser.last_name
    }</strong>,</p>
          
          <p>We received a request to reset your password for your <strong>Addis Ababa Coders</strong> account. No worries—let’s get you back on track!</p>
          
          <p style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Your Password</a>
          </p>
          
          <p>For security reasons, this link will <span class="highlight">expire in 5 minutes</span>. If you didn’t request this, please ignore this email—your account is still safe with us.</p>
          
          <p>Keep coding, keep innovating! 🚀</p>
          
          <p>Best regards,<br>Addis Ababa Coders Management System</p>
      </div>
      <div class="footer">
          <p>© ${new Date().getFullYear()} Addis Ababa Coders Management System. All rights reserved.</p>
          <p>Addis Ababa, Ethiopia</p>
      </div>
  </body>
  </html>
  `;


  const emailAddress = existingUser.email;


  try {
    await sendEmail(emailAddress, subject, html);
  } catch (emailError) {
    console.error("Email sending failed:", emailError.message);
    // You can choose whether to throw or silently ignore
  }


  return { message: "Reset email sent successfully" };
};

const resetPasswordService = async (userId, password) => {
  const existingUser = await User.findOne({
    where: { user_id: userId },
  });

  if (!existingUser) {
    throw new AppError("No user found with this userId", 404);
  }
  const hashedPassword = await hashPassword(password);
  await existingUser.update({
    password: hashedPassword,
  });

  return {
    message: "Password reset successful",
  };

};




// const sendBulkEmailService = async ({ subject, message, recipients }) => {
//   const BATCH_SIZE = 50;
//   const results = [];

//   const generateHtml = (name, message) => {
//     return `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//   <style>
//     body {
//       font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//       margin: 0;
//       padding: 0;
//       background: #f4f4f4;
//     }
//     .container {
//       max-width: 600px;
//       margin: 20px auto;
//       background: #fff;
//       padding: 30px;
//       border-radius: 10px;
//       box-shadow: 0 0 10px rgba(0,0,0,0.1);
//     }
//     .header {
//       background: #0f766e;
//       color: #fff;
//       padding: 20px;
//       text-align: center;
//       border-radius: 10px 10px 0 0;
//     }
//     .content {
//       padding: 20px;
//       text-align: left;
//       color: #333;
//     }
//     .button {
//       display: inline-block;
//       padding: 12px 24px;
//       background: #0f766e;
//       color: white;
//       text-decoration: none;
//       border-radius: 5px;
//       margin-top: 20px;
//       font-weight: bold;
//       color: #ffffff !important;
//     }
//     .footer {
//       font-size: 12px;
//       color: #999;
//       text-align: center;
//       padding: 10px;
//       margin-top: 20px;
//     }
//     @media (max-width: 600px) {
//       .container {
//         padding: 20px;
//       }
//     }
//   </style>
// </head>
// <body>
//   <div class="container">
//     <div class="header">
//       <h2>Addis Ababa Coders</h2>
//       <p>Empowering the Future of Tech</p>
//     </div>
//     <div class="content">
//       <p>Dear <strong>${name}</strong>,</p>
//       <p>${message}</p>
//       <p style="margin-top: 30px;">Keep learning, keep building! 🚀</p>
//       <a class="button" href="https://aacoders.aaitdb.gov.et/">Visit Our Website</a>
//     </div>
//     <div class="footer">
//       <p>© ${new Date().getFullYear()} Addis Ababa Coders Management System. All rights reserved.</p>
//     </div>
//   </div>
// </body>
// </html>
//     `;
//   };

//   for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
//     const batch = recipients.slice(i, i + BATCH_SIZE);

//     try {
//       for (const recipient of batch) {
//         const html = generateHtml(recipient.full_name, message);
//         await sendEmail(recipient.email, subject, html);
//       }

//       results.push({ batch, status: "sent" });
//     } catch (error) {
//       console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
//       results.push({ batch, status: "failed", error: error.message });
//     }

//     // Optional rate-limiting delay
//     await new Promise((res) => setTimeout(res, 2000));
//   }

//   return results;
// };

// const getHealthCenterNameService = async (id, role) => {
//   if (role === "HealthCenter Leader") {
//     const healthCenter = await HealthCenter.findByPk(id);
//     if (!healthCenter) {
//       throw new AppError("HealthCenter not found", 404);
//     }
//     return healthCenter.healthCenter_name;
//   }

//   if (role === "Sub-City Head") {
//     const subCity = await Subcity.findByPk(id);
//     if (!subCity) {
//       throw new AppError("Sub-City not found", 404);
//     }
//     return subCity.subcity_name;
//   }

//   if (role === "Committee") {
//     const committee = await Committee.findByPk(id);
//     if (!committee) {
//       throw new AppError("Committee not found", 404);
//     }
//     return committee.committee_name;
//   }

//   throw new AppError("Invalid role", 400);
// };


const resetUserPasswordService = async (phoneNumber) => {
  const user = await User.findOne({
    where: { phone_number: phoneNumber },
  });
  if (!user) {
    throw new AppError("errors.user_not_found", 404);
  }

  const hashedPassword = await hashPassword(process.env.DEFAULT_PASSWORD);
  user.password = hashedPassword;
  user.mustChangePassword = true;
  await user.save();

  return user;
};

const resetUserPasswordByIdService = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("errors.user_not_found", 404);
  }

  const hashedPassword = await hashPassword(process.env.DEFAULT_PASSWORD);
  user.password = hashedPassword;
  user.mustChangePassword = true;
  await user.save();

  return user;
};

const updateLanguagePreferenceService = async (userId, languagePreference) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("errors.user_not_found", 404);
  }

  user.language_preference = languagePreference;
  await user.save();

  return user;
};

const getUserByIdService = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] }
  });

  if (!user) {
    throw new AppError("errors.user_not_found", 404);
  }

  return user;
};

const getAllUsersWithPendingService = async () => {
  try {
    // Fetch all registered users
    const users = await User.findAll({
      where: {
        status: "UNASSIGNED",
      },
      attributes: [
        "user_id",
        "first_name",
        "last_name",
        "phone_number",
        "status",
      ],
    });

    if (!users) {
      throw new AppError("No users found", 404); // If no users are found
    }

    return users;
  } catch (error) {
    throw new AppError(
      error.message || "Database error: Unable to fetch users",
      500
    );
  }
};



const getUserLoginInfoService = async (userId) => {
  try {
    const successCount = await LoginLog.count({
      where: { user_id: userId, status: "SUCCESS" },
    });

    const failedCount = await LoginLog.count({
      where: { user_id: userId, status: "FAILED" },
    });

    const lastSuccess = await LoginLog.findOne({
      where: { user_id: userId, status: "SUCCESS" },
      order: [["createdAt", "DESC"]],
      attributes: ["id", ["createdAt", "login_at"], "ip_address", "user_agent"],
    });

    const lastFailed = await LoginLog.findOne({
      where: { user_id: userId, status: "FAILED" },
      order: [["createdAt", "DESC"]],
      attributes: ["id", ["createdAt", "login_at"], "ip_address", "user_agent", "failure_reason"],
    });

    // Recent history (last 5 attempts)
    const recentHistory = await LoginLog.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
      limit: 5,
      attributes: ["id", ["createdAt", "login_at"], "ip_address", "user_agent", "status", "failure_reason"],
    });

    return {
      success_count: successCount,
      failed_count: failedCount,
      last_successful_login: lastSuccess,
      last_failed_login: lastFailed,
      recent_history: recentHistory
    };
  } catch (error) {
    console.error("Error in getUserLoginInfoService:", error);
    throw new AppError("Unable to fetch login information", 500);
  }
};

const deleteUserService = async (userId) => {
  const transaction = await User.sequelize.transaction();
  try {
    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      throw new AppError("errors.user_not_found", 404);
    }

    if (user.status !== "UNASSIGNED") {
      throw new AppError("errors.cannot_delete_assigned_user", 400);
    }

    // Cleanup associated records that might exist for unassigned users
    // (In practice, unassigned shouldn't have many, but it's safer)
    await UserAssignment.destroy({ where: { user_id: userId }, transaction });
    await LoginLog.destroy({ where: { user_id: userId }, transaction });

    // Hard delete the user
    await user.destroy({ transaction });

    await transaction.commit();
    return { success: true };
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

const deactivateUserService = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError("errors.user_not_found", 404);
  }

  user.status = "DEACTIVATED";
  await user.save();

  return { success: true };
};

const activateUserService = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError("errors.user_not_found", 404);
  }

  user.status = "ACTIVE";
  await user.save();

  return { success: true };
};

module.exports = {
  registerUserService,
  loginService,
  getAllUsersService,
  updateUserService,
  updatePasswordService,
  resetEmailPasswordService,
  resetPasswordService,
  resetUserPasswordService,
  resetUserPasswordByIdService,
  updateLanguagePreferenceService,
  getUserByIdService,
  getAllUsersWithPendingService,
  getUserLoginInfoService,
  deleteUserService,
  deactivateUserService,
  activateUserService
};
