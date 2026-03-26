const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: true, // Optional for now, or unique if required
      unique: true,
    },
    language_preference: {
      type: DataTypes.ENUM("eng", "am", "orm", "som", "tir", "sid"),
      defaultValue: "eng",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("UNASSIGNED", "ACTIVE", "DEACTIVATED"),
      defaultValue: "UNASSIGNED",
    },
    mustChangePassword: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "Users",
  }
);

module.exports = User;
