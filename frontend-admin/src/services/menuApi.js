// src/services/menuApi.js
import API from "./axiosInstance";

/** Lista de items (admin) */
export const getMenuItems = (params = {}) =>
  API.get("/menu-items", { params }).then((r) => r.data);

/** Crear item */
export const createMenuItem = (payload) =>
  API.post("/menu-items", payload).then((r) => r.data);

/** Actualizar item */
export const updateMenuItem = (id, payload) =>
  API.put(`/menu-items/${id}`, payload).then((r) => r.data);

/** Eliminar item */
export const deleteMenuItemApi = (id) =>
  API.delete(`/menu-items/${id}`).then((r) => r.data);

/** Subir imagen (campo 'image') */
export const uploadMenuItemImage = (id, file) => {
  const fd = new FormData();
  fd.append("image", file); // 👈 nombre exacto que espera multer

  return API.post(`/menu-item/${id}/upload-image`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};
