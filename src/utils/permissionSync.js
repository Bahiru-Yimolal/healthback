// src/utils/permissionSync.js
const { Permission, Role, RolePermission } = require("../models");
const { Permissions, DefaultRolePermissions } = require("../config/rolePermissions");

/**
 * Syncs permissions defined in code with the database.
 * This ensures new permissions are created and role-level defaults are updated.
 */
const syncPermissions = async () => {
    try {
        console.log("--- Syncing Permissions ---");

        // 1. Sync Permission table
        const permissionNames = Object.values(Permissions);
        for (const name of permissionNames) {
            await Permission.findOrCreate({
                where: { name },
                defaults: { description: `Standard permission for ${name}` },
            });
        }

        // 2. Sync RolePermission table (Default Mapping)
        for (const [roleName, permNames] of Object.entries(DefaultRolePermissions)) {
            const role = await Role.findOne({ where: { name: roleName } });
            if (!role) {
                console.warn(`Warning: Role ${roleName} not found in DB. Skipping permission sync for this role.`);
                continue;
            }

            // Find all permission IDs for this role
            const permissions = await Permission.findAll({
                where: { name: permNames },
            });
            const permissionIds = permissions.map(p => p.id);

            // Get existing role permissions
            const existingRolePermissions = await RolePermission.findAll({
                where: { role_id: role.id },
            });
            const existingPermissionIds = existingRolePermissions.map(rp => rp.permission_id);

            // Add missing permissions
            for (const permId of permissionIds) {
                if (!existingPermissionIds.includes(permId)) {
                    await RolePermission.create({
                        role_id: role.id,
                        permission_id: permId,
                    });
                }
            }

            // Remove retired permissions (optional but keeps DB clean)
            for (const existingRP of existingRolePermissions) {
                if (!permissionIds.includes(existingRP.permission_id)) {
                    await existingRP.destroy();
                }
            }
        }

        console.log("--- Permissions Sync Completed ---");
    } catch (error) {
        console.error("Error syncing permissions:", error);
    }
};

module.exports = syncPermissions;
