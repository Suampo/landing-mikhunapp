import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
const KITCHEN_TOKEN =
  localStorage.getItem("kitchenToken") || import.meta.env.VITE_KITCHEN_TOKEN;

function App() {
  const [pedidos, setPedidos] = useState([]);
  const [estado, setEstado] = useState("Conectando…");
  const [error, setError] = useState("");

   useEffect(() => {
   const socket = io(SOCKET_URL, {
   transports: ["websocket"],
   auth: { token: KITCHEN_TOKEN }, // lee de localStorage o .env
 });

    socket.on("connect", () => {
      setEstado("Conectado");
      setError("");
    });

    socket.on("connect_error", (err) => {
      setEstado("Error");
      setError(err?.message || "Error de conexión");
    });

    socket.on("disconnect", () => setEstado("Desconectado"));

    // Tu backend puede emitir dos nombres de evento: "nuevo_pedido" y (a veces) "pedido_pagado"
    const onNuevo = (pedido) => setPedidos((prev) => [pedido, ...prev]);
    socket.on("nuevo_pedido", onNuevo);
    socket.on("pedido_pagado", onNuevo);

    return () => socket.disconnect();
  }, []);

  const colorEstado = (e) =>
    e === "pagado" ? "#d4edda" : e === "En preparación" ? "#fff3cd" : "#f9f9f9";

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>🍳 Panel de Cocina</h1>
      <div style={{ color: estado === "Conectado" ? "green" : "red" }}>
        {estado} {error ? `(${error})` : ""}
      </div>

      {pedidos.length === 0 && <p>Sin pedidos todavía…</p>}

      {pedidos.map((pedido, idx) => (
        <div
          key={`${pedido.id}-${idx}`}
          style={{
            border: "1px solid #ccc",
            margin: "10px 0",
            padding: 10,
            borderRadius: 6,
            background: colorEstado(pedido.estado),
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
           <strong>Mesa {pedido.mesa}</strong>
<span>Pedido #{pedido.numero ?? pedido.id}</span>
          </div>
          <div>Estado: {pedido.estado}</div>
          <ul style={{ marginTop: 6 }}>
            {(pedido.items || []).map((item, i) => (
              <li key={i}>
                {item.cantidad}× {item.nombre} — S/ {Number(item.precio_unitario).toFixed(2)}
              </li>
            ))}
          </ul>
          <strong>Total: S/ {Number(pedido.monto || 0).toFixed(2)}</strong>
        </div>
      ))}
    </div>
  );
}

export default App;
