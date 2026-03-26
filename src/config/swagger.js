const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger configuration
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Ethiopian Health Management System",
    version: "1.0.0",
    description: "API documentation for Ethiopian Health Management System",
  },
  servers: [
    {
      url: "http://localhost:5000/api",
      // url: "https://servicebackend.ilul-tech.com/api",
      description: "Development server",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/docs/*.js"], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = {
  swaggerUi,
  swaggerSpec,
};
