const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PregnantAssessment = sequelize.define(
    "PregnantAssessment",
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
                model: "PregnantMothers",
                key: "id",
            },
        },
        anc_followup_started: {
            type: DataTypes.ENUM("YES", "NO", "NA"),
            allowNull: false,
        },
        anc_followup_dropped: {
            type: DataTypes.ENUM("YES", "NO", "NA"),
            allowNull: false,
        },
        substance_use: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        substance_type: {
            type: DataTypes.STRING,
            allowNull: true,
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
            type: DataTypes.ENUM("YES", "NO", "NA"),
            allowNull: false,
        },
        partner_family_support: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        violence_signs: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        fetal_stimulation_activities: {
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
        tableName: "PregnantAssessments",
    }
);

module.exports = PregnantAssessment;
