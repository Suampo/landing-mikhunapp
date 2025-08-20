// src/controllers/inventarioController.js
import { pool } from "../config/db.js";

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

// Normaliza los valores que vienen del front a lo que guarda tu DB
// (tu enum rechaza "in"/"out"; usa "entrada"/"salida")
const mapTipo = (t) => {
  const v = String(t || "").toLowerCase();
  if (v === "in" || v === "entrada") return "entrada";
  if (v === "out" || v === "salida") return "salida";
  return null;
};

/* -------------------------------------------------------
   Unidades
------------------------------------------------------- */

export const listUnidades = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, abrev FROM unidades ORDER BY nombre`
    );
    if (rows.length) return res.json(rows);

    // Seed mínimo si la tabla está vacía
    const seed = [
      ["Kilogramo", "kg"],
      ["Gramo", "g"],
      ["Litro", "L"],
      ["Mililitro", "ml"],
      ["Unidad", "u"],
    ];
    const values = seed.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(",");
    const flat = seed.flat();
    const ins = await pool.query(
      `INSERT INTO unidades (nombre, abrev) VALUES ${values} RETURNING id, nombre, abrev`,
      flat
    );
    return res.json(ins.rows);
  } catch (e) {
    console.error("listUnidades:", e);
    res.status(500).json({ error: "Error listando unidades" });
  }
};

/* -------------------------------------------------------
   Almacenes
------------------------------------------------------- */

export const listAlmacenes = async (req, res) => {
  try {
    const restaurantId = Number(req.user.restaurantId);
    let { rows } = await pool.query(
      `SELECT id, nombre FROM almacenes WHERE restaurant_id=$1 ORDER BY id`,
      [restaurantId]
    );
    if (rows.length) return res.json(rows);

    // Crea "Principal" si no hay ninguno
    const ins = await pool.query(
      `INSERT INTO almacenes (restaurant_id, nombre)
       VALUES ($1,'Principal')
       RETURNING id, nombre`,
      [restaurantId]
    );
    res.json(ins.rows);
  } catch (e) {
    console.error("listAlmacenes:", e);
    res.status(500).json({ error: "Error listando almacenes" });
  }
};

/* -------------------------------------------------------
   Stock (suma de inv_movimientos por insumo)
   ?low=1 -> solo bajo stock
------------------------------------------------------- */

export const getStock = async (req, res) => {
  try {
    const restaurantId = Number(req.user.restaurantId);
    const low = String(req.query.low || "0") === "1";

    const { rows } = await pool.query(
      `
      SELECT
        i.id,
        i.nombre,
        COALESCE(u.abrev, u.nombre, '') AS unidad,
        i.stock_min,
        COALESCE(SUM(m.cantidad),0)::numeric AS cantidad
      FROM insumos i
      LEFT JOIN unidades u ON u.id = i.unidad_id
      LEFT JOIN inv_movimientos m
        ON m.insumo_id = i.id
       AND m.restaurant_id = i.restaurant_id
      WHERE i.restaurant_id = $1
      GROUP BY i.id, i.nombre, unidad, i.stock_min
      HAVING $2::boolean = false OR COALESCE(SUM(m.cantidad),0) <= i.stock_min
      ORDER BY i.nombre
      `,
      [restaurantId, low]
    );

    res.json(rows);
  } catch (e) {
    console.error("getStock:", e);
    res.status(500).json({ error: "Error obteniendo stock" });
  }
};

/* -------------------------------------------------------
   Insumos (CRUD mínimo)
------------------------------------------------------- */

export const getInsumos = async (req, res) => {
  try {
    const restaurantId = Number(req.user.restaurantId);
    const { rows } = await pool.query(
      `
      SELECT i.id, i.nombre, i.unidad_id,
             COALESCE(u.abrev,u.nombre,'') AS unidad,
             i.stock_min, i.costo_unit
      FROM insumos i
      LEFT JOIN unidades u ON u.id=i.unidad_id
      WHERE i.restaurant_id=$1
      ORDER BY i.nombre
      `,
      [restaurantId]
    );
    res.json(rows);
  } catch (e) {
    console.error("getInsumos:", e);
    res.status(500).json({ error: "Error listando insumos" });
  }
};

export const createInsumo = async (req, res) => {
  try {
    const restaurantId = Number(req.user.restaurantId);
    const nombre = (req.body?.nombre || "").trim();
    const unidad_id = req.body?.unidad_id ? Number(req.body.unidad_id) : null;
    const stock_min = req.body?.stock_min ? Number(req.body.stock_min) : 0;
    const costo_unit = req.body?.costo_unit ? Number(req.body.costo_unit) : 0;

    if (!nombre) return res.status(400).json({ error: "Nombre requerido" });

    const { rows } = await pool.query(
      `
      INSERT INTO insumos (restaurant_id, nombre, unidad_id, stock_min, costo_unit)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING id, nombre, unidad_id, stock_min, costo_unit
      `,
      [restaurantId, nombre, unidad_id, stock_min, costo_unit]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error("createInsumo:", e);
    res.status(500).json({ error: "Error creando insumo" });
  }
};

/* -------------------------------------------------------
   Movimientos (lista)
------------------------------------------------------- */

export const getMovimientos = async (req, res) => {
  try {
    const restaurantId = Number(req.user.restaurantId);
    const { rows } = await pool.query(
      `
      SELECT
        m.id,
        m.created_at,
        m.tipo AS tipo,                       -- 'entrada' | 'salida' (enum o texto)
        ABS(m.cantidad)::numeric AS cantidad, -- siempre positivo para mostrar
        m.costo_unit,
        m.origen,
        m.referencia,
        i.nombre AS insumo,
        a.nombre AS almacen
      FROM inv_movimientos m
      LEFT JOIN insumos   i ON i.id = m.insumo_id
      LEFT JOIN almacenes a ON a.id = m.almacen_id
      WHERE m.restaurant_id = $1
      ORDER BY m.created_at DESC
      LIMIT 200
      `,
      [restaurantId]
    );
    res.json(rows);
  } catch (e) {
    console.error("getMovimientos:", e);
    res.status(500).json({ error: "Error listando movimientos" });
  }
};

/* -------------------------------------------------------
   Movimientos (crear)
   Front envía tipo: "in" | "out"
   DB guarda: "entrada" | "salida"
   Guardamos cantidad NEGATIVA para salida.
------------------------------------------------------- */

export const createMovimiento = async (req, res) => {
  try {
    const restaurantId = Number(req.user.restaurantId);
    const {
      insumo_id,
      almacen_id = null,
      tipo: rawTipo,
      cantidad,
      costo_unit = null,
      origen = null,
      referencia = null,
      pedido_id = null,
    } = req.body;

    const tipo = mapTipo(rawTipo); // 'entrada' | 'salida'
    if (!tipo) {
      return res.status(400).json({ error: "tipo inválido. Usa 'entrada' o 'salida'." });
    }

    const qty = Number(cantidad);
    if (!insumo_id || !Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ error: "insumo_id y cantidad > 0 requeridos" });
    }

    // Insumo válido para el restaurante
    const qIns = await pool.query(
      `SELECT id FROM insumos WHERE id=$1 AND restaurant_id=$2`,
      [insumo_id, restaurantId]
    );
    if (!qIns.rowCount) {
      return res.status(400).json({ error: "Insumo inexistente para este restaurante" });
    }

    // Almacén válido (si viene)
    if (almacen_id) {
      const qAlm = await pool.query(
        `SELECT id FROM almacenes WHERE id=$1 AND restaurant_id=$2`,
        [almacen_id, restaurantId]
      );
      if (!qAlm.rowCount) {
        return res.status(400).json({ error: "Almacén inválido para este restaurante" });
      }
    }

    // Si es salida, validar stock suficiente
    if (tipo === "salida") {
      const { rows: s } = await pool.query(
        `SELECT COALESCE(SUM(cantidad),0)::numeric AS stock
           FROM inv_movimientos
          WHERE restaurant_id=$1 AND insumo_id=$2`,
        [restaurantId, insumo_id]
      );
      const stockActual = Number(s[0].stock || 0);
      if (stockActual < qty) {
        return res.status(409).json({ error: `Stock insuficiente (actual ${stockActual})` });
      }
    }

    // Cantidad con signo (negativa para 'salida')
    const signedQty = tipo === "salida" ? -qty : qty;

    // OJO: NO casteamos a ::mov_tipo para que funcione si tu columna es enum o texto
    const { rows } = await pool.query(
      `INSERT INTO inv_movimientos
        (restaurant_id, insumo_id, almacen_id, tipo, cantidad, costo_unit, origen, referencia, pedido_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, created_at`,
      [
        restaurantId,
        insumo_id,
        almacen_id,
        tipo,           // 'entrada' | 'salida'
        signedQty,      // negativo si salida
        costo_unit ? Number(costo_unit) : null,
        origen,
        referencia,
        pedido_id,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (e) {
    console.error("createMovimiento:", e);
    res.status(500).json({ error: "Error creando movimiento" });
  }
};
export const createAlmacen = async (req, res) => {
  try {
    const restaurantId = Number(req.user.restaurantId);
    const nombre = (req.body?.nombre || "").trim();
    if (!nombre) return res.status(400).json({ error: "Nombre requerido" });

    const { rows } = await pool.query(
      `INSERT INTO almacenes (restaurant_id, nombre)
       VALUES ($1,$2)
       RETURNING id, nombre`,
      [restaurantId, nombre]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error("createAlmacen:", e);
    res.status(500).json({ error: "Error creando almacén" });
  }
};

export const renameAlmacen = async (req, res) => {
  try {
    const restaurantId = Number(req.user.restaurantId);
    const id = Number(req.params.id);
    const nombre = (req.body?.nombre || "").trim();
    if (!id || !nombre) return res.status(400).json({ error: "Datos inválidos" });

    const { rows } = await pool.query(
      `UPDATE almacenes
         SET nombre=$3
       WHERE id=$1 AND restaurant_id=$2
       RETURNING id, nombre`,
      [id, restaurantId, nombre]
    );
    if (!rows.length) return res.status(404).json({ error: "No encontrado" });
    res.json(rows[0]);
  } catch (e) {
    console.error("renameAlmacen:", e);
    res.status(500).json({ error: "Error renombrando almacén" });
  }
};

export const deleteAlmacen = async (req, res) => {
  try {
    const restaurantId = Number(req.user.restaurantId);
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "ID inválido" });

    // evita borrar si tiene movimientos
    const mov = await pool.query(
      `SELECT 1 FROM inv_movimientos WHERE restaurant_id=$1 AND almacen_id=$2 LIMIT 1`,
      [restaurantId, id]
    );
    if (mov.rowCount) {
      return res.status(409).json({ error: "No se puede eliminar: tiene movimientos" });
    }

    const del = await pool.query(
      `DELETE FROM almacenes WHERE id=$1 AND restaurant_id=$2`,
      [id, restaurantId]
    );
    if (!del.rowCount) return res.status(404).json({ error: "No encontrado" });
    res.sendStatus(204);
  } catch (e) {
    console.error("deleteAlmacen:", e);
    res.status(500).json({ error: "Error eliminando almacén" });
  }
};