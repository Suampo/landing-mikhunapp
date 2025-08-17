// src/pages/Configuracion.jsx
import { useEffect, useState } from "react";
import API from "../services/axiosInstance";

export default function Configuracion() {
  const [config, setConfig] = useState({ nombre: "", direccion: "", telefono: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await API.get("/restaurant"); // ajustar ruta si tu backend usa otra
      setConfig(res.data);
    } catch (err) {
      console.warn("No se pudo obtener configuración:", err.response?.data || err.message);
      // No es crítico; puede que no exista endpoint aún
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put("/restaurant", config); // ajustar
      alert("Configuración guardada");
    } catch (err) {
      console.error("Error guardando configuración:", err.response?.data || err.message);
      alert("No se pudo guardar. Asegúrate de tener PUT /api/restaurant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Configuración del restaurante</h2>
      <form className="space-y-3 max-w-lg" onSubmit={handleSave}>
        <input
          className="w-full border p-2 rounded"
          placeholder="Nombre del restaurante"
          value={config.nombre}
          onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Dirección"
          value={config.direccion}
          onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Teléfono"
          value={config.telefono}
          onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          Guardar
        </button>
      </form>
    </div>
  );
}
