//CEREBRO DE TODO EL PROCESO DE CONFIRMACION DE PAGO
// src/controllers/webhookController.js
import { pool } from "../config/db.js";
import { emitirPedidoCocina } from "../services/realtimeService.js";
import {
  getCulqiChargeById,
  getCulqiOrderById,
  paidFromCharge,
  paidFromOrder,
} from "../services/culqiService.js";

const PSP = "culqi";

/**
 * Utilidad: registra el webhook (raw + headers), retorna id
 */
async function logWebhook(rawBuffer, headers) {
  // Guardamos como texto y headers JSON
  const text = rawBuffer?.toString?.("utf8") || "";
  const hdrs = JSON.stringify(headers || {});
  const q = `
    INSERT INTO webhook_logs (psp, payload_raw, headers, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id
  `;
  const r = await pool.query(q, [PSP, text, hdrs]);
  return r.rows[0].id;
}

/**
 * Deducción de IDs y metadata desde el payload recibido
 * Admite varios formatos (event wrapper, objeto directo, etc.)
 */
function extractIdsAndMeta(evt) {
  // payload puede venir como { type, data: { object } } o ya el objeto
  const obj = evt?.data?.object || evt;

  const chargeId =
    obj?.id?.startsWith?.("chr_") ? obj.id :
    obj?.charge_id || evt?.data?.id?.startsWith?.("chr_") ? evt.data.id : null;

  const orderId =
    obj?.id?.startsWith?.("ord_") ? obj.id :
    obj?.order_id || evt?.data?.id?.startsWith?.("ord_") ? evt.data.id : null;

  const metadata = obj?.metadata || evt?.data?.object?.metadata || evt?.metadata || {};

  // Algunos envían event.id
  const psp_event_id = evt?.id || obj?.event_id || null;

  return { chargeId, orderId, metadata, psp_event_id, rawObj: obj };
}

/**
 * Marca pedido pagado si corresponde (transacción idempotente)
 */
async function markPaidOnce({ restaurant_id, order_id, amount, currency, refs }) {
  // 1) Registrar pago idempotente (si ya existe, no repetir)
  const q1 = `
    INSERT INTO pagos (restaurant_id, order_id, psp, psp_event_id,
                          culqi_charge_id, culqi_order_id, amount, currency, status, created_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'paid', NOW())
    ON CONFLICT (restaurant_id, psp, COALESCE(psp_event_id,''), COALESCE(culqi_charge_id,''), COALESCE(culqi_order_id,''))
    DO NOTHING
    RETURNING id
  `;
  const args1 = [
    restaurant_id,
    order_id,
    PSP,
    refs.psp_event_id || null,
    refs.chargeId || null,
    refs.orderId || null,
    amount || null,
    currency || "PEN",
  ];
  const ins = await pool.query(q1, args1);

  // Si no insertó (ya estaba), terminamos silenciosamente
  if (ins.rowCount === 0) return false;

  // 2) Actualizar pedido a 'pagado' solo si estaba pendiente
  const q2 = `
    UPDATE pedidos
    SET estado='pagado', updated_at=NOW()
    WHERE id=$1 AND restaurant_id=$2 AND estado IN ('pendiente_pago','pendiente')
    RETURNING id
  `;
  const up = await pool.query(q2, [order_id, restaurant_id]);

  // 3) Si lo actualizamos, emitimos a cocina (obtén info necesaria)
  if (up.rowCount > 0) {
    const detalle = await pool.query(
      `SELECT d.cantidad, d.precio_unitario, mi.nombre
         FROM pedido_detalle d
         JOIN menu_items mi ON mi.id = d.menu_item_id
        WHERE d.pedido_id = $1`,
      [order_id]
    );

    const info = await pool.query(
      `SELECT
         COALESCE(m.codigo, 'Mesa ' || p.mesa_id::text) AS mesa,
         p.order_no AS numero,
         p.total
       FROM pedidos p
       JOIN mesas m ON m.id = p.mesa_id AND m.restaurant_id = p.restaurant_id
       WHERE p.id = $1 AND p.restaurant_id = $2`,
      [order_id, restaurant_id]
    );
    const mesa   = info.rows[0]?.mesa   || 'Mesa';
    const numero = info.rows[0]?.numero || null;
    const total  = Number(info.rows[0]?.total ?? 0);

    emitirPedidoCocina({
      id: order_id,
      restaurant_id,                 // para enrutar al room
      numero,                        // 👈 ahora sí enviamos el número
      mesa,
      estado: "pagado",
      monto: amount ?? total,
      items: detalle.rows.map(r => ({
        cantidad: r.cantidad,
        precio_unitario: r.precio_unitario,
        nombre: r.nombre,
      })),
    });

  }

  return true;
}

export const culqiWebhook = async (req, res) => {
  try {
    // 🔴 IMPORTANTE: req.body es un Buffer (express.raw en server.js)
    const raw = req.body;
    const logId = await logWebhook(raw, req.headers);

    // Parse seguro
    let evt;
    try {
      evt = JSON.parse(raw.toString("utf8"));
    } catch {
      return res.status(400).json({ error: "JSON inválido" });
    }

    // Extrae ids y metadata
    const { chargeId, orderId, metadata, psp_event_id } = extractIdsAndMeta(evt);

    // Requerimos metadata mínima para amarrar el pedido local
    const restaurant_id = Number(metadata?.restaurant_id);
    const order_id = Number(metadata?.order_id);
    if (!restaurant_id || !order_id) {
      // No procesamos, pero lo dejamos logueado para conciliación
      return res.status(202).json({ received: true, logId, ignored: "Sin metadata restaurant_id/order_id" });
    }

    // ✅ Validación con la API de Culqi (evita spoof)
    let paid = false;
    let amount = null;
    let currency = "PEN";

    if (chargeId) {
      const charge = await getCulqiChargeById(chargeId);
      paid = paidFromCharge(charge);
      amount = charge?.amount ?? null;
      currency = charge?.currency_code ?? "PEN";
    } else if (orderId) {
      const order = await getCulqiOrderById(orderId);
      paid = paidFromOrder(order);
      amount = order?.amount ?? null;
      currency = order?.currency_code ?? "PEN";
    }

    // Si no está pagado aún, OK 202 (llegará otro evento)
    if (!paid) return res.status(202).json({ received: true, logId, status: "not_paid" });

    // Idempotencia y actualización
    await markPaidOnce({
      restaurant_id,
      order_id,
      amount,
      currency,
      refs: { psp_event_id, chargeId, orderId },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("❌ Error en Webhook Culqi:", err);
    return res.status(500).json({ error: "Error en webhook" });
  }
};
