const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Referral = sequelize.define(
    "Referral",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        visit_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "HouseholdVisits",
                key: "id",
            },
        },
        beneficiary_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        beneficiary_type: {
            type: DataTypes.ENUM("CHILD", "PREGNANT_MOTHER", "LACTATING_MOTHER"),
            allowNull: false,
        },
        assessment_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: "Links to the specific assessment (Pregnant, Postnatal, or Child) that triggered this referral"
        },
        pc_worker_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Users",
                key: "user_id",
            },
        },
        health_facility_id: {
            type: DataTypes.UUID,
            allowNull: true, // Assigned facility
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        referral_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        status: {
            type: DataTypes.ENUM("PENDING", "ACCEPTED", "COMPLETED", "REJECTED"),
            defaultValue: "PENDING",
        },
        // Feedback Section
        service_given: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        recommendation: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        feedback_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        feedback_by: {
            type: DataTypes.UUID, // User (Health Facility Staff)
            allowNull: true,
        }
    },
    {
        timestamps: true,
        paranoid: true,
        tableName: "Referrals",
    }
);

module.exports = Referral;
