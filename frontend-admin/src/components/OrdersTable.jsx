// src/components/OrdersTable.jsx
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