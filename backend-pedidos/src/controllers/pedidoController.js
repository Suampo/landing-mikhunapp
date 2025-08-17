// controllers/pedidoController.js
import { pool } from "../config/db.js";
import { emitPedidoPagadoCompleto } from "../services/realtimeService.js";
// Util: saca el restaurantId del token (authTenant o authAny)
const getRestaurantId = (req) => req.tenantId || req.user?.restaurantId;

/** ========================
 *  GET /api/pedidos (admin)
 *  Lista con mesa + items
 *  ======================== */
export const obtenerPedidos = async (req, res) => {
  try {
    const restaurantId = getRestaurantId(req);
    const status = (req.query.status || "pagado").toLowerCase(); // default: solo pagados

    const params = [restaurantId];
    const condEstado = status !== "all" ? ` AND p.estado = $${params.push(status)}` : "";

    const sql = `
      WITH items AS (
        -- Ítems sueltos
        SELECT 
          p.id AS pedido_id,
          jsonb_build_object(
            'tipo', 'item',
            'nombre', mi.nombre,
            'cantidad', pd.cantidad,
            'precio_unitario', pd.precio_unitario,
            'importe', (pd.cantidad * pd.precio_unitario)
          ) AS item
        FROM pedidos p
        JOIN pedido_detalle pd ON pd.pedido_id = p.id
        JOIN menu_items mi     ON mi.id = pd.menu_item_id
        WHERE p.restaurant_id = $1 ${condEstado}
          AND pd.menu_item_id IS NOT NULL

        UNION ALL

        -- Combos (con componentes)
        SELECT
          p.id AS pedido_id,
          jsonb_build_object(
            'tipo', 'combo',
            'nombre', COALESCE(c.nombre, 'Combo #' || pd.combo_id::text),
            'cantidad', pd.cantidad,
            'precio_unitario', pd.precio_unitario,
            'importe', (pd.cantidad * pd.precio_unitario),
            'componentes', (
              SELECT jsonb_agg(
                       jsonb_build_object('tipo', pci.tipo, 'nombre', mi2.nombre)
                     )
              FROM pedido_detalle_combo_items pci
              JOIN menu_items mi2 ON mi2.id = pci.menu_item_id
              WHERE pci.pedido_detalle_id = pd.id
            )
          ) AS item
        FROM pedidos p
        JOIN pedido_detalle pd ON pd.pedido_id = p.id
        LEFT JOIN combos c     ON c.id = pd.combo_id
        WHERE p.restaurant_id = $1 ${condEstado}
          AND pd.combo_id IS NOT NULL
      )
       SELECT
        p.id,
        p.order_no AS numero,         
        p.order_day,                  
        p.estado,
        p.total AS monto,
        p.created_at,
        COALESCE(m.codigo, 'Mesa ' || p.mesa_id::text) AS mesa,
        COALESCE(
          (SELECT jsonb_agg(i.item) FROM items i WHERE i.pedido_id = p.id),
          '[]'::jsonb
        ) AS items
      FROM pedidos p
      JOIN mesas m ON m.id = p.mesa_id AND m.restaurant_id = p.restaurant_id
      WHERE p.restaurant_id = $1 ${condEstado}
      ORDER BY p.created_at DESC;
    `;

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("obtenerPedidos:", error);
    res.status(500).json({ error: "Error obteniendo pedidos" });
  }
};

/** ========================
 *  POST /api/pedidos (cliente o admin)
 *  ======================== */
export const crearPedido = async (req, res) => {
  const client = await pool.connect();
  try {
    const restaurantId = req.user.restaurantId; // del token
    const { mesaId, items, idempotencyKey } = req.body;

    if (!mesaId) return res.status(400).json({ error: "Falta mesaId" });
    if (!idempotencyKey || typeof idempotencyKey !== "string") {
      return res.status(400).json({ error: "Falta idempotencyKey" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Carrito vacío" });
    }

    await client.query("BEGIN");

    // 1) Mesa válida del restaurante
    const mesaQ = await client.query(
      `SELECT id FROM mesas WHERE id=$1 AND restaurant_id=$2 FOR SHARE`,
      [mesaId, restaurantId]
    );
    if (!mesaQ.rows.length) throw new Error("Mesa no válida");

    // 2) Inserta pedido idempotente
    const ped = await client.query(
      `INSERT INTO pedidos (restaurant_id, mesa_id, total, estado, created_at, idempotency_key)
       VALUES ($1, $2, 0, 'pendiente_pago', NOW(), $3)
       ON CONFLICT (restaurant_id, idempotency_key)
       DO UPDATE SET idempotency_key = EXCLUDED.idempotency_key
       RETURNING id`,
      [restaurantId, mesaId, idempotencyKey]
    );
    const pedidoId = ped.rows[0].id;

    // 3) ¿Ya tenía detalle? (reintento con la misma idempotencyKey)
    const detCount = await client.query(
      `SELECT COUNT(*)::int AS c FROM pedido_detalle WHERE pedido_id = $1`,
      [pedidoId]
    );
    if (detCount.rows[0].c > 0) {
      const totalQ = await client.query(
        `SELECT COALESCE(SUM(cantidad * precio_unitario),0) AS total
           FROM pedido_detalle WHERE pedido_id = $1`,
        [pedidoId]
      );
      const totalExistente = Number(totalQ.rows[0].total || 0);
      await client.query(
        `UPDATE pedidos SET total=$1, updated_at=NOW() WHERE id=$2`,
        [totalExistente, pedidoId]
      );
      await client.query("COMMIT");
      return res.status(200).json({
        mensaje: "Pedido ya existía (idempotente)",
        pedidoId,
        total: totalExistente,
      });
    }

    // 4) Inserta detalle y calcula total si es NUEVO
    let total = 0;

    for (const it of items) {
      const cantidad = Math.max(1, Number(it.cantidad || 1));

      if (it.comboId) {
        if (!it.entradaId || !it.platoId) {
          throw new Error("Falta seleccionar entrada/plato del combo");
        }

        const comboQ = await client.query(
          `SELECT precio FROM combos WHERE id=$1 AND restaurant_id=$2 AND activo=TRUE`,
          [it.comboId, restaurantId]
        );
        if (!comboQ.rows.length) throw new Error("Combo no válido");

        const entradaQ = await client.query(
          `SELECT id FROM menu_items WHERE id=$1 AND restaurant_id=$2 AND activo=TRUE`,
          [it.entradaId, restaurantId]
        );
        const platoQ = await client.query(
          `SELECT id FROM menu_items WHERE id=$1 AND restaurant_id=$2 AND activo=TRUE`,
          [it.platoId, restaurantId]
        );
        if (!entradaQ.rowCount || !platoQ.rowCount) {
          throw new Error("Items del combo no válidos");
        }

        const precioUnit = Number(comboQ.rows[0].precio || 0);
        total += precioUnit * cantidad;

        const det = await client.query(
          `INSERT INTO pedido_detalle (pedido_id, menu_item_id, combo_id, cantidad, precio_unitario)
           VALUES ($1, NULL, $2, $3, $4) RETURNING id`,
          [pedidoId, it.comboId, cantidad, precioUnit]
        );
        const detId = det.rows[0].id;

        await client.query(
          `INSERT INTO pedido_detalle_combo_items (pedido_detalle_id, menu_item_id, tipo)
           VALUES ($1, $2, 'entrada'), ($1, $3, 'plato')`,
          [detId, it.entradaId, it.platoId]
        );
      } else {
        if (!it.id) throw new Error("Falta id de item");

        const pr = await client.query(
          `SELECT precio FROM menu_items WHERE id=$1 AND restaurant_id=$2 AND activo=TRUE`,
          [it.id, restaurantId]
        );
        if (!pr.rows.length) throw new Error("Item no válido");

        const precioUnit = Number(pr.rows[0].precio || 0);
        total += precioUnit * cantidad;

        await client.query(
          `INSERT INTO pedido_detalle (pedido_id, menu_item_id, combo_id, cantidad, precio_unitario)
           VALUES ($1, $2, NULL, $3, $4)`,
          [pedidoId, it.id, cantidad, precioUnit]
        );
      }
    }

    // 5) Actualiza total
    await client.query(
      `UPDATE pedidos SET total=$1, updated_at=NOW() WHERE id=$2`,
      [total, pedidoId]
    );

    await client.query("COMMIT");
    res.status(201).json({ mensaje: "Pedido creado", pedidoId, total });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error?.code === "23505") {
      if (error?.constraint === "uniq_open_order_per_table") {
        const q = await pool.query(
          `SELECT id FROM pedidos
           WHERE restaurant_id=$1 AND mesa_id=$2 AND estado='pendiente_pago'
           ORDER BY created_at DESC LIMIT 1`,
          [req.user.restaurantId, req.body.mesaId]
        );
        const existing = q.rows[0]?.id;
        return res
          .status(409)
          .json({ error: "La mesa ya tiene un pedido abierto", pedidoId: existing });
      }
      return res.status(409).json({ error: "Conflicto de unicidad", detail: error.detail });
    }

    console.error("❌ crearPedido:", error);
    res.status(500).json({ error: "Error creando pedido" });
  } finally {
    client.release();
  }
};

/** ========================
 *  PATCH /api/pedidos/:id  (admin)
 *  Cambia estado de pago
 *  ======================== */
export const actualizarPedidoEstado = async (req, res) => {
  try {
    const restaurantId = getRestaurantId(req);
    const pedidoId = req.params?.id;
    const { estado } = req.body;

    if (!pedidoId) return res.status(400).json({ error: "Falta el ID del pedido en la URL" });
    if (!estado || !["pendiente_pago", "pagado"].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const { rowCount, rows } = await pool.query(
      `UPDATE pedidos
         SET estado = $1, updated_at = NOW()
       WHERE id = $2 AND restaurant_id = $3
       RETURNING id, estado, total AS monto`,
      [estado, pedidoId, restaurantId]
    );

    if (!rowCount) return res.status(404).json({ error: "Pedido no encontrado" });

    const pedidoActualizado = rows[0];

    // 🚀 Emitimos al panel de cocina si el pedido fue pagado
    if (estado === "pagado") {
      await emitPedidoPagadoCompleto(restaurantId, pedidoId);
    }

    res.json(pedidoActualizado);
  } catch (e) {
    console.error("actualizarPedidoEstado:", e);
    res.status(500).json({ error: "No se pudo actualizar el estado del pedido" });
  }
};
/** ========================
 *  GET /api/pedidos/admin/recent?limit=10
 *  ======================== */
export const obtenerPedidosRecientes = async (req, res) => {
  try {
    const restaurantId = getRestaurantId(req);
    const limit = Number(req.query.limit ?? 10);

    const sql = `
      SELECT 
        p.id,
        p.created_at,
        COALESCE(m.codigo, 'Mesa ' || p.mesa_id::text) AS mesa,
        COALESCE(
          (SELECT CASE
                    WHEN pd.menu_item_id IS NOT NULL THEN mi.nombre
                    WHEN pd.combo_id     IS NOT NULL THEN 'Combo #' || pd.combo_id::text
                    ELSE '—'
                  END
             FROM pedido_detalle pd
             LEFT JOIN menu_items mi ON mi.id = pd.menu_item_id
            WHERE pd.pedido_id = p.id
            ORDER BY pd.id ASC LIMIT 1),
          '—'
        ) AS detalle,
        CASE WHEN p.estado = 'pagado' THEN 'Sirviendo' ELSE 'Preparando' END AS estado
      FROM pedidos p
      JOIN mesas m ON m.id = p.mesa_id AND m.restaurant_id = p.restaurant_id
      WHERE p.restaurant_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2;
    `;
    const { rows } = await pool.query(sql, [restaurantId, limit]);
    res.json(rows);
  } catch (e) {
    console.error("obtenerPedidosRecientes:", e);
    res.status(500).json({ error: "No se pudo obtener pedidos recientes" });
  }
};

/** ========================
 *  GET /api/pedidos/admin/stats/sales-by-day?days=7
 *  ======================== */
export const ventasPorDia = async (req, res) => {
  try {
    const restaurantId = getRestaurantId(req);
    const days = Number(req.query.days ?? 7);

    const sql = `
      WITH d AS (
        SELECT generate_series(
          current_date - ($2::int - 1) * interval '1 day',
          current_date,
          interval '1 day'
        )::date AS dia
      )
      SELECT
        CASE EXTRACT(DOW FROM d.dia)
          WHEN 1 THEN 'L' WHEN 2 THEN 'M' WHEN 3 THEN 'X'
          WHEN 4 THEN 'J' WHEN 5 THEN 'V' WHEN 6 THEN 'S'
          ELSE 'D'
        END AS label,
        COALESCE(SUM(p.total), 0)::numeric AS total
      FROM d
      LEFT JOIN pedidos p
        ON p.restaurant_id = $1
       AND p.estado = 'pagado'
       AND p.created_at::date = d.dia
      GROUP BY d.dia
      ORDER BY d.dia;
    `;
    const { rows } = await pool.query(sql, [restaurantId, days]);
    res.json({ labels: rows.map(r => r.label), data: rows.map(r => Number(r.total)) });
  } catch (e) {
    console.error("ventasPorDia:", e);
    res.status(500).json({ error: "No se pudo calcular ventas por día" });
  }
};
