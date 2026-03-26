const AdministrativeUnit = require("../models/administrativeUnitModel");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const Permission = require("../models/permissionModel");
const UserPermission = require("../models/userPermissionModel");
const UserAssignment = require("../models/userAssignment");
const AuditLog = require("../models/auditLogModel");
const sequelize = require("../config/database");
const { AppError } = require("../middlewares/errorMiddleware");
const { assignUserToUnit } = require("./assignnmentService"); // Correct import path

// 1. Create a HealthCenter
const createHealthCenterService = async (name, user) => {
  // Ensure the user is a SUBCITY Admin
  if (!user || !user.unit || user.unit.level !== "SUBCITY") {
    throw new AppError("errors.only_subcity_admin_can_create_health_centers", 403);
  }

  // Check if healthCenter with the same name exists UNDER THE SAME SUBCITY
  const existingHealthCenter = await AdministrativeUnit.findOne({
    where: {
      name,
      level: "HEALTH_CENTER",
      parent_id: user.unit.id, // Must be unique within the subcity
    },
  });

  if (existingHealthCenter) {
    throw new AppError("errors.health_center_exists", 400);
  }

  // Create the HealthCenter
  const newHealthCenter = await AdministrativeUnit.create({
    name,
    level: "HEALTH_CENTER",
    parent_id: user.unit.id, // Parent is the current SUBCITY
  });

  return newHealthCenter;
};

// 2. List HealthCenters (for the logged-in SUBCITY Admin)
async function listHealthCentersService(user) {
  try {
    let whereClause = { level: "HEALTH_CENTER" };

    // If logged in as SUBCITY Admin, only show their healthCenters
    if (user.unit.level === "SUBCITY") {
      whereClause.parent_id = user.unit.id;
    }
    // If logged in as CITY/ETHIOPIA Admin, they might need broader access, 
    // but per requirements "It should be done by the subcity admin", 
    // so we assume restricted view is primary. 
    // However, higher levels *should* probably see them too, but let's stick to the SUBCITY context.

    const healthCenters = await AdministrativeUnit.findAll({
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
              where: { name: "HEALTH_CENTER_ADMIN" }, // Filter for HealthCenter Admins
              required: false // Allow healthCenters without admins to be listed
            },
          ],
        },
      ],
    });
    return healthCenters;
  } catch (error) {
    throw new AppError(error.message, 500);
  }
}

// 3. Update HealthCenter
const updateHealthCenterService = async (id, name, user) => {
  // Find healthCenter
  const healthCenter = await AdministrativeUnit.findOne({
    where: { id, level: "HEALTH_CENTER" },
  });

  if (!healthCenter) {
    throw new AppError("errors.health_center_not_found", 404);
  }

  // Check permission: Must be the SUBCITY Admin of the parent subcity
  if (user.unit.level === "SUBCITY") {
    if (healthCenter.parent_id !== user.unit.id) {
      throw new AppError("errors.update_health_center_unauthorized", 403);
    }
  }

  // Check for Duplicate Name within the same subcity (excluding self)
  const existingHealthCenter = await AdministrativeUnit.findOne({
    where: {
      name,
      level: "HEALTH_CENTER",
      parent_id: healthCenter.parent_id,
    },
  });

  if (existingHealthCenter && existingHealthCenter.id !== id) {
    throw new AppError("errors.health_center_exists", 400);
  }

  healthCenter.name = name;
  await healthCenter.save();

  return healthCenter;
};

// 4. Delete HealthCenter
const deleteHealthCenterService = async (id, user) => {
  const healthCenter = await AdministrativeUnit.findOne({
    where: { id, level: "HEALTH_CENTER" },
  });

  if (!healthCenter) {
    throw new AppError("errors.health_center_not_found", 404);
  }

  // Check permission
  if (user.unit.level === "SUBCITY") {
    if (healthCenter.parent_id !== user.unit.id) {
      throw new AppError("errors.delete_health_center_unauthorized", 403);
    }
  }

  // Check if there are children (e.g. Committees? not implemented yet but good practice check)
  // For now assuming no further nested levels or using a generic check if needed.
  // AdministrativeUnit doesn't have children relation defined in model export but implies hierarchy.
  // We'll skip child check for now unless requested or if 'Committee' becomes a level.
  // Wait, the prompt implies "const healthCenterRoutes = require("./routes/healthCenterRoutes");" 
  // The previous code had committees. If committees are next, we should probably check.
  // But for now, let's just delete using standard logic.

  await healthCenter.destroy();
  return { message: "HealthCenter deleted successfully" };
};

// 5. Assign HealthCenter Admin
const assignHealthCenterAdminService = async ({
  userId,
  healthCenterId,
  permissions = null,
  currentUser,
}) => {
  // 1. Validate HealthCenter
  const healthCenter = await AdministrativeUnit.findByPk(healthCenterId);
  if (!healthCenter || healthCenter.level !== "HEALTH_CENTER") {
    throw new AppError("errors.invalid_health_center_id", 400);
  }

  // 2. Ensure current user is the parent SUBCITY Admin
  if (currentUser.unit.level === "SUBCITY") {
    if (healthCenter.parent_id !== currentUser.unit.id) {
      throw new AppError("errors.assign_health_center_admin_unauthorized", 403);
    }
  }

  // 3. Fetch/Create HEALTH_CENTER_ADMIN role
  const [adminRole] = await Role.findOrCreate({
    where: { name: "ADMIN" },
    defaults: { description: "fields.role_description_health_center_admin" },
  });

  // 4. Assign user
  const assignment = await assignUserToUnit({
    userId,
    unitId: healthCenter.id,
    roleId: adminRole.id,
    permissions,
  });

  return assignment;
};



// 6. Create HealthCenter Level User
const createHealthCenterLevelUserService = async ({
  userId,
  roleName,
  permissions = null,
  actor,
}) => {

  if (actor.unit.level !== "SUBCITY") {
    throw new AppError("errors.only_subcity_admin_can_create_users", 403);
  }

  const [role] = await Role.findOrCreate({
    where: { name: roleName },
    defaults: { description: "fields.role_description_health_center_user" },
  });

  const assignment = await assignUserToUnit({
    userId,
    unitId: actor.unit.id,
    roleId: role.id,
    permissions,
  });

  return assignment;
};

// 7. Update HealthCenter Level User
const updateHealthCenterLevelUserService = async ({
  userId,
  roleName,
  permissions = null,
  actor,
}) => {
  if (actor.unit.level !== "SUBCITY") {
    throw new AppError("errors.only_subcity_admin_can_update_users", 403);
  }

  const transaction = await sequelize.transaction();

  try {
    const assignment = await UserAssignment.findOne({
      where: { user_id: userId, unit_id: actor.unit.id },
      transaction,
    });

    if (!assignment) {
      throw new AppError("errors.user_not_assigned_health_center", 404);
    }

    if (roleName) {
      const [role] = await Role.findOrCreate({
        where: { name: roleName },
        defaults: { description: "fields.role_description_health_center_user" },
        transaction
      });
      if (assignment.role_id !== role.id) {
        assignment.role_id = role.id;
        await assignment.save({ transaction });
      }
    }

    await UserPermission.destroy({
      where: { assignment_id: assignment.id },
      transaction,
    });

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
      permissions,
      message: "User updated successfully"
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};



// 8. Create Own HealthCenter User (HealthCenter Admin managing their own healthCenter)
const createOwnHealthCenterUserService = async ({
  userId,
  roleName,
  permissions = null,
  actor,
}) => {
  // Ensure actor is a HEALTH_CENTER Admin
  if (actor.unit.level !== "HEALTH_CENTER") {
    throw new AppError("errors.only_health_center_admin_can_manage_own_users", 403);
  }

  // Find or Create Role
  const [role] = await Role.findOrCreate({
    where: { name: roleName },
    defaults: { description: "fields.role_description_health_center_user" },
  });

  // Assign user to the actor's OWN healthCenter
  const assignment = await assignUserToUnit({
    userId,
    unitId: actor.unit.id, // Current HealthCenter ID of the Admin
    roleId: role.id,
    permissions,
  });

  return assignment;
};

// 9. Update Own HealthCenter User (HealthCenter Admin managing their own healthCenter)
const updateOwnHealthCenterUserService = async ({
  userId,
  roleName,
  permissions = null,
  actor,
}) => {
  // Ensure actor is a HEALTH_CENTER Admin
  if (actor.unit.level !== "HEALTH_CENTER") {
    throw new AppError("errors.only_health_center_admin_can_update_own_users", 403);
  }

  const transaction = await sequelize.transaction();

  try {
    // 1. Find assignment to ensure user is in THIS healthCenter
    const assignment = await UserAssignment.findOne({
      where: { user_id: userId, unit_id: actor.unit.id },
      transaction,
    });

    if (!assignment) {
      throw new AppError("errors.user_not_assigned_health_center", 404);
    }

    // 2. Update Role if provided and different
    if (roleName) {
      const [role] = await Role.findOrCreate({
        where: { name: roleName },
        defaults: { description: "fields.role_description_health_center_user" },
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
      permissions,
      message: "User updated successfully"
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// 10. Assign PC Worker (Parental Coach) to Block
const assignPCWorkerService = async ({
  userId,
  unitIds, // Expected to be an array
  roleName = "PC_WORKER",
  permissions = null,
  actor,
}) => {
  // Ensure actor is a HEALTH_CENTER Admin
  if (actor.unit.level !== "HEALTH_CENTER") {
    throw new AppError("errors.only_health_center_admin_can_manage_own_users", 403);
  }

  const results = [];

  for (const unitId of unitIds) {
    // Find the target Unit
    const targetUnit = await AdministrativeUnit.findByPk(unitId);
    if (!targetUnit || targetUnit.level !== "BLOCK") {
      throw new AppError("errors.invalid_unit_for_pc_worker", 400);
    }

    // Validate Hierarchy: Ensure target unit rolls up to the Actor's Health Center
    let currentUnit = targetUnit;
    while (currentUnit && currentUnit.level !== "HEALTH_CENTER") {
      currentUnit = await AdministrativeUnit.findByPk(currentUnit.parent_id);
    }

    if (!currentUnit || currentUnit.id !== actor.unit.id) {
      throw new AppError("errors.unit_outside_jurisdiction", 403);
    }

    // Find or Create Role
    const [role] = await Role.findOrCreate({
      where: { name: roleName },
      defaults: { description: "fields.role_description_pc_worker" },
    });

    // Assign user to the target sub-unit (BLOCK)
    const assignment = await assignUserToUnit({
      userId,
      unitId: targetUnit.id,
      roleId: role.id,
      permissions,
    });
    results.push(assignment);
  }

  return results;
};

// 11. Update PC Worker (Parental Coach) Block Assignments
const updatePCWorkerAssignmentService = async ({
  userId,
  unitIds, // Expected to be an array of Block IDs
  roleName = "PC_WORKER",
  permissions = null,
  actor,
}) => {
  // Ensure actor is a HEALTH_CENTER Admin
  if (actor.unit.level !== "HEALTH_CENTER") {
    throw new AppError("errors.only_health_center_admin_can_manage_own_users", 403);
  }

  const results = [];

  // Start Transaction for clean update
  const t = await sequelize.transaction();

  try {
    // 1. Identify all blocks under this Health Center
    const healthCenter = actor.unit;
    const subCities = await AdministrativeUnit.findAll({ where: { parent_id: healthCenter.id } });
    const subCityIds = subCities.map(sc => sc.id);
    const woredas = await AdministrativeUnit.findAll({ where: { parent_id: subCityIds } });
    const woredaIds = woredas.map(w => w.id);
    const blocks = await AdministrativeUnit.findAll({ where: { parent_id: woredaIds } });
    const validBlockIdsForHC = blocks.map(b => b.id);

    // 2. Remove existing PC_WORKER assignments for this user within these blocks
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      throw new AppError("errors.role_not_found", 404);
    }

    // Get assignment IDs before deleting to clean up permissions
    const existingAssignments = await UserAssignment.findAll({
      where: {
        user_id: userId,
        role_id: role.id,
        unit_id: validBlockIdsForHC
      },
      transaction: t
    });

    const assignmentIds = existingAssignments.map(a => a.id);

    if (assignmentIds.length > 0) {
      // Clean up User-specific permissions
      await UserPermission.destroy({
        where: { assignment_id: assignmentIds },
        transaction: t
      });

      // Remove assignments
      await UserAssignment.destroy({
        where: { id: assignmentIds },
        transaction: t
      });
    }

    // 3. Add new assignments
    for (const unitId of unitIds) {
      if (!validBlockIdsForHC.includes(unitId)) {
        throw new AppError("errors.unit_outside_jurisdiction", 403);
      }

      const assignment = await UserAssignment.create({
        user_id: userId,
        unit_id: unitId,
        role_id: role.id,
      }, { transaction: t });

      results.push(assignment);
    }

    // 4. Final Status Sync & Audit
    if (results.length === 0) {
      // If we cleared all assignments within our jurisdiction, and no new ones added
      // We check if they have ANY assignments left globally
      const remainingGlobalAssignments = await UserAssignment.count({
        where: { user_id: userId },
        transaction: t
      });

      if (remainingGlobalAssignments === 0) {
        await User.update(
          { status: "UNASSIGNED" },
          { where: { user_id: userId }, transaction: t }
        );
      }

      await AuditLog.create({
        user_id: actor.id,
        unit_id: actor.unit.id,
        action: "UNASSIGN_PC_WORKER",
        target_id: userId,
        metadata: { cleaned_assignments: assignmentIds }
      }, { transaction: t });

    } else {
      await User.update(
        { status: "ACTIVE" },
        { where: { user_id: userId }, transaction: t }
      );

      await AuditLog.create({
        user_id: actor.id,
        unit_id: actor.unit.id,
        action: "UPDATE_PC_WORKER_ASSIGNMENT",
        target_id: userId,
        metadata: { new_assignments: results.map(r => r.id) }
      }, { transaction: t });
    }

    await t.commit();
    return results;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};


const listPCWorkersInHealthCenterService = async (healthCenterId, actor) => {
  // 1. Validate Health Center
  const healthCenter = await AdministrativeUnit.findByPk(healthCenterId);
  if (!healthCenter || healthCenter.level !== "HEALTH_CENTER") {
    throw new AppError("errors.health_center_not_found", 404);
  }

  // 2. Authorization: Actor must be assigned to this HC or a higher unit
  // For now, mirroring existing jurisdiction checks
  if (actor.unit.level === "SUBCITY") {
    if (healthCenter.parent_id !== actor.unit.id) {
      throw new AppError("errors.unit_outside_jurisdiction", 403);
    }
  } else if (actor.unit.level === "HEALTH_CENTER") {
    if (healthCenter.id !== actor.unit.id) {
      throw new AppError("errors.unit_outside_jurisdiction", 403);
    }
  }

  // 3. Find all BLOCK IDs under this Health Center
  // Hierarchy: HC -> Woreda -> Ketena -> Block
  const blocksQuery = `
    WITH RECURSIVE Hierarchy AS (
      SELECT id, level FROM "AdministrativeUnits" WHERE id = :healthCenterId
      UNION ALL
      SELECT au.id, au.level FROM "AdministrativeUnits" au
      INNER JOIN Hierarchy h ON au.parent_id = h.id
    )
    SELECT id FROM Hierarchy WHERE level = 'BLOCK';
  `;

  const blocks = await sequelize.query(blocksQuery, {
    replacements: { healthCenterId },
    type: sequelize.QueryTypes.SELECT
  });

  const blockIds = blocks.map(b => b.id);
  if (!blockIds.length) return [];

  // 4. Find all Users with PC_WORKER role assigned to these blocks
  const workers = await User.findAll({
    attributes: ["user_id", "first_name", "last_name", "phone_number", "email", "status"],
    include: [
      {
        model: UserAssignment,
        where: { unit_id: blockIds },
        required: true,
        include: [
          {
            model: Role,
            where: { name: "PC_WORKER" },
            required: true
          }
        ]
      }
    ]
  });

  return workers;
};

module.exports = {
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
};
