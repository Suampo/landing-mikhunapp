// src/services/categoriesApi.js
import API from "./axiosInstance";

// Si pasas restaurantId lo manda en query/body.
// Si no, el backend lo toma del token (authTenant).
export const getCategories = (restaurantId) =>
  API.get("/categorias", {
    params: restaurantId ? { restaurantId } : {},
  }).then((r) => r.data);

export const createCategory = (nombre, restaurantId) =>
  API.post(
    "/categorias",
    restaurantId ? { nombre, restaurantId } : { nombre }
  ).then((r) => r.data);

export const updateCategory = (id, nombre) =>
  API.put(`/categorias/${id}`, { nombre }).then((r) => r.data);

export const deleteCategory = (id) =>
  API.delete(`/categorias/${id}`).then((r) => r.data);
