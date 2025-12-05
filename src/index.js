import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import {
    initDb,
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
} from "./repo.js";

const app = express();
const router = express.Router();
const port = 3000;

app.use(cors());
app.use(express.json());

// Swagger setup
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Items CRUD API",
            version: "1.0.0",
            description: "A simple CRUD API for managing items with PostgreSQL",
        },
        components: {
            schemas: {
                Item: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        name: { type: "string" },
                        description: { type: "string" },
                        created_at: { type: "string", format: "date-time" },
                        updated_at: { type: "string", format: "date-time" },
                    },
                    required: ["id", "name"],
                },
                ItemInput: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                    },
                    required: ["name"],
                },
                Error: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                    },
                },
            },
        },
    },
    apis: ["./src/index.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger served under /api/api-docs
app.use("/api/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Track database connection status
let dbReady = false;

// Initialize database on startup (non-blocking)
initDb()
    .then(() => {
        dbReady = true;
        console.log("Database initialized successfully");
    })
    .catch((err) => {
        console.error("Failed to initialize database on startup:", err);
        console.log("Server will start anyway. DB will be initialized when available.");
    });

// Middleware to check database availability
const checkDbConnection = (req, res, next) => {
    if (!dbReady) {
        return res.status(503).json({
            error: "Database not available",
            message: "The database connection is currently unavailable. Try again later.",
        });
    }
    next();
};

/**
 * @swagger
 * /api/items:
 */
router.post("/items", checkDbConnection, async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }
        const newItem = await createItem(name, description || null);
        res.status(201).json(newItem);
    } catch (err) {
        console.error("Error creating item:", err);
        res.status(500).json({ error: "Failed to create item" });
    }
});

/**
 * @swagger
 * /api/items:
 */
router.get("/items", checkDbConnection, async (req, res) => {
    try {
        const items = await getItems();
        res.json(items);
    } catch (err) {
        console.error("Error fetching items:", err);
        res.status(500).json({ error: "Failed to fetch items" });
    }
});

/**
 * @swagger
 * /api/items/{id}:
 */
router.get("/items/:id", checkDbConnection, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const item = await getItemById(id);
        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }
        res.json(item);
    } catch (err) {
        console.error("Error fetching item:", err);
        res.status(500).json({ error: "Failed to fetch item" });
    }
});

/**
 * @swagger
 * /api/items/{id}:
 */
router.put("/items/:id", checkDbConnection, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }
        const updatedItem = await updateItem(id, name, description || null);
        if (!updatedItem) {
            return res.status(404).json({ error: "Item not found" });
        }
        res.json(updatedItem);
    } catch (err) {
        console.error("Error updating item:", err);
        res.status(500).json({ error: "Failed to update item" });
    }
});

/**
 * @swagger
 * /api/items/{id}:
 */
router.delete("/items/:id", checkDbConnection, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const deleted = await deleteItem(id);
        if (!deleted) {
            return res.status(404).json({ error: "Item not found" });
        }
        res.status(204).send();
    } catch (err) {
        console.error("Error deleting item:", err);
        res.status(500).json({ error: "Failed to delete item" });
    }
});

/**
 * @swagger
 * /api/health:
 */
router.get("/health", async (req, res) => {
    try {
        await getItems();
        res.json({ status: "ok" });
    } catch (err) {
        console.error("Health check failed:", err);
        res.status(500).json({
            status: "error",
            error: "Database unreachable",
        });
    }
});

// Mount all routes under /api
app.use("/api", router);

app.listen(port, () => {
    console.log(`CRUD service running at http://localhost:${port}`);
    console.log(`Swagger API docs available at http://localhost:${port}/api/api-docs`);
});