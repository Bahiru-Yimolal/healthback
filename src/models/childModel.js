const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Child = sequelize.define(
    "Child",
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
        gender: {
            type: DataTypes.ENUM("MALE", "FEMALE"),
            allowNull: false,
        },
        dob: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        vulnerable_to_growth_restriction: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        timestamps: true,
        paranoid: true,
        tableName: "Children",
    }
);

module.exports = Child;
