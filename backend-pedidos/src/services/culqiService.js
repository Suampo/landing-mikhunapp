// src/services/culqiService.js
import fetch from "node-fetch";

const CULQI_PUBLIC_KEY = process.env.CULQI_PUBLIC_KEY;
const CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY;
const BASE = "https://api.culqi.com/v2";

function assertEnv() {
  if (!CULQI_SECRET_KEY) throw new Error("Falta CULQI_SECRET_KEY en .env");
}

function headers() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${CULQI_SECRET_KEY}`,
  };
}

async function handle(res) {
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const txt = data || (await res.text());
    console.error("❌ Culqi error:", res.status, txt);
    const msg = data?.user_message || data?.merchant_message || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// =================== CREATE ===================

export async function createCulqiOrder({ amount, currency = "PEN", description, email, metadata = {}, paymentMethods }) {
  assertEnv();

  const body = {
    amount,                    // céntimos
    currency_code: currency,
    description,
    metadata,
    // customer_email: email,   // opcional
    expiration_date: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  };

  if (paymentMethods && typeof paymentMethods === "object") {
    body.payment_methods = paymentMethods; // { card:true, yape:true, bancaMovil:true, ... }
  }

  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function createCulqiCharge({ amount, currency = "PEN", email, tokenId, description, metadata = {} }) {
  assertEnv();
  const body = {
    amount,
    currency_code: currency,
    email,
    source_id: tokenId,
    description,
    metadata,
  };

  const res = await fetch(`${BASE}/charges`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  return handle(res);
}

// =================== GET (para webhook) ===================

export async function getCulqiChargeById(chargeId) {
  assertEnv();
  const res = await fetch(`${BASE}/charges/${chargeId}`, { headers: headers() });
  return handle(res); // doc: GET /v2/charges/{id}
}

export async function getCulqiOrderById(orderId) {
  assertEnv();
  const res = await fetch(`${BASE}/orders/${orderId}`, { headers: headers() });
  return handle(res); // doc: GET /v2/orders/{id}
}

// =================== Resolución de estado ===================

/**
 * Heurística robusta: distintos comercios usan campos diferentes.
 * Ajusta si tu payload real trae otros campos.
 */
export function paidFromCharge(charge) {
  if (!charge) return false;
  // Casos frecuentes:
  if (charge.paid === true) return true;
  if (charge.capture === true) return true;       // cargo capturado
  if (charge.outcome?.type?.toLowerCase?.().includes("exitosa")) return true; // "venta_exitosa"
  if (["accepted", "approved", "success", "succeeded"].includes(String(charge.status || "").toLowerCase())) return true;
  return false;
}

export function paidFromOrder(order) {
  if (!order) return false;
  // Órdenes (PagoEfectivo/Yape/etc.)
  const st = String(order.state || order.status || "").toLowerCase();
  if (["paid", "pagado", "success", "succeeded", "approved"].includes(st)) return true;
  if (order.paid_at) return true;
  // fallback: bandera booleana
  if (order.paid === true) return true;
  return false;
}
