const express = require("express");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const itemsRouter = require("./routes/items.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.set('trust proxy', true); // Important pour Lambda derrière API Gateway

// Healthcheck (utile pour tests et Lambda)
app.get("/health", (req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

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

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: "internal_error" });
});

module.exports = { app };