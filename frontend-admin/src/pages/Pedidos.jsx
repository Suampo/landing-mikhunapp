import { useEffect, useState } from "react";
import API from "../services/axiosInstance";
import { io } from "socket.io-client";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [status, setStatus] = useState("Desconectado");

  useEffect(() => {
    fetchPedidos();

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const socket = io(import.meta.env.VITE_WS_URL || "http://localhost:4000", { auth: { token } });

    socket.on("connect", () => setStatus("Conectado"));
    socket.on("disconnect", () => setStatus("Desconectado"));

    // ante cualquier evento relevante, refrescamos; el backend ya filtra solo pagados
    socket.on("nuevo_pedido", fetchPedidos);
    socket.on("pedido_actualizado", fetchPedidos);
    socket.on("pedido_pagado", fetchPedidos); // por si tu webhook emite este evento

    return () => socket.disconnect();
  }, []);

  const fetchPedidos = async () => {
    try {
      const res = await API.get("/pedidos", { params: { status: "pagado" } }); // <- SOLO PAGADOS
      setPedidos(res.data);
    } catch (err) {
      console.error("Error cargando pedidos:", err.response?.data || err.message);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        Pedidos <span className="text-sm text-gray-500">(socket: {status})</span>
      </h1>

      {pedidos.length === 0 && (
        <div className="rounded border bg-white p-6 text-gray-600">No hay pedidos pagados.</div>
      )}

      <div className="space-y-3">
        {pedidos.map((p) => (
          <div key={p.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">Pedido #{p.numero ?? p.id}</div>
                <div className="text-sm text-gray-600">Mesa: {p.mesa}</div>
                <div className="text-xs text-gray-400">
                  {p.created_at ? new Date(p.created_at).toLocaleString() : ""}
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  Pagado
                </span>
                <div className="mt-1 text-sm">
                  Monto: <span className="font-semibold">S/ {Number(p.monto || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

          {p.items?.length > 0 && (
  <ul className="mt-3 divide-y text-sm">
    {p.items.map((it, i) => (
      <li key={i} className="py-1.5">
        <div className="flex items-center justify-between">
          <span>
            {it.cantidad}× {it.nombre}
            {it.tipo === "combo" && it.componentes?.length ? (
              <span className="ml-2 text-gray-500">
                (
                {it.componentes.map((c, idx) => (
                  <span key={idx}>
                    {c.nombre}{idx < it.componentes.length - 1 ? ", " : ""}
                  </span>
                ))}
                )
              </span>
            ) : null}
          </span>
          <span>S/ {Number(it.importe ?? it.precio_unitario ?? 0).toFixed(2)}</span>
        </div>
      </li>
    ))}
  </ul>
)}
          </div>
        ))}
      </div>
    </div>
  );
}
