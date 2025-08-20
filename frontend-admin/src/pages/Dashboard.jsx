// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getKpis, getSalesByDay, getRecentOrders, getMesas, searchMenuItems } from "../services/dashboardApi";
import { useNavigate } from "react-router-dom";

// Formateador PEN con 2 decimales
const PEN = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 });

export default function Dashboard() {
  const [kpis, setKpis] = useState({ ventasDia: 0, tickets: 0, avg: 0, margen: 0 });
  const [ventas, setVentas] = useState([]); // [{dia, total}]
  const [recent, setRecent] = useState([]); // pedidos recientes
  const [mesas, setMesas] = useState([]);   // listado de mesas (muestra pocas)
  const nav = useNavigate();

  // carga inicial
  useEffect(() => {
    (async () => {
      try {
        const [k, serie, r, m] = await Promise.all([
          getKpis(),
          getSalesByDay(7),
          getRecentOrders(6),
          getMesas()
        ]);

        setKpis({
          ventasDia: Number(k?.ventasDia || 0),
          tickets: Number(k?.tickets || 0),
          avg: Number(k?.avg || 0),
          margen: Number(k?.margen || 0),
        });

        const data = Array.isArray(serie?.data) && Array.isArray(serie?.labels)
          ? serie.labels.map((l, i) => ({ dia: l, total: Number(serie.data[i] || 0) }))
          : [];
        setVentas(data);

        setRecent(Array.isArray(r) ? r : []);
        setMesas(Array.isArray(m) ? m.slice(0, 3) : []);
      } catch (e) {
        console.error("Dashboard load:", e);
      }
    })();
  }, []);

  return (
    <div className="space-y-5">
      {/* Fondo suave tipo login */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-neutral-50 via-white to-neutral-200" />
    
      <h1 className="text-2xl font-bold">Inicio</h1>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi title="Ventas del día" value={PEN.format(kpis.ventasDia)} />
        <Kpi title="Pedidos del día" value={kpis.tickets} />
        <Kpi title="Ticket promedio" value={PEN.format(kpis.avg)} />
        <Kpi title="Margen" value={PEN.format(kpis.margen)} />
      </div>

      {/* layout principal: graf + acciones rápidas */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Grafica de ventas */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-4 shadow ring-1 ring-black/5">
          <h3 className="mb-2 font-semibold">Ventas (últimos 7 días)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ventas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Acciones rápidas / “Editar producto” */}
        <QuickProductCard />
      </div>

      {/* abajo: pedidos recientes + “generador” de mesas */}
      <div className="grid gap-5 lg:grid-cols-3">
        <RecentOrdersCard items={recent} onVerTodo={() => nav("/pedidos")} />

        <MesasQuickCard
          mesas={mesas}
          onIrMesas={() => nav("/mesas")}
          onNuevaMesa={() => nav("/mesas")} // atajo a tu página de mesas
        />
      </div>
    </div>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow ring-1 ring-black/5">
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

/* -------------------- Pedidos recientes -------------------- */
function RecentOrdersCard({ items = [], onVerTodo }) {
  return (
    <div className="lg:col-span-2 rounded-2xl bg-white p-4 shadow ring-1 ring-black/5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">Pedidos recientes</h3>
        <button onClick={onVerTodo} className="rounded-md border px-3 py-1 text-sm hover:bg-neutral-50">
          Ver todos
        </button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-[640px] w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500">
              <th className="py-2">ID</th>
              <th>Mesa</th>
              <th>Detalle</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td className="py-6 text-center text-neutral-500" colSpan={4}>No hay pedidos recientes.</td></tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">#{p.id}</td>
                  <td>{p.mesa?.nombre || p.mesa?.codigo || `MESA-${p.mesa_id ?? "?"}`}</td>
                  <td className="truncate max-w-[360px]">
                    {p.detalle?.map?.(d => d?.nombre).join(", ") || p.resumen || "—"}
                  </td>
                  <td><EstadoBadge estado={p.estado} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EstadoBadge({ estado = "" }) {
  const e = String(estado).toLowerCase();
  const styles = e.includes("sirv") || e.includes("listo")
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : e.includes("prep") || e.includes("pend")
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-neutral-50 text-neutral-700 border-neutral-200";
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${styles}`}>{estado || "—"}</span>;
}

/* -------------------- Mesas rápidas -------------------- */
function MesasQuickCard({ mesas = [], onIrMesas, onNuevaMesa }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow ring-1 ring-black/5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">Generador de mesas</h3>
        <button onClick={onIrMesas} className="rounded-md border px-3 py-1 text-sm hover:bg-neutral-50">
          Ir a mesas
        </button>
      </div>

      <div className="space-y-2">
        {mesas.length === 0 && (
          <div className="text-sm text-neutral-500">Aún no hay mesas.</div>
        )}
        {mesas.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-lg border p-2">
            <div className="flex items-center gap-3">
              <span className="font-medium">{m.nombre || m.codigo || `Mesa ${m.id}`}</span>
              <span className="text-xs text-neutral-500">cap. {m.capacidad ?? "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border px-2 py-1 text-xs hover:bg-neutral-50" onClick={onIrMesas}>
                Editar
              </button>
              <button className="rounded-md border px-2 py-1 text-xs hover:bg-neutral-50" onClick={onIrMesas}>
                Limpiar
              </button>
              <button className="rounded-md border px-2 py-1 text-xs hover:bg-neutral-50" onClick={onIrMesas}>
                Cerrar
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={onNuevaMesa}
          className="mt-2 w-full rounded-lg border-2 border-dashed px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
        >
          + Nueva mesa
        </button>
      </div>
    </div>
  );
}

/* -------------------- Widget rápido: Editar producto -------------------- */
function QuickProductCard() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const nav = useNavigate();

  // búsqueda con pequeño debounce
  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await searchMenuItems(q.trim());
      setItems(res.slice(0, 3));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const goToMenu = () => nav("/menu");

  return (
    <div className="rounded-2xl bg-white p-4 shadow ring-1 ring-black/5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Editar producto</h3>
        <button onClick={goToMenu} className="rounded-md border px-3 py-1 text-sm hover:bg-neutral-50">
          Abrir en “Menú”
        </button>
      </div>

      <input
        className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
        placeholder="Busca un plato…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">Busca un producto para editarlo rápido o ábrelo en “Menú”.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between rounded-lg border p-2">
              <div className="flex items-center gap-3">
                <img
                  src={it.imagen_url || "data:image/svg+xml;utf8," + encodeURIComponent(
                    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='60'><rect width='100%' height='100%' fill='#e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='#6b7280'>Sin imagen</text></svg>`
                  )}
                  alt=""
                  className="h-12 w-16 rounded object-cover ring-1 ring-black/5"
                />
                <div>
                  <div className="text-sm font-medium">{it.nombre}</div>
                  <div className="text-xs text-neutral-500">{PEN.format(Number(it.precio || 0))}</div>
                </div>
              </div>
              <button onClick={goToMenu} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-500">
                Editar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
