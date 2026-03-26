// src/config/rolePermissions.js

const Roles = {
    ADMIN: "ADMIN",
    HEAD: "HEAD",
    SUPERVISOR: "SUPERVISOR",
    PC_WORKER: "PC_WORKER",
    DATA_ENCODER: "DATA_ENCODER",
    FACILITY: "FACILITY",
};

const Permissions = {
    ADMIN_PERMISSIONS: "ADMIN_PERMISSIONS",
    MANAGE_COMMUNITY_UNITS: "MANAGE_COMMUNITY_UNITS",
    MANAGE_FAMILIES: "MANAGE_FAMILIES",
    ASSIGN_PC_WORKERS: "ASSIGN_PC_WORKERS",
    EXPORT_REPORTS: "EXPORT_REPORTS",
    MANAGE_VISITS: "MANAGE_VISITS",
    RECEIVE_REFERRALS: "RECEIVE_REFERRALS",
    VIEW_SUPERVISION: "VIEW_SUPERVISION",
    MANAGE_SUPERVISION: "MANAGE_SUPERVISION",
};

const DefaultRolePermissions = {
    [Roles.ADMIN]: [
        Permissions.ADMIN_PERMISSIONS,
        Permissions.ASSIGN_PC_WORKERS,
        Permissions.MANAGE_FAMILIES,
        Permissions.MANAGE_COMMUNITY_UNITS,
        Permissions.MANAGE_VISITS,
        Permissions.EXPORT_REPORTS,
        Permissions.VIEW_SUPERVISION,
        Permissions.MANAGE_SUPERVISION,
    ],
    [Roles.HEAD]: [
        Permissions.EXPORT_REPORTS,
    ],
    [Roles.SUPERVISOR]: [
        Permissions.ADMIN_PERMISSIONS,
        Permissions.ASSIGN_PC_WORKERS,
        Permissions.MANAGE_FAMILIES,
        Permissions.MANAGE_COMMUNITY_UNITS,
        Permissions.MANAGE_VISITS,
        Permissions.EXPORT_REPORTS,
        Permissions.VIEW_SUPERVISION,
        Permissions.MANAGE_SUPERVISION,
    ],
    [Roles.PC_WORKER]: [
        Permissions.MANAGE_FAMILIES,
        Permissions.MANAGE_VISITS,
        Permissions.EXPORT_REPORTS,
    ],
    [Roles.DATA_ENCODER]: [
        Permissions.MANAGE_FAMILIES,
    ],
    [Roles.FACILITY]: [
        Permissions.MANAGE_VISITS,
        Permissions.RECEIVE_REFERRALS,
        Permissions.EXPORT_REPORTS,
    ],

};

module.exports = {
    Roles,
    Permissions,
    DefaultRolePermissions,
};
