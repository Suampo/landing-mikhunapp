// src/controllers/menuController.js
import { pool } from "../config/db.js";

/**
 * ADMIN: devuelve TODOS los items del restaurante.
 */
export const getMenu = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { rows } = await pool.query(
      `SELECT id, nombre, descripcion, precio, activo, imagen_url, categoria_id
         FROM menu_items
        WHERE restaurant_id = $1
        ORDER BY id DESC`,
      [restaurantId]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error obteniendo el menú admin:", err);
    res.status(500).json({ error: "Error obteniendo el menú admin" });
  }
};

/**
 * PÚBLICO: categorías (con cover) + combos (con cover) + opciones.
 */
export const getMenuPublic = async (req, res) => {
  try {
    const restaurantId = Number(req.query.restaurantId || req.user?.restaurantId || 1);

    // Categorías
    const { rows: catRows } = await pool.query(
      `SELECT id, nombre, cover_url
         FROM categorias
        WHERE restaurant_id = $1
        ORDER BY id ASC`,
      [restaurantId]
    );

    const categories = [];
    for (const c of catRows) {
      const { rows: items } = await pool.query(
        `SELECT id, nombre, descripcion, precio, imagen_url
           FROM menu_items
          WHERE restaurant_id = $1
            AND activo = TRUE
            AND categoria_id = $2
          ORDER BY id DESC`,
        [restaurantId, c.id]
      );
      categories.push({ id: c.id, nombre: c.nombre, cover_url: c.cover_url, items });
    }

    // Items sin categoría
    const { rows: noCatItems } = await pool.query(
      `SELECT id, nombre, descripcion, precio, imagen_url
         FROM menu_items
        WHERE restaurant_id = $1
          AND activo = TRUE
          AND categoria_id IS NULL
        ORDER BY id DESC`,
      [restaurantId]
    );
    if (noCatItems.length) {
      categories.push({ id: null, nombre: "Otros", cover_url: null, items: noCatItems });
    }

    // Combos
    const { rows: comboRows } = await pool.query(
      `SELECT id, nombre, precio, cover_url, categoria_entrada_id, categoria_plato_id
         FROM combos
        WHERE restaurant_id = $1 AND activo = TRUE
        ORDER BY id DESC`,
      [restaurantId]
    );

    const combos = [];
    for (const co of comboRows) {
      const { rows: entradas } = await pool.query(
        `SELECT id, nombre, descripcion, precio, imagen_url
           FROM menu_items
          WHERE restaurant_id=$1 AND activo=TRUE AND categoria_id=$2
          ORDER BY id DESC`,
        [restaurantId, co.categoria_entrada_id]
      );
      const { rows: platos } = await pool.query(
        `SELECT id, nombre, descripcion, precio, imagen_url
           FROM menu_items
          WHERE restaurant_id=$1 AND activo=TRUE AND categoria_id=$2
          ORDER BY id DESC`,
        [restaurantId, co.categoria_plato_id]
      );

      combos.push({
        id: co.id,
        nombre: co.nombre,
        precio: co.precio,
        cover_url: co.cover_url,
        entradas,
        platos,
      });
    }

    return res.json({ categories, combos });
  } catch (err) {
    console.error("❌ Error obteniendo el menú público:", err);
    res.status(500).json({ error: "Error obteniendo el menú público" });
  }
};
