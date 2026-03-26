const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ChildAssessment = sequelize.define(
    "ChildAssessment",
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
        child_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Children",
                key: "id",
            },
        },
        talk_sing_frequency: {
            type: DataTypes.INTEGER, // 0, 1, 2 (as per user request mapping)
            allowNull: false,
        },
        play_frequency: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        story_read_frequency: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        outdoor_play_frequency: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        responsive_care: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        positive_discipline: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
        up_to_date_vaccination: {
            type: DataTypes.ENUM("YES", "NO", "NA"),
            allowNull: false,
        },
        feeding_status: {
            type: DataTypes.ARRAY(DataTypes.STRING), // Exclusive breastfeeding, Complementary, Balanced diet
            defaultValue: [],
        },
        nutritional_status: {
            type: DataTypes.ENUM("SAM", "MAM", "NORMAL", "NA"),
            allowNull: false,
        },
        abuse_violence_signs: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        abuse_violence_specification: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        developmental_milestone: {
            type: DataTypes.ENUM("ND", "SD", "DD"), // No Delay, Suspected Delay, Developmental Delay
            allowNull: false,
        },
        disability_screening: {
            type: DataTypes.ARRAY(DataTypes.STRING), // MD, HD, SD, SPD, BP, NO
            defaultValue: [],
        },
        has_books: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        plays_with_toys: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        toy_type: {
            type: DataTypes.ENUM("HOMEMADE", "SHOP", "BOTH", "NA"),
            defaultValue: "NA",
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
        tableName: "ChildAssessments",
    }
);

module.exports = ChildAssessment;
