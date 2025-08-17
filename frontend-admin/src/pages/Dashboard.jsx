// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import API from "../services/axiosInstance";
import SalesChart from "../components/SalesChart";

export default function Dashboard() {
  const [chart, setChart] = useState({ labels: [], data: [] });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    (async () => {
      const ventas = await API.get("/pedidos/admin/stats/sales-by-day", { params: { days: 7 } });
      setChart(ventas.data);
      const r = await API.get("/pedidos/admin/recent", { params: { limit: 10 } });
      setRecent(r.data);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <SalesChart labels={chart.labels} data={chart.data} title="Ventas" subtitle="Últimos 7 días" />

      <div className="bg-white rounded shadow">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Pedidos recientes</h2>
          <button className="border rounded px-3 py-1">Exportar</button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Mesa</th>
                <th className="px-4 py-2 text-left">Detalle</th>
                <th className="px-4 py-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="px-4 py-2">#{r.id}</td>
                  <td className="px-4 py-2">{r.mesa}</td>
                  <td className="px-4 py-2">{r.detalle}</td>
                  <td className="px-4 py-2">
                    <span className={`px- 2 py-1 rounded ${r.estado === "Sirviendo" ? "bg-green-100" : "bg-yellow-100"}`}>
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={4}>
                    No hay pedidos recientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
