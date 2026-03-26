const jwt = require("jsonwebtoken");
const { AppError } = require("../middlewares/errorMiddleware");
const User = require("../models/userModel");
const UserAssignment = require("../models/userAssignment");
const AdministrativeUnit = require("../models/administrativeUnitModel");
const Role = require("../models/roleModel");
const Permission = require("../models/permissionModel");
const UserPermission = require("../models/userPermissionModel");
const RolePermission = require("../models/rolePermissionModel");


const protect = (req, res, next) => {
  // Get token from header
  const token =
    req.headers.authorization && req.headers.authorization.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null;

  // Check if token exists
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return next(new AppError("Invalid token. Please log in again.", 401));
    }

    try {
      // Correctly access the nested payload if it exists
      const tokenPayload = decoded.payload || decoded;
      const userId = tokenPayload.user_id;

      // Fetch fresh user data (especially language_preference as requested)
      const user = await User.findByPk(userId, {
        attributes: ["user_id", "status", "language_preference"]
      });

      if (!user) {
        console.error(`Auth Error: User with ID ${userId} not found in DB.`);
        return next(new AppError("User no longer exists.", 401));
      }

      if (user.status === "DEACTIVATED") {
        return next(new AppError("Your account has been deactivated.", 401));
      }

      // Attach user data to request object
      // Combine decoded token payload with fresh DB data
      req.user = {
        payload: {
          ...tokenPayload,
          language_preference: user.language_preference
        }
      };

      // Override global i18n if no header was provided (DB is the source of truth for profile)
      if (!req.headers["accept-language"]) {
        req.lang = user.language_preference || req.lang;
      }

      next();
    } catch (error) {
      next(error);
    }
  });
};

const levelGuard = (allowedLevels = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.unit) {
      return next(new AppError("Unauthorized", 401));
    }

    const userLevel = req.user.unit.level;

    if (!allowedLevels.includes(userLevel)) {
      return next(
        new AppError(
          "You do not have access to perform this action at your level",
          403
        )
      );
    }

    next();
  };
};

const assignmentMiddleware = async (req, res, next) => {
  try {
    // 1️⃣ Ensure authMiddleware ran

    // console.log(req.user.payload)
    if (!req.user.payload || !req.user.payload.user_id) {
      return next(new AppError("Unauthorized", 401));
    }

    // 2️⃣ Load user
    const user = await User.findByPk(req.user.payload.user_id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // 3️⃣ Block deactivated users
    if (user.status === "DEACTIVATED") {
      return next(new AppError("Account is deactivated", 403));
    }

    // 4️⃣ Allow login but block system access if unassigned
    if (user.status === "UNASSIGNED") {
      return next(
        new AppError(
          "Your account is awaiting assignment by an administrator",
          403,
          "PENDING_ASSIGNMENT"
        )
      );
    }

    // 5️⃣ Load assignment (single assignment guaranteed)
    const assignment = await UserAssignment.findOne({
      where: { user_id: user.user_id },
    });

    if (!assignment) {
      // Safety net — DB inconsistency
      return next(
        new AppError(
          "User is active but has no assignment",
          500
        )
      );
    }

    // 6️⃣ Load unit
    const unit = await AdministrativeUnit.findByPk(assignment.unit_id);
    if (!unit) {
      return next(new AppError("Assigned unit not found", 500));
    }

    // 7️⃣ Load role
    const role = await Role.findByPk(assignment.role_id);
    if (!role) {
      return next(new AppError("Assigned role not found", 500));
    }

    // 8️⃣ Attach context to request
    req.user = {
      id: user.user_id,
      status: user.status,
      assignment: {
        id: assignment.id,
      },
      unit: {
        id: unit.id,
        level: unit.level,
        parent_id: unit.parent_id,
        name: unit.name,
      },
      role: {
        id: role.id,
        name: role.name,
      },
    };


    next();
  } catch (error) {
    next(error);
  }
};

const permissionMiddleware = (requiredPermissionName) => {
  return async (req, res, next) => {
    try {
      // 1️⃣ Ensure assignmentMiddleware ran
      if (!req.user || !req.user.assignment || !req.user.role) {
        return next(new AppError("Unauthorized", 401));
      }

      const assignmentId = req.user.assignment.id;
      const roleId = req.user.role.id;

      // 2️⃣ Find permission by name
      const permission = await Permission.findOne({
        where: { name: requiredPermissionName },
      });

      if (!permission) {
        return next(
          new AppError(
            `Permission '${requiredPermissionName}' is not defined`,
            500
          )
        );
      }

      // 3️⃣ Check Role-level permission (The Standard)
      const rolePermission = await RolePermission.findOne({
        where: {
          role_id: roleId,
          permission_id: permission.id,
        },
      });

      if (rolePermission) {
        return next(); // Permission granted by Role
      }

      // 4️⃣ Check User-level override (The Exception)
      const userPermission = await UserPermission.findOne({
        where: {
          assignment_id: assignmentId,
          permission_id: permission.id,
        },
      });

      if (userPermission) {
        return next(); // Permission granted by Override
      }

      // 5️⃣ Permission denied
      return next(
        new AppError(
          "You do not have permission to perform this action",
          403
        )
      );
    } catch (error) {
      next(error);
    }
  };
};





module.exports = {
  protect,
  levelGuard,
  assignmentMiddleware,
  permissionMiddleware
};
