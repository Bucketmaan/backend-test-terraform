import { query } from "./connectPg.js";

export async function initDb() {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS items (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                smoker VARCHAR(255),
                longitude FLOAT,
                latitude FLOAT
            )
        `);
        console.log("Database initialized successfully");
    } catch (err) {
        console.error("Error initializing database:", err);
        throw err;
    }
}

export async function getItems() {
    try {
        const res = await query("SELECT * FROM items ORDER BY id DESC");
        return res.rows;
    } catch (err) {
        console.error("Error fetching items:", err);
        throw err;
    }
}

export async function getItemById(id) {
    try {
        const res = await query("SELECT * FROM items WHERE id = $1", [id]);
        return res.rows[0] || null;
    } catch (err) {
        console.error("Error fetching item:", err);
        throw err;
    }
}

export async function createItem(name, description, smoker, longitude, latitude) {
    try {
        const res = await query(
            "INSERT INTO items (name, description, smoker, longitude, latitude) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [name, description, smoker, longitude, latitude]
        );
        return res.rows[0];
    } catch (err) {
        console.error("Error creating item:", err);
        throw err;
    }
}

export async function updateItem(id, name, description, smoker, longitude, latitude) {
    try {
        const res = await query(
            "UPDATE items SET name = $1, description = $2, smoker = $3, longitude = $4, latitude = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *",
            [name, description, smoker, longitude, latitude, id]
        );
        return res.rows[0] || null;
    } catch (err) {
        console.error("Error updating item:", err);
        throw err;
    }
}

export async function deleteItem(id) {
    try {
        const res = await query(
            "DELETE FROM items WHERE id = $1 RETURNING id",
            [id]
        );
        return res.rows.length > 0;
    } catch (err) {
        console.error("Error deleting item:", err);
        throw err;
    }
}
