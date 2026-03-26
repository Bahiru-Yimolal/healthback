const User = require("./userModel");
const AdministrativeUnit = require("./administrativeUnitModel");
const Role = require("./roleModel");
const Permission = require("./permissionModel");
const UserAssignment = require("./userAssignment");
const UserPermission = require("./userPermissionModel"); // Repurposed for Overrides
const RolePermission = require("./rolePermissionModel"); // New Role-based permissions
const AuditLog = require("./auditLogModel");
const Family = require("./familyModel");
const PregnantMother = require("./pregnantMotherModel");
const LactatingMother = require("./lactatingMotherModel");
const Child = require("./childModel");
const HouseholdVisit = require("./householdVisit");
const PregnantAssessment = require("./pregnantAssessment");
const PostnatalAssessment = require("./postnatalAssessment");
const ChildAssessment = require("./childAssessment");
const Referral = require("./referral");
const LoginLog = require("./loginLogModel");
const SupervisionRecord = require("./supervisionModel");

// User -> UserAssignment
User.hasMany(UserAssignment, { foreignKey: "user_id" });
UserAssignment.belongsTo(User, { foreignKey: "user_id" });

// Unit -> UserAssignment
AdministrativeUnit.hasMany(UserAssignment, { foreignKey: "unit_id" });
UserAssignment.belongsTo(AdministrativeUnit, { foreignKey: "unit_id" });

// Role -> UserAssignment
Role.hasMany(UserAssignment, { foreignKey: "role_id" });
UserAssignment.belongsTo(Role, { foreignKey: "role_id" });

// AdministrativeUnit Self-reference for Hierarchy
AdministrativeUnit.hasMany(AdministrativeUnit, { foreignKey: "parent_id", as: "SubUnits" });
AdministrativeUnit.belongsTo(AdministrativeUnit, { foreignKey: "parent_id", as: "ParentUnit" });

// --- HYBRID RBAC ASSOCIATIONS ---

// 1. Role-based Permissions (The Standard)
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "role_id",
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permission_id",
});

Role.hasMany(RolePermission, { foreignKey: "role_id" });
RolePermission.belongsTo(Role, { foreignKey: "role_id" });

Permission.hasMany(RolePermission, { foreignKey: "permission_id" });
RolePermission.belongsTo(Permission, { foreignKey: "permission_id" });

// 2. User-specific Overrides (The Exception)
UserAssignment.hasMany(UserPermission, { foreignKey: "assignment_id" });
UserPermission.belongsTo(UserAssignment, { foreignKey: "assignment_id" });

Permission.hasMany(UserPermission, { foreignKey: "permission_id" });
UserPermission.belongsTo(Permission, { foreignKey: "permission_id" });

// AuditLog associations
AuditLog.belongsTo(User, { foreignKey: "user_id" });
AuditLog.belongsTo(AdministrativeUnit, { foreignKey: "unit_id" });

// --- FAMILY & DEPENDENT ASSOCIATIONS ---

// Family -> AdministrativeUnit (Block)
AdministrativeUnit.hasMany(Family, { foreignKey: "block_id", as: "Families" });
Family.belongsTo(AdministrativeUnit, { foreignKey: "block_id", as: "Block" });

// Family -> User (Created By)
User.hasMany(Family, { foreignKey: "created_by" });
Family.belongsTo(User, { foreignKey: "created_by", as: "Creator" });

// Family -> PregnantMother (1-to-1)
Family.hasOne(PregnantMother, { foreignKey: "family_id", onDelete: "CASCADE" });
PregnantMother.belongsTo(Family, { foreignKey: "family_id" });

// Family -> LactatingMother (1-to-1)
Family.hasOne(LactatingMother, { foreignKey: "family_id", onDelete: "CASCADE" });
LactatingMother.belongsTo(Family, { foreignKey: "family_id" });

// Family -> Child (1-to-Many)
Family.hasMany(Child, { foreignKey: "family_id", onDelete: "CASCADE" });
Child.belongsTo(Family, { foreignKey: "family_id" });

// --- VISIT & ASSESSMENT ASSOCIATIONS ---

// HouseholdVisit -> User (Visitor)
User.hasMany(HouseholdVisit, { foreignKey: "visitor_id" });
HouseholdVisit.belongsTo(User, { foreignKey: "visitor_id", as: "Visitor" });

// HouseholdVisit -> Family
Family.hasMany(HouseholdVisit, { foreignKey: "family_id" });
HouseholdVisit.belongsTo(Family, { foreignKey: "family_id", as: "Family" });

// HouseholdVisit -> Assessments (1-to-1 per visit type)
HouseholdVisit.hasOne(PregnantAssessment, { foreignKey: "visit_id", onDelete: "CASCADE" });
PregnantAssessment.belongsTo(HouseholdVisit, { foreignKey: "visit_id", as: "visit" });

HouseholdVisit.hasOne(PostnatalAssessment, { foreignKey: "visit_id", onDelete: "CASCADE" });
PostnatalAssessment.belongsTo(HouseholdVisit, { foreignKey: "visit_id", as: "visit" });

HouseholdVisit.hasOne(ChildAssessment, { foreignKey: "visit_id", onDelete: "CASCADE" });
ChildAssessment.belongsTo(HouseholdVisit, { foreignKey: "visit_id", as: "visit" });

// Assessments -> Dependent Models
PregnantAssessment.belongsTo(PregnantMother, { foreignKey: "mother_id", as: "mother" });
PregnantMother.hasMany(PregnantAssessment, { foreignKey: "mother_id" });

PostnatalAssessment.belongsTo(LactatingMother, { foreignKey: "mother_id", as: "mother" });
LactatingMother.hasMany(PostnatalAssessment, { foreignKey: "mother_id" });

ChildAssessment.belongsTo(Child, { foreignKey: "child_id", as: "child" });
Child.hasMany(ChildAssessment, { foreignKey: "child_id" });

// --- REFERRAL ASSOCIATIONS ---

HouseholdVisit.hasMany(Referral, { foreignKey: "visit_id" });
Referral.belongsTo(HouseholdVisit, { foreignKey: "visit_id" });

User.hasMany(Referral, { foreignKey: "pc_worker_id" });
Referral.belongsTo(User, { foreignKey: "pc_worker_id", as: "PCWorker" });

Referral.belongsTo(AdministrativeUnit, { foreignKey: "health_facility_id", as: "HealthFacility" });
AdministrativeUnit.hasMany(Referral, { foreignKey: "health_facility_id", as: "Referrals" });

Referral.belongsTo(User, { foreignKey: "feedback_by", as: "FeedbackProvider" });

// Assessments -> Referrals (One-to-One: an assessment can trigger one referral)
PregnantAssessment.hasOne(Referral, { foreignKey: "assessment_id", constraints: false });
Referral.belongsTo(PregnantAssessment, { foreignKey: "assessment_id", constraints: false });

PostnatalAssessment.hasOne(Referral, { foreignKey: "assessment_id", constraints: false });
Referral.belongsTo(PostnatalAssessment, { foreignKey: "assessment_id", constraints: false });

ChildAssessment.hasOne(Referral, { foreignKey: "assessment_id", constraints: false });
Referral.belongsTo(ChildAssessment, { foreignKey: "assessment_id", constraints: false });

User.hasMany(LoginLog, { foreignKey: "user_id" });
LoginLog.belongsTo(User, { foreignKey: "user_id" });

// --- SUPERVISION ASSOCIATIONS ---
User.hasMany(SupervisionRecord, { foreignKey: "evaluator_id", as: "EvaluatedRecords" });
SupervisionRecord.belongsTo(User, { foreignKey: "evaluator_id", as: "Evaluator" });

User.hasMany(SupervisionRecord, { foreignKey: "evaluatee_id", as: "SupervisionHistory" });
SupervisionRecord.belongsTo(User, { foreignKey: "evaluatee_id", as: "Evaluatee" });

AdministrativeUnit.hasMany(SupervisionRecord, { foreignKey: "unit_id", as: "SupervisionReports" });
SupervisionRecord.belongsTo(AdministrativeUnit, { foreignKey: "unit_id", as: "Unit" });

module.exports = {
  User,
  AdministrativeUnit,
  Role,
  Permission,
  UserAssignment,
  UserPermission,
  RolePermission,
  AuditLog,
  Family,
  PregnantMother,
  LactatingMother,
  Child,
  HouseholdVisit,
  PregnantAssessment,
  PostnatalAssessment,
  ChildAssessment,
  Referral,
  LoginLog,
  SupervisionRecord,
};
