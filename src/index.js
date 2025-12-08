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
const port = 3000;

const api_version = "/api/v1";

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
        servers: [
            {
                url: "http://localhost:3000",
                description: "Development server",
            },
        ],
        components: {
            schemas: {
                Item: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            description: "Item ID",
                        },
                        name: {
                            type: "string",
                            description: "Item name",
                        },
                        description: {
                            type: "string",
                            description: "Item description",
                        },
                        created_at: {
                            type: "string",
                            format: "date-time",
                            description: "Creation timestamp",
                        },
                        updated_at: {
                            type: "string",
                            format: "date-time",
                            description: "Last update timestamp",
                        },
                        smoker: {
                            type: "string",
                            description: "Smoker information",
                        },
                        longitude: {
                            type: "number",
                            format: "float",
                            description: "Longitude coordinate",
                        },
                        latitude: {
                            type: "number",
                            format: "float",
                            description: "Latitude coordinate",
                        },
                    },
                    required: ["id", "name"],
                },
                ItemInput: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            description: "Item name",
                        },
                        description: {
                            type: "string",
                            description: "Item description",
                        },
                        smoker: {
                            type: "string",
                            description: "Smoker information",
                        },
                        longitude: {
                            type: "number",
                            format: "float",
                            description: "Longitude coordinate",
                        },
                        latitude: {
                            type: "number",
                            format: "float",
                            description: "Latitude coordinate",
                        },
                    },
                    required: ["name", "smoker", "longitude", "latitude"],
                },
                Error: {
                    type: "object",
                    properties: {
                        error: {
                            type: "string",
                            description: "Error message",
                        },
                    },
                },
            },
        },
    },
    apis: ["./src/index.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(api_version + "/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
        console.log(
            "Server will start anyway. Database will be initialized when available."
        );
    });

// Middleware to check database availability
const checkDbConnection = (req, res, next) => {
    if (!dbReady) {
        return res.status(503).json({
            error: "Database not available",
            message:
                "The database connection is currently unavailable. Please try again later.",
        });
    }
    next();
};

/**
 * @swagger
 * /api/v1/smoke:
 *   post:
 *     summary: Create a new smoke point item
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemInput'
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Bad request - name is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post(api_version + "/smoke", checkDbConnection, async (req, res) => {
    try {
        const { name, description, smoker, longitude, latitude } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }
        const newItem = await createItem(name, description || null, smoker, longitude, latitude);
        res.status(201).json(newItem);
    } catch (err) {
        console.error("Error creating item:", err);
        res.status(500).json({ error: "Failed to create item" });
    }
});

/**
 * @swagger
 * /api/v1/smoke:
 *   get:
 *     summary: Get all smoke point items
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: List of all items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get(api_version + "/smoke", checkDbConnection, async (req, res) => {
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
 * //api/v1smoke/{id}:
 *   get:
 *     summary: Get a single smoke point item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get(api_version + "/smoke/:id", checkDbConnection, async (req, res) => {
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
 * //api/v1smoke/{id}:
 *   put:
 *     summary: Update a smoke point item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemInput'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Bad request - name is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.put(api_version + "/smoke/:id", checkDbConnection, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { name, description, smoker, longitude, latitude } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }
        const updatedItem = await updateItem(id, name, description || null, smoker, longitude, latitude);
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
 * //api/v1smoke/{id}:
 *   delete:
 *     summary: Delete a smoke point item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       204:
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete(api_version + "/smoke/:id", checkDbConnection, async (req, res) => {
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
 * //api/v1health:
 *   get:
 *     summary: Health check endpoint (server and database)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get(api_version + "/health", async (req, res) => {
    try {
        // Simple query to check database connectivity
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

app.listen(port, () => {
    console.log(`CRUD service running at http://localhost:${port}`);
    console.log(
        `Swagger API docs available at http://localhost:${port}/api-docs`
    );
});
