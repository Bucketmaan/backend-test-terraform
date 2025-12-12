const express = require("express");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const itemsRouter = require("./routes/items.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck (utile pour tests)
app.get("/health", (req, res) => res.json({ ok: true }));

// Swagger (optionnel en prod)
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "API", version: "1.0.0" }
  },
  apis: ["./src/routes/*.js"]
});

if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// API v1
app.use("/api/v1", itemsRouter);

module.exports = { app };