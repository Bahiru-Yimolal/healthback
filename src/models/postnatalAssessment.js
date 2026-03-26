const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PostnatalAssessment = sequelize.define(
    "PostnatalAssessment",
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
        mother_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "LactatingMothers",
                key: "id",
            },
        },
        pnc_followup_started: {
            type: DataTypes.ENUM("YES", "NO", "NA"),
            allowNull: false,
        },
        pnc_followup_dropped: {
            type: DataTypes.ENUM("YES", "NO", "NA"),
            allowNull: false,
        },
        health_danger_signs: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        substance_use: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        maternal_depression_signs: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        diverse_diet_extra_meal: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        iron_folic_acid_supplement: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        partner_family_support: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        violence_signs: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        newborn_stimulation_activities: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
        infant_care_practices: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
        referred_to_facility: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        referral_reason: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        timestamps: true,
        paranoid: true,
        tableName: "PostnatalAssessments",
    }
);

module.exports = PostnatalAssessment;
