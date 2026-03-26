const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LactatingMother = sequelize.define(
    "LactatingMother",
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
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        dob: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
    },
    {
        timestamps: true,
        paranoid: true,
        tableName: "LactatingMothers",
    }
);

module.exports = LactatingMother;
