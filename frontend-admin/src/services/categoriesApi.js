// src/services/categoriesApi.js
import API from "./axiosInstance";

export const getCategories = (restaurantId) =>
  API.get("/categorias", {
    params: restaurantId ? { restaurantId } : {},
  }).then(r => r.data);

export const createCategory = (nombre, restaurantId) =>
  API.post(
    "/categorias",
    restaurantId ? { nombre, restaurantId } : { nombre }
  ).then(r => r.data);

export const updateCategory = (id, nombre) =>
  API.put(`/categorias/${id}`, { nombre }).then(r => r.data);

export const deleteCategory = (id) =>
  API.delete(`/categorias/${id}`).then(r => r.data);

// ⬇️ NUEVO: subir portada
export const uploadCategoryCover = async (id, file) => {
  const fd = new FormData();
  fd.append("image", file);
  const { data } = await API.put(`/categorias/${id}/cover`, fd, {
    timeout: 30000, // opcional
  });
  return data;
};
