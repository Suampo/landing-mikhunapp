// src/services/dashboardApi.js
import API from "./axiosInstance";

// KPIs de cabecera
export async function getKpis() {
  const { data } = await API.get("/reportes/kpis");
  return data; // { ventasDia, tickets, avg, margen }
}

// Serie de ventas últimos N días
export async function getSalesByDay(days = 7) {
  const { data } = await API.get(`/reportes/sales-by-day?days=${days}`);
  return data; // { labels, data, points }
}

// Pedidos recientes (intenta varias rutas)
export async function getRecentOrders(limit = 6) {
  // 1) ruta “recent”
  try {
    const { data } = await API.get(`/pedidos/admin/recent?limit=${limit}`);
    return Array.isArray(data) ? data : [];
  } catch {}

  // 2) lista admin con limit (si tu backend la soporta)
  try {
    const { data } = await API.get(`/pedidos/admin?limit=${limit}`);
    return Array.isArray(data) ? data : [];
  } catch {}

  // 3) sin ruta compatible
  return [];
}

// Mesas (para el widget rápido)
export async function getMesas() {
  try {
    const { data } = await API.get("/mesas");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Buscar ítems del menú (para el widget de producto)
export async function searchMenuItems(q = "") {
  try {
    const url = q ? `/menu-items?search=${encodeURIComponent(q)}` : "/menu-items";
    const { data } = await API.get(url);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
