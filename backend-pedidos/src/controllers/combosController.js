// src/controllers/combosController.js
import { pool } from "../config/db.js";
import { supabase } from "../config/supabase.js"; // <-- ajusta ruta

// GET /api/combos  (admin) -> SOLO activos del restaurant
export const getCombos = async (req, res) => {
  try {
    const restaurantId = Number(req.user.restaurantId);
    const { rows } = await pool.query(
      `SELECT id, nombre, precio,
              categoria_entrada_id, categoria_plato_id, activo, cover_url
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
       RETURNING id, nombre, precio, categoria_entrada_id, categoria_plato_id, activo, cover_url`,
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

    const {
      nombre = null,
      precio = null,
      categoriaEntradaId = null,
      categoriaPlatoId = null,
      activo = null,
    } = req.body;

    const { rows } = await pool.query(
      `UPDATE combos
          SET nombre               = COALESCE($3, nombre),
              precio               = COALESCE($4, precio),
              categoria_entrada_id = COALESCE($5, categoria_entrada_id),
              categoria_plato_id   = COALESCE($6, categoria_plato_id),
              activo               = COALESCE($7, activo),
              updated_at           = NOW()
        WHERE id = $1 AND restaurant_id = $2
        RETURNING id, nombre, precio, categoria_entrada_id, categoria_plato_id, activo, cover_url`,
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

// PUT /api/combos/:id/cover (multipart/form-data -> image)
export const updateComboCover = async (req, res) => {
  try {
    const restaurantId = Number(req.user?.restaurantId);
    const id = Number(req.params.id);
    if (!restaurantId || !id) return res.status(400).json({ error: "Datos inválidos" });
    if (!req.file) return res.status(400).json({ error: "Falta imagen" });

    const ext = (req.file.mimetype || "image/jpeg").split("/")[1] || "jpg";
    const path = `rest-${restaurantId}/combos/${id}-${Date.now()}.${ext}`;

    const { data, error } = await supabase
      .storage.from("menu-images")
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

    if (error) throw error;

    const { data: pub } = supabase.storage.from("menu-images").getPublicUrl(data.path);
    const cover_url = pub.publicUrl;

    await pool.query(
      `UPDATE combos SET cover_url=$1 WHERE id=$2 AND restaurant_id=$3`,
      [cover_url, id, restaurantId]
    );

    res.json({ ok: true, cover_url });
  } catch (e) {
    console.error("❌ updateComboCover:", e);
    res.status(500).json({ error: "No se pudo subir la portada" });
  }
};
