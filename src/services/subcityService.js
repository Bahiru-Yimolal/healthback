// services/subcityService.js
const AdministrativeUnit = require("../models/administrativeUnitModel");
const UserAssignment = require("../models/userAssignment");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const Permission = require("../models/permissionModel");
const UserPermission = require("../models/userPermissionModel");
const sequelize = require("../config/database");
const { AppError } = require("../middlewares/errorMiddleware");
const { Op } = require("sequelize");
const { assignUserToUnit } = require("./assignnmentService");

// 1. Create Subcity
const createSubcityService = async (name, user) => {
  try {
    // Ensure the user is assigned to a CITY
    if (user.unit.level !== "CITY") {
      throw new AppError("errors.only_city_admin_can_create_subcities", 403);
    }

    // Check if subcity already exists under this city
    const existingSubcity = await AdministrativeUnit.findOne({
      where: {
        name,
        level: "SUBCITY",
        parent_id: user.unit.id
      },
    });

    if (existingSubcity) {
      throw new AppError("errors.subcity_exists", 400);
    }

    // Create the subcity
    const newSubcity = await AdministrativeUnit.create({
      name,
      level: "SUBCITY",
      parent_id: user.unit.id, // Current City ID
    });

    return newSubcity;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("errors.create_subcity_error", 500);
  }
};

// 2. List Subcities
const listSubcitiesService = async (user) => {
  try {
    // If the user is a City Admin, list only their subcities
    // If the user is Ethiopia Admin, maybe list all? 
    // For now, assuming constraint to the user's scope or simply listing children if user is City level.
    // If user is Ethiopia level, they might want to see all subcities or filter by city.
    // Let's stick to the requester's context: "CRUD for subcities which is done by the city admin"

    let whereClause = { level: "SUBCITY" };

    if (user.unit.level === "CITY") {
      whereClause.parent_id = user.unit.id;
    }

    const subcities = await AdministrativeUnit.findAll({
      where: whereClause,
      include: [
        {
          model: UserAssignment,
          required: false,
          include: [
            {
              model: User,
              attributes: ["user_id", "first_name", "last_name", "email", "phone_number", "status"],
            },
            {
              model: Role,
              where: { name: "SUBCITY_ADMIN" }, // Assuming a role for subcity admins exists or will exist
              required: false // Don't filter out subcities without admins if we just want the list
            },
          ],
        },
      ],
    });

    return subcities;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("errors.fetch_subcities_error", 500);
  }
};

// 3. Update Subcity
const updateSubcityService = async (subcityId, name, user) => {
  try {
    const whereClause = { id: subcityId, level: "SUBCITY" };

    // Ensure City Admin can only update their own subcities
    if (user.unit.level === "CITY") {
      whereClause.parent_id = user.unit.id;
    }

    const subcity = await AdministrativeUnit.findOne({
      where: whereClause,
    });

    if (!subcity) throw new AppError("errors.subcity_not_found", 404);

    // Check for duplicate name in the same city
    const duplicate = await AdministrativeUnit.findOne({
      where: {
        name,
        level: "SUBCITY",
        parent_id: subcity.parent_id,
        id: { [Op.ne]: subcityId }
      },
    });

    if (duplicate) throw new AppError("errors.subcity_exists", 400);

    subcity.name = name;
    await subcity.save();

    return subcity;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("errors.update_subcity_error", 500);
  }
};

// 4. Delete Subcity
const deleteSubcityService = async (subcityId, user) => {
  try {
    const whereClause = { id: subcityId, level: "SUBCITY" };

    if (user.unit.level === "CITY") {
      whereClause.parent_id = user.unit.id;
    }

    const subcity = await AdministrativeUnit.findOne({
      where: whereClause,
    });

    if (!subcity) throw new AppError("errors.subcity_not_found", 404);

    // Check for child units (e.g. Woredas)
    const childCount = await AdministrativeUnit.count({
      where: { parent_id: subcity.id },
    });

    if (childCount > 0) {
      throw new AppError(
        "errors.subcity_has_woredas",
        400
      );
    }

    await subcity.destroy();

    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("errors.delete_subcity_error", 500);
  }
};

// 5. Assign Subcity Admin
const assignSubcityAdminService = async ({
  userId,
  subcityId,
  permissions = null,
  currentUser,
}) => {
  // 1. Validate Subcity
  const subcity = await AdministrativeUnit.findByPk(subcityId);
  if (!subcity || subcity.level !== "SUBCITY") {
    throw new AppError("errors.invalid_subcity_id", 400);
  }

  // 2. Ensure current user is the parent City Admin (or Ethiopia Admin)
  if (currentUser.unit.level === "CITY") {
    if (subcity.parent_id !== currentUser.unit.id) {
      throw new AppError("errors.assign_subcity_admin_unauthorized", 403);
    }
  }

  // 3. Fetch/Create SUBCITY_ADMIN role
  const [adminRole] = await Role.findOrCreate({
    where: { name: "ADMIN" },
    defaults: { description: "fields.role_description_subcity_admin" },
  });

  // 4. Assign user
  // We need to import assignUserToUnit.  It is not currently imported.
  // I will add the import at the top of the file in a separate edit or include it here if I could, 
  // but since I am appending, I will assume I need to fix imports next.
  // Actually, I can use the require here if I don't want to mess up top level imports yet, 
  // OR I can just fail if it's not imported and fix it. 
  // Let me check the top of the file. I did not include it in the previous write.
  // I will assume I need to add the import. 

  const { assignUserToUnit } = require("./assignnmentService");

  const assignment = await assignUserToUnit({
    userId,
    unitId: subcity.id,
    roleId: adminRole.id,
    permissions,
  });

  return assignment;
};

// 6. Create Subcity Level User
const createCityLevelUserService = async ({
  userId,
  roleName,
  permissions = null,
  actor,
}) => {
  // Ensure actor is a SUBCITY Admin
  if (actor.unit.level !== "CITY") {
    throw new AppError("errors.only_city_admin_can_create_users", 403);
  }

  // Find or Create Role
  const [role] = await Role.findOrCreate({
    where: { name: roleName },
    defaults: { description: "fields.role_description_subcity_user" },
  });

  // Assign user to the actor's subcity
  const assignment = await assignUserToUnit({
    userId,
    unitId: actor.unit.id,
    roleId: role.id,
    permissions,
  });

  return assignment;
};

// 7. Update Subcity Level User (Permissions)
const updateCityLevelUserService = async ({
  userId,
  roleName, // Kept for consistency but sticking to permission updates primarily if per user request
  permissions = null,
  actor,
}) => {
  // Ensure actor is a SUBCITY Admin
  if (actor.unit.level !== "CITY") {
    throw new AppError("errors.only_city_admin_can_create_users", 403);
  }

  const transaction = await sequelize.transaction();

  try {
    // 1. Find assignment to ensure user is in THIS subcity
    const assignment = await UserAssignment.findOne({
      where: { user_id: userId, unit_id: actor.unit.id },
      transaction,
    });

    if (!assignment) {
      throw new AppError("errors.user_not_assigned_subcity", 404);
    }

    // 2. Update Role if provided and different
    if (roleName) {
      const [role] = await Role.findOrCreate({
        where: { name: roleName },
        defaults: { description: "fields.role_description_subcity_user" },
        transaction
      });
      if (assignment.role_id !== role.id) {
        assignment.role_id = role.id;
        await assignment.save({ transaction });
      }
    }

    // 3. Update Permissions
    // Delete existing
    await UserPermission.destroy({
      where: { assignment_id: assignment.id },
      transaction,
    });

    // Assign new
    if (permissions && permissions.length > 0) {
      const perms = await Permission.findAll({
        where: { name: permissions },
        transaction,
      });

      await Promise.all(
        perms.map((perm) =>
          UserPermission.create(
            { assignment_id: assignment.id, permission_id: perm.id },
            { transaction }
          )
        )
      );
    }

    await transaction.commit();

    return {
      userId,
      role: roleName,
      overrides: permissions, // Clarify as overrides
      message: "User updated successfully"
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  createSubcityService,
  listSubcitiesService,
  updateSubcityService,
  deleteSubcityService,
  assignSubcityAdminService,
  createCityLevelUserService,
  updateCityLevelUserService,
};
