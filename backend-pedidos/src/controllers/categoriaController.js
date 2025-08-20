// src/controllers/categoriaController.js
import { pool } from "../config/db.js";
import multer from "multer";
import sharp from "sharp";
import { supabase, SUPABASE_BUCKET } from "../config/supabase.js";

// GET /api/categorias
export const listCategorias = async (req, res) => {
  try {
    const restaurantId = Number(req.user?.restaurantId ?? req.query.restaurantId);
    if (!restaurantId) return res.status(400).json({ error: "restaurantId requerido" });

    const { rows } = await pool.query(
      `SELECT id, nombre, cover_url
         FROM categorias
        WHERE restaurant_id = $1
        ORDER BY nombre`,
      [restaurantId]
    );
    res.json(rows);
  } catch (e) {
    console.error("❌ listCategorias:", e);
    res.status(500).json({ error: "Error listando categorías" });
  }
};

// POST /api/categorias
export const createCategoria = async (req, res) => {
  try {
    const restaurantId = Number(req.body.restaurantId) || Number(req.user?.restaurantId);
    const nombre = (req.body.nombre || "").trim();
    if (!restaurantId || !nombre) return res.status(400).json({ error: "Datos incompletos" });

    const { rows } = await pool.query(
      `INSERT INTO categorias (restaurant_id, nombre)
       VALUES ($1, $2)
       RETURNING id, nombre, cover_url`,
      [restaurantId, nombre]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error("❌ createCategoria:", e);
    res.status(500).json({ error: "Error creando categoría" });
  }
};

// PUT /api/categorias/:id
export const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const nombre = req.body.nombre?.trim() ?? null;

    const { rows } = await pool.query(
      `UPDATE categorias
          SET nombre = COALESCE($2, nombre)
        WHERE id = $1
        RETURNING id, nombre, cover_url`,
      [id, nombre]
    );

    if (!rows.length) return res.status(404).json({ error: "No encontrada" });
    res.json(rows[0]);
  } catch (e) {
    console.error("❌ updateCategoria:", e);
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
    console.error("❌ deleteCategoria:", e);
    res.status(500).json({ error: "Error eliminando categoría" });
  }
};

// =============== UPLOAD COVER ===============

// Multer en memoria (2MB máx; ajusta si quieres)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

// PUT /api/categorias/:id/cover (campo: image)
export async function updateCategoriaCover(req, res) {
  try {
    const restaurantId = req.user?.restaurantId || req.tenantId;
    const id = Number(req.params.id);
    if (!restaurantId || !id) return res.status(400).json({ error: "Datos inválidos" });
    if (!req.file) return res.status(400).json({ error: "Falta imagen" });

    const ext = (req.file.mimetype || "image/jpeg").split("/")[1] || "jpg";
    const path = `rest-${restaurantId}/categories/${id}-${Date.now()}.${ext}`;

    const { data, error } = await supabase
      .storage.from("menu-images") // usa tu bucket
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

    if (error) throw error;

    const { data: pub } = supabase.storage.from("menu-images").getPublicUrl(data.path);
    const cover_url = pub.publicUrl;

    await pool.query(
      `UPDATE categorias SET cover_url=$1 WHERE id=$2 AND restaurant_id=$3`,
      [cover_url, id, restaurantId]
    );

    res.json({ ok: true, cover_url });
  } catch (e) {
    console.error("updateCategoriaCover:", e);
    res.status(500).json({ error: "No se pudo subir la portada", detail: e.message });
  }
}
