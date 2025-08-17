// src/controllers/combosController.js
import { pool } from "../config/db.js";

// GET /api/combos  (admin) -> SOLO activos del restaurant
export const getCombos = async (req, res) => {
  try {
    const restaurantId = Number(req.user.restaurantId);
    const { rows } = await pool.query(
      `SELECT id, nombre, precio,
              categoria_entrada_id, categoria_plato_id, activo
       FROM combos
       WHERE restaurant_id = $1 AND activo = TRUE
       ORDER BY id DESC`,
      [restaurantId]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ getCombos:", err.message);
    res.status(500).json({ error: "Error obteniendo combos" });
  }
};

// POST /api/combos  (admin)
export const createCombo = async (req, res) => {
  try {
    const restaurantId = Number(req.user.restaurantId);
    const {
      nombre,
      precio,
      categoriaEntradaId,
      categoriaPlatoId,
      activo = true,
    } = req.body;

    const p = Number(precio);
    const c1 = Number(categoriaEntradaId);
    const c2 = Number(categoriaPlatoId);

    if (!nombre || Number.isNaN(p) || Number.isNaN(c1) || Number.isNaN(c2)) {
      return res.status(400).json({ error: "Faltan campos válidos" });
    }

    const { rows } = await pool.query(
      `INSERT INTO combos (restaurant_id, nombre, precio,
                           categoria_entrada_id, categoria_plato_id, activo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nombre, precio, categoria_entrada_id, categoria_plato_id, activo`,
      [restaurantId, nombre.trim(), p, c1, c2, !!activo]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("❌ createCombo:", err.message);
    res.status(500).json({ error: "Error creando combo" });
  }
};

// PUT /api/combos/:id  (admin)
export const updateCombo = async (req, res) => {
  try {
    const restaurantId = Number(req.user.restaurantId);
    const { id } = req.params;

    // Nota: si un campo no viene, dejamos null para que COALESCE mantenga el valor actual
    const {
      nombre = null,
      precio = null,
      categoriaEntradaId = null,
      categoriaPlatoId = null,
      activo = null,
    } = req.body;

    const { rows } = await pool.query(
      `UPDATE combos
         SET nombre = COALESCE($3, nombre),
             precio = COALESCE($4, precio),
             categoria_entrada_id = COALESCE($5, categoria_entrada_id),
             categoria_plato_id   = COALESCE($6, categoria_plato_id),
             activo               = COALESCE($7, activo),
             updated_at           = NOW()
       WHERE id = $1 AND restaurant_id = $2
       RETURNING id, nombre, precio, categoria_entrada_id, categoria_plato_id, activo`,
      [
        Number(id),
        restaurantId,
        nombre && nombre.trim ? nombre.trim() : nombre,
        precio !== null ? Number(precio) : null,
        categoriaEntradaId !== null ? Number(categoriaEntradaId) : null,
        categoriaPlatoId !== null ? Number(categoriaPlatoId) : null,
        typeof activo === "boolean" ? activo : null,
      ]
    );

    if (!rows.length) return res.status(404).json({ error: "No encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ updateCombo:", err.message);
    res.status(500).json({ error: "Error actualizando combo" });
  }
};

// DELETE /api/combos/:id  (admin) -> soft delete (activo = false)
export const deleteCombo = async (req, res) => {
  try {
    const restaurantId = Number(req.user.restaurantId);
    const { id } = req.params;

    const { rowCount } = await pool.query(
      `UPDATE combos
         SET activo = FALSE, updated_at = NOW()
       WHERE id = $1 AND restaurant_id = $2`,
      [Number(id), restaurantId]
    );

    if (!rowCount) return res.status(404).json({ error: "No encontrado" });
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ deleteCombo:", err.message);
    res.status(500).json({ error: "Error desactivando combo" });
  }
};
