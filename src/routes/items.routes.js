const express = require("express");
const { getPool } = require("../db");

const router = express.Router();

/**
 * @openapi
 * /api/v1/smoke:
 *   get:
 *     summary: Liste des éléments
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/smoke", async (req, res) => {
  try {
    const pool = getPool();
    const { rows } = await pool.query("SELECT id, name FROM items ORDER BY id ASC");
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
    const { rows } = await pool.query("SELECT id, name FROM items WHERE id = $1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "not_found" });
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
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: "name_required" });

    const pool = getPool();
    const { rows } = await pool.query(
      "INSERT INTO items (name) VALUES ($1) RETURNING id, name",
      [name]
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
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: "name_required" });

    const pool = getPool();
    const { rows } = await pool.query(
      "UPDATE items SET name = $1 WHERE id = $2 RETURNING id, name",
      [name, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "not_found" });
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
    const { rowCount } = await pool.query("DELETE FROM items WHERE id = $1", [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: "not_found" });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "internal_error" });
  }
});

module.exports = router;