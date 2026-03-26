const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const HouseholdVisit = sequelize.define(
    "HouseholdVisit",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        family_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Families",
                key: "id",
            },
        },
        visitor_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Users",
                key: "user_id",
            },
        },
        visit_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        visit_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
        },
        next_appointment_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        service_type: {
            type: DataTypes.ENUM("ASSESSMENT", "GENERAL_COUNSELING", "OFFICIAL_SUPPORT_CHECK", "OTHER"),
            defaultValue: "ASSESSMENT",
        },
        is_eligible_for_support: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_vulnerable: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        course_completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    },
    {
        timestamps: true,
        paranoid: true,
        tableName: "HouseholdVisits",
    }
);

module.exports = HouseholdVisit;
