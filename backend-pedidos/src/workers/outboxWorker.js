// src/workers/outboxWorker.js
import { pool } from "../config/db.js";
import { emitirPedidoCocina } from "../services/realtimeService.js"; // opcional si corres en mismo proceso
import http from "http";
import { initSocket } from "../services/realtimeService.js"; // para tener io si lo corres standalone

// Si ejecutas el worker como proceso aparte, levanta un http server mínimo para Socket.IO
const server = http.createServer((req, res) => res.end("worker"));
await initSocket(server);
server.listen(process.env.WORKER_PORT || 4001, () => {
  console.log("🧰 Worker Socket listo");
});

async function buildKitchenPayload(orderId, restaurantId) {
  // Mesa + numero + total
  const info = await pool.query(
    `SELECT
       COALESCE(m.codigo, 'Mesa ' || p.mesa_id::text) AS mesa,
       p.order_no AS numero,
       p.total
     FROM pedidos p
     JOIN mesas m ON m.id = p.mesa_id AND m.restaurant_id = p.restaurant_id
     WHERE p.id = $1 AND p.restaurant_id = $2`,
    [orderId, restaurantId]
  );

  // Items (incluye combos simples)
  const itemsQ = await pool.query(
    `SELECT d.cantidad, d.precio_unitario, COALESCE(mi.nombre, 'Combo #'||d.combo_id::text) AS nombre
       FROM pedido_detalle d
       LEFT JOIN menu_items mi ON mi.id = d.menu_item_id
      WHERE d.pedido_id = $1`,
    [orderId]
  );

  return {
    id: orderId,
    restaurant_id: restaurantId,
    numero: info.rows[0]?.numero ?? null,
    mesa: info.rows[0]?.mesa ?? "Mesa",
    estado: "pagado",
    monto: Number(info.rows[0]?.total ?? 0),
    items: itemsQ.rows.map(r => ({
      cantidad: r.cantidad,
      precio_unitario: r.precio_unitario,
      nombre: r.nombre,
    })),
  };
}

async function loop() {
  try {
    const { rows } = await pool.query(
      `SELECT id, type, restaurant_id, aggregate_id
         FROM outbox_events
        WHERE status='pending'
        ORDER BY id ASC
        LIMIT 20`
    );

    for (const ev of rows) {
      try {
        if (ev.type === 'order.paid') {
          const payload = await buildKitchenPayload(ev.aggregate_id, ev.restaurant_id);
          emitirPedidoCocina(payload); // emite a room rest-<restaurant_id>
        }
        await pool.query(
          `UPDATE outbox_events SET status='done', updated_at=now() WHERE id=$1`,
          [ev.id]
        );
      } catch (e) {
        await pool.query(
          `UPDATE outbox_events
              SET attempts=attempts+1, last_error=$2, status=CASE WHEN attempts>=4 THEN 'error' ELSE 'pending' END,
                  updated_at=now()
            WHERE id=$1`,
          [ev.id, String(e?.message || e)]
        );
      }
    }
  } catch (e) {
    console.error("Worker loop error:", e.message);
  } finally {
    setTimeout(loop, 500); // ~2Hz
  }
}

loop();
