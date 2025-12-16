const express = require("express");
const { getPool, initDb } = require("../db");

const router = express.Router();

/**
 * Middleware: s'assurer que la DB est initialisée
 */
router.use(async (_req, _res, next) => {
  try {
    await initDb();
    next();
  } catch (e) {
    console.error("DB init failed", e);
    next(e);
  }
});

/**
 * @openapi
 * /api/v1/smoke:
 *   get:
 *     summary: Liste des éléments
 */
router.get("/smoke", async (_req, res) => {
  try {
    const pool = getPool();
    const { rows } = await pool.query(`
      SELECT
        id,
        name,
        description,
        smoker,
        latitude,
        longitude,
        created_at,
        updated_at
      FROM items
      ORDER BY id ASC
    `);

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "internal_error" });
  }
});

/**
 * @openapi
 * /api/v1/smoke/{id}:
 *   get:
 *     summary: Récupérer un élément
 */
router.get("/smoke/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `
      SELECT
        id,
        name,
        description,
        smoker,
        latitude,
        longitude,
        created_at,
        updated_at
      FROM items
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: "not_found" });
    }

    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "internal_error" });
  }
});

/**
 * @openapi
 * /api/v1/smoke:
 *   post:
 *     summary: Créer un élément
 */
router.post("/smoke", async (req, res) => {
  try {
    const {
      name,
      description = null,
      smoker = null,
      latitude = null,
      longitude = null
    } = req.body || {};

    if (!name) {
      return res.status(400).json({ error: "name_required" });
    }

    const pool = getPool();
    const { rows } = await pool.query(
      `
      INSERT INTO items (
        name,
        description,
        smoker,
        latitude,
        longitude
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [name, description, smoker, latitude, longitude]
    );

    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "internal_error" });
  }
});

/**
 * @openapi
 * /api/v1/smoke/{id}:
 *   put:
 *     summary: Modifier un élément
 */
router.put("/smoke/:id", async (req, res) => {
  try {
    const {
      name,
      description,
      smoker,
      latitude,
      longitude
    } = req.body || {};

    if (!name) {
      return res.status(400).json({ error: "name_required" });
    }

    const pool = getPool();
    const { rows } = await pool.query(
      `
      UPDATE items
      SET
        name = $1,
        description = $2,
        smoker = $3,
        latitude = $4,
        longitude = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
      `,
      [name, description, smoker, latitude, longitude, req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: "not_found" });
    }

    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "internal_error" });
  }
});

/**
 * @openapi
 * /api/v1/smoke/{id}:
 *   delete:
 *     summary: Supprimer un élément
 */
router.delete("/smoke/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { rowCount } = await pool.query(
      "DELETE FROM items WHERE id = $1",
      [req.params.id]
    );

    if (!rowCount) {
      return res.status(404).json({ error: "not_found" });
    }

    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "internal_error" });
  }
});

module.exports = router;