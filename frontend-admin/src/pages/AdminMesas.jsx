import { useEffect, useState } from "react";
import API from "../services/axiosInstance";

function AdminMesas() {
  const [mesas, setMesas] = useState([]);
  const [qrData, setQrData] = useState({});

  const token = localStorage.getItem("token");

  // 1️⃣ Cargar mesas del restaurante
  const fetchMesas = async () => {
    try {
      const res = await API.get("/mesas");
      setMesas(res.data);
    } catch (error) {
      console.error("❌ Error obteniendo mesas:", error.message);

      // Si el token ya no sirve, forzar logout
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    }
  };

  useEffect(() => {
    fetchMesas();
  }, []);

  // 2️⃣ Generar QR de mesa específica
  const generarQR = async (mesaId) => {
    try {
     const res = await API.get(`/mesas/${mesaId}/qr`);
      setQrData((prev) => ({ ...prev, [mesaId]: res.data.qrBase64 }));
    } catch (error) {
      console.error("❌ Error generando QR:", error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h1>🪑 Panel de Mesas</h1>
  <div style={{ display: "flex", gap: 10 }}>
    <button onClick={() => window.location.href = "/editar-menu"} style={{ padding: "6px 14px" }}>
      ✏️ Editar menú
    </button>
    <button onClick={handleLogout} style={{ padding: "6px 14px" }}>
      Cerrar sesión
    </button>
  </div>
</div>

      {mesas.length === 0 && <p>No hay mesas registradas</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {mesas.map((mesa) => (
          <div
            key={mesa.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 10,
              padding: 15,
              width: 200,
              textAlign: "center",
              background: "#f8f9fa",
            }}
          >
            <h3>{mesa.codigo}</h3>
            <p>{mesa.descripcion || "Sin descripción"}</p>
            <button onClick={() => generarQR(mesa.id)}>Generar QR</button>

            {qrData[mesa.id] && (
              <div style={{ marginTop: 10 }}>
                <img
                  src={qrData[mesa.id]}
                  alt={`QR Mesa ${mesa.codigo}`}
                  style={{ width: 120 }}
                />
                <a
                  href={qrData[mesa.id]}
                  download={`mesa_${mesa.codigo}.png`}
                  style={{ display: "block", marginTop: 5 }}
                >
                  Descargar QR
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  
);

}


export default AdminMesas;