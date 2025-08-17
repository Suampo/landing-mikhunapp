// src/services/api.js
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const authHeader = () => {
  const t = localStorage.getItem("client_token"); // si usas token de cliente
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export async function apiCrearPedido({ mesaId, items, idempotencyKey }) {
  const res = await fetch(`${API}/api/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ mesaId, items, idempotencyKey }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { pedidoId, total }
}

export async function apiCulqiOrder({ amount, email, description, metadata, paymentMethods }) {
  const res = await fetch(`${API}/api/pay/culqi/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ amount, email, description, metadata, paymentMethods }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { order }
}

export async function apiCulqiCharge({ amount, email, tokenId, description, metadata }) {
  const res = await fetch(`${API}/api/pay/culqi/charge`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ amount, email, tokenId, description, metadata }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { charge }
}

// ✅ NUEVO: simular pago (actualiza estado a pagado y EMITE al KDS)
export async function simularPago(pedidoId) {
  const res = await fetch(`${API}/api/dev/simular-pago`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pedidoId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { ok, emitted }
}
