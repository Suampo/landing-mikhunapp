// src/routes/devRoutes.js
import { Router } from "express";
import { pool } from "../config/db.js";
import { emitirPedidoCocina } from "../services/realtimeService.js";

const router = Router();

/**
 * POST /api/dev/simular-pago
 * body: { pedidoId: number, restaurantId?: number }
 */
router.post("/simular-pago", async (req, res) => {
  try {
    const pedidoId = Number(req.body?.pedidoId);
    if (!pedidoId) return res.status(400).json({ error: "pedidoId requerido" });

    // Datos base del pedido (restaurante, mesa y total)
    const baseQ = await pool.query(
      `SELECT p.id, p.restaurant_id, p.mesa_id, p.total,
              m.codigo AS mesa, p.estado
         FROM pedidos p
         JOIN mesas m ON m.id = p.mesa_id AND m.restaurant_id = p.restaurant_id
        WHERE p.id = $1`,
      [pedidoId]
    );
    if (!baseQ.rowCount) return res.status(404).json({ error: "Pedido no existe" });

    const base = baseQ.rows[0];

    // Marcar pagado si aún no lo está (idempotente)
    if (base.estado !== "pagado") {
      await pool.query(
        `UPDATE pedidos SET estado='pagado', updated_at=NOW() WHERE id=$1`,
        [pedidoId]
      );
    }

    // Items del pedido
    const itemsQ = await pool.query(
      `SELECT d.cantidad, d.precio_unitario, mi.nombre
         FROM pedido_detalle d
         LEFT JOIN menu_items mi ON mi.id = d.menu_item_id
        WHERE d.pedido_id = $1`,
      [pedidoId]
    );

    // Armar payload como el de producción
    const payload = {
      id: base.id,
      restaurant_id: base.restaurant_id,     // 🔴 necesario para enrutado al room correcto
      mesa: base.mesa || `Mesa ${base.mesa_id}`,
      estado: "pagado",
      monto: Number(base.total ?? 0),
      items: itemsQ.rows.map((r) => ({
        cantidad: r.cantidad,
        precio_unitario: r.precio_unitario,
        nombre: r.nombre,
      })),
    };

    // Emitir a KDS
    emitirPedidoCocina(payload);

    return res.json({ ok: true, emitted: payload });
  } catch (e) {
    console.error("simular-pago:", e);
    return res.status(500).json({ error: "No se pudo simular el pago" });
  }
});

export default router;
