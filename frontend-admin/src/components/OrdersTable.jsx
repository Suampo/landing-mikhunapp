// src/components/OrdersTable.jsx
import { downloadCSV, downloadXLSX } from "../utils/exporters";
const columns = [
  { key: "id",        title: "ID" },
  { key: "mesa",      title: "Mesa" },
  { key: "detalle",   title: "Detalle" },
  { key: "estado",    title: "Estado" },
  { key: "total",     title: "Total (S/)" },
  { key: "created_at",title: "Fecha" },
];

// data viene de tu API:
const handleCSV = () => downloadCSV(`pedidos_${new Date().toISOString().slice(0,10)}`, data, columns);
const handleXLSX = () => downloadXLSX(`pedidos_${new Date().toISOString().slice(0,10)}`, data, "Pedidos", columns);

return (
  <div className="flex gap-2">
    <button onClick={handleCSV} className="rounded-md border px-3 py-2 text-sm">Exportar CSV</button>
    <button onClick={handleXLSX} className="rounded-md border px-3 py-2 text-sm">Exportar XLSX</button>
  </div>
);
export default function OrdersTable() {
  const pedidos = [
    { id: "#1035", mesa: "Mesa 3", detalle: "Pizza Margarita", estado: "Sirviendo" },
    { id: "#1025", mesa: "Mesa 2", detalle: "Ensalada César", estado: "Preparando" },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-4">Pedidos recientes</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">ID</th>
            <th>Mesa</th>
            <th>Detalle</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">{p.id}</td>
              <td>{p.mesa}</td>
              <td>{p.detalle}</td>
              <td>
                <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                  {p.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    
  );
  
}