require("dotenv").config(); // Load environment variables

const { Sequelize } = require("sequelize");

// Create Sequelize instance using .env variables
const sequelize = new Sequelize(
  `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  //   `postgres://postgres:1234@localhost:5432/daily_task_management`,
  {
    dialect: "postgres",
    logging: false, // Optional: Disable query logging
    // logging: console.log,
  },
);

module.exports = sequelize;
