import { pool } from "../config/db.js";

// GET /api/categorias?restaurantId=...
export const listCategorias = async (req, res) => {
  try {
    const restaurantId = Number(req.user?.restaurantId ?? req.query.restaurantId);
    if (!restaurantId) return res.status(400).json({ error: "restaurantId requerido" });

    const { rows } = await pool.query(
      `SELECT id, nombre FROM categorias WHERE restaurant_id = $1 ORDER BY nombre`,
      [restaurantId]
    );
    res.json(rows);
  } catch (e) {
    console.error("❌ listCategorias:", e.message);
    res.status(500).json({ error: "Error listando categorías" });
  }
};

// POST /api/categorias
export const createCategoria = async (req, res) => {
  try {
    const restaurantId =
      Number(req.body.restaurantId) || Number(req.user?.restaurantId);
    const nombre = (req.body.nombre || "").trim();

    if (!restaurantId || !nombre) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const { rows } = await pool.query(
      `INSERT INTO categorias (restaurant_id, nombre)
       VALUES ($1, $2)
       RETURNING id, nombre`,
      [restaurantId, nombre]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error("❌ createCategoria:", e.message);
    res.status(500).json({ error: "Error creando categoría" });
  }
};

// PUT /api/categorias/:id
export const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const nombre = req.body.nombre?.trim();

    const { rows } = await pool.query(
      `UPDATE categorias
          SET nombre = COALESCE($2, nombre)
        WHERE id = $1
        RETURNING id, nombre`,
      [id, nombre ?? null]
    );

    if (!rows.length) return res.status(404).json({ error: "No encontrada" });
    res.json(rows[0]);
  } catch (e) {
    console.error("❌ updateCategoria:", e.message);
    res.status(500).json({ error: "Error actualizando categoría" });
  }
};

// DELETE /api/categorias/:id
export const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM categorias WHERE id = $1`, [id]);
    res.sendStatus(204);
  } catch (e) {
    console.error("❌ deleteCategoria:", e.message);
    res.status(500).json({ error: "Error eliminando categoría" });
  }
};
