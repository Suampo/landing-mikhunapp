// src/services/inventarioApi.js
import API from "./axiosInstance";

export const inv = {
  stock: (onlyLow=false) => API.get("/inventario/stock", { params: { low: onlyLow?1:0 } }).then(r=>r.data),
  insumos: () => API.get("/inventario/insumos").then(r=>r.data),
  crear:   (p) => API.post("/inventario/insumos", p).then(r=>r.data),

  movimientos: () => API.get("/inventario/movimientos").then(r=>r.data),
  crearMov: (p) => API.post("/inventario/movimientos", p).then(r=>r.data),

  unidades: () => API.get("/inventario/unidades").then(r=>r.data),
  almacenes: () => API.get("/inventario/almacenes").then(r=>r.data),
  
  almacenes: async () => (await API.get("/inventario/almacenes")).data,
  crearAlmacen: async (nombre) => (await API.post("/inventario/almacenes", { nombre })).data,
  renombrarAlmacen: async (id, nombre) => (await API.put(`/inventario/almacenes/${id}`, { nombre })).data,
  eliminarAlmacen: async (id) => (await API.delete(`/inventario/almacenes/${id}`)).data,
};
