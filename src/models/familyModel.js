const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Family = sequelize.define(
    "Family",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        block_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "AdministrativeUnits", // Assuming blocks are AdministrativeUnits
                key: "id",
            },
        },
        registration_number: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        house_number: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        head_of_household_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        phone_number: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        is_vulnerable: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_safetynet_beneficiary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        health_insurance_type: {
            type: DataTypes.ENUM("FREE_OR_SPONSORED", "PAYING", "NOT_BENEFICIARY"),
            allowNull: false,
        },
        is_temporary_direct_support_beneficiary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        guardian_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        guardian_gender: {
            type: DataTypes.ENUM("MALE", "FEMALE"),
            allowNull: true,
        },
        guardian_dob: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        guardian_phone_number: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        course_completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Users",
                key: "user_id",
            },
        },
    },
    {
        timestamps: true,
        paranoid: true, // soft delete
        tableName: "Families",
    }
);

module.exports = Family;
