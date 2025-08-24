const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const authHeader = () => {
  const t = localStorage.getItem("client_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

async function get(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function post(path, body, withAuth=false) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(withAuth ? authHeader() : {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* Privado (ya los tenías) */
export const apiCrearPedido = ({ mesaId, items, idempotencyKey }) =>
  post(`/api/pedidos`, { mesaId, items, idempotencyKey }, true);
export const apiCulqiOrder  = ({ amount, email, description, metadata, paymentMethods }) =>
  post(`/api/pay/culqi/order`, { amount, email, description, metadata, paymentMethods }, true);
export const apiCulqiCharge = ({ amount, email, tokenId, description, metadata }) =>
  post(`/api/pay/culqi/charge`, { amount, email, tokenId, description, metadata }, true);

/* Dev */
export const simularPago = (pedidoId) => post(`/api/dev/simular-pago`, { pedidoId });

/* Público (BYO keys) */
export const apiGetPublicConfig = (restaurantId) =>
  get(`/api/pay/public/${restaurantId}/config`);
export const apiPreparePublicOrder = (restaurantId, payload) =>
  post(`/api/pay/public/${restaurantId}/checkout/prepare`, payload);
export const apiChargePublicToken = (restaurantId, payload) =>
  post(`/api/pay/public/${restaurantId}/checkout/charge`, payload);
