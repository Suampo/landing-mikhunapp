// controllers/menuController.js
import { pool } from "../config/db.js";

/**
 * ADMIN: devuelve TODOS los items (activos e inactivos) del restaurante.
 * Útil para poder activar/inactivar desde el panel.
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
    console.error("❌ Error obteniendo el menú admin:", err.message);
    res.status(500).json({ error: "Error obteniendo el menú admin" });
  }
};

/**
 * PÚBLICO: devuelve categorías con items activos + combos activos (con sus opciones).
 * Respuesta: { categories: [{id, nombre, items:[...]}], combos: [{...}] }
 */
export const getMenuPublic = async (req, res) => {
  try {
    // Permite venir por query (cliente QR) o por token (si más adelante lo usas con auth)
    const restaurantId = Number(
      req.query.restaurantId || req.user?.restaurantId || 1
    );

    // 1) Categorías del restaurante
    const { rows: catRows } = await pool.query(
      `SELECT id, nombre
         FROM categorias
        WHERE restaurant_id = $1
        ORDER BY id ASC`,
      [restaurantId]
    );

    const categories = [];
    // Para cada categoría, carga sus items ACTIVOS
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
      categories.push({ id: c.id, nombre: c.nombre, items });
    }

    // Items activos SIN categoría (NULL) → categoría "Otros"
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
      categories.push({ id: null, nombre: "Otros", items: noCatItems });
    }

    // 2) Combos activos y sus opciones (entradas/platos)
    const { rows: comboRows } = await pool.query(
      `SELECT id, nombre, precio, categoria_entrada_id, categoria_plato_id
         FROM combos
        WHERE restaurant_id = $1
          AND activo = TRUE
        ORDER BY id DESC`,
      [restaurantId]
    );

    const combos = [];
    for (const co of comboRows) {
      // Opciones: items activos de la categoría de entrada
      const { rows: entradas } = await pool.query(
        `SELECT id, nombre, descripcion, precio, imagen_url
           FROM menu_items
          WHERE restaurant_id=$1
            AND activo=TRUE
            AND categoria_id=$2
          ORDER BY id DESC`,
        [restaurantId, co.categoria_entrada_id]
      );

      // Opciones: items activos de la categoría de plato
      const { rows: platos } = await pool.query(
        `SELECT id, nombre, descripcion, precio, imagen_url
           FROM menu_items
          WHERE restaurant_id=$1
            AND activo=TRUE
            AND categoria_id=$2
          ORDER BY id DESC`,
        [restaurantId, co.categoria_plato_id]
      );

      combos.push({
        id: co.id,
        nombre: co.nombre,
        precio: co.precio,       // precio del combo (no sumar individuales)
        entradas,
        platos,
      });
    }

    return res.json({ categories, combos });
  } catch (err) {
    console.error("❌ Error obteniendo el menú público:", err.message);
    res.status(500).json({ error: "Error obteniendo el menú público" });
  }
};
