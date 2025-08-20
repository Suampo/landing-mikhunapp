// src/pages/Inventario.jsx
import { useEffect, useState } from "react";
import { inv } from "../services/inventarioApi";

export default function Inventario(){
  const [tab, setTab] = useState("stock");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Inventario</h1>
      <div className="flex gap-2">
        {["stock","insumos","movimientos","alertas","almacenes"].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm ${tab===t?"bg-neutral-900 text-white":"border"}`}>
            {t[0].toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
      {tab==="stock" && <StockView/>}
      {tab==="insumos" && <InsumosView/>}
      {tab==="movimientos" && <MovView/>}
      {tab==="alertas" && <AlertasView/>}
      {tab==="almacenes" && <AlmacenesView/>}
    </div>
  );
}

function StockView(){
  const [rows,setRows]=useState([]);
  const load=()=> inv.stock(false).then(setRows);
  useEffect(()=>{ load(); const h=()=>load(); window.addEventListener("inv:changed",h); return ()=>window.removeEventListener("inv:changed",h); },[]);
  return (
    <div className="rounded-xl bg-white p-4 shadow ring-1 ring-black/5">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-neutral-500">
          <th>Insumo</th><th>Unidad</th><th className="text-right">Stock</th><th className="text-right">Mínimo</th>
        </tr></thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.id} className="border-t">
              <td className="py-2">{r.nombre}</td>
              <td>{r.unidad}</td>
              <td className="text-right">{Number(r.cantidad).toFixed(2)}</td>
<td className={`text-right ${Number(r.cantidad)<=Number(r.stock_min)?"text-red-600":""}`}>
   {Number(r.stock_min).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AlertasView(){
  const [rows,setRows]=useState([]);
  const load=()=> inv.stock(true).then(setRows);
  useEffect(()=>{ load(); const h=()=>load(); window.addEventListener("inv:changed",h); return ()=>window.removeEventListener("inv:changed",h); },[]);
  return (
    <div className="rounded-xl bg-white p-4 shadow ring-1 ring-black/5">
      <h3 className="mb-3 font-semibold">Bajo stock</h3>
      {rows.length===0? <div className="text-sm text-neutral-500">Todo OK ✅</div>:
        <ul className="space-y-2">{rows.map(r=>
          <li key={r.id} className="flex justify-between rounded-lg border p-2">
            <span>{r.nombre} <span className="text-xs text-neutral-500">({r.unidad})</span></span>
           <span className="text-red-600 font-medium">
   {Number(r.cantidad).toFixed(2)} / min {Number(r.stock_min).toFixed(2)}
 </span>
          </li>)}
        </ul>}
    </div>
  );
}

function InsumosView(){
  const [rows,setRows]=useState([]);
  const [unis,setUnis]=useState([]);
  const [form,setForm]=useState({nombre:"",unidad_id:"",stock_min:"",costo_unit:""});
  const load=()=> inv.insumos().then(setRows);
  useEffect(()=>{ load(); inv.unidades().then(d=>setUnis(d||[])); },[]);

  const save=async e=>{
    e.preventDefault();
    await inv.crear(form);
    setForm({nombre:"",unidad_id:"",stock_min:"",costo_unit:""});
    load();
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form onSubmit={save} className="rounded-xl bg-white p-4 shadow ring-1 ring-black/5 space-y-3">
        <h3 className="font-semibold">Nuevo insumo</h3>
        <input className="w-full rounded-lg border px-3 py-2" placeholder="Nombre"
          value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/>
        <div className="grid grid-cols-3 gap-2">
          <select className="rounded-lg border px-3 py-2" value={form.unidad_id||""}
                  onChange={e=>setForm({...form,unidad_id:e.target.value})}>
            <option value="">— Unidad —</option>
            {[...new Map((unis||[]).map(u=>[`${(u.abrev||"").toLowerCase()}|${(u.nombre||"").toLowerCase()}`,u])).values()]
              .map(u=>(<option key={u.id} value={u.id}>{u.nombre} {u.abrev?`(${u.abrev})`:""}</option>))}
          </select>
          <input className="rounded-lg border px-3 py-2" placeholder="Stock mín" type="number" step="0.01"
            value={form.stock_min} onChange={e=>setForm({...form,stock_min:e.target.value})}/>
          <input className="rounded-lg border px-3 py-2" placeholder="Costo unit" type="number" step="0.0001"
            value={form.costo_unit} onChange={e=>setForm({...form,costo_unit:e.target.value})}/>
        </div>
        <button className="rounded-lg bg-neutral-900 px-4 py-2 text-white">Guardar</button>
      </form>

      <div className="rounded-xl bg-white p-4 shadow ring-1 ring-black/5">
        <h3 className="mb-2 font-semibold">Insumos</h3>
        <ul className="divide-y">
          {rows.map(r=>(<li key={r.id} className="py-2 flex justify-between">
            <span>{r.nombre} <span className="text-xs text-neutral-500">({r.unidad})</span></span>
            <span className="text-xs text-neutral-500">min {Number(r.stock_min).toFixed(2)} · S/ {Number(r.costo_unit).toFixed(2)}</span>
          </li>))}
        </ul>
      </div>
    </div>
  );
}

function MovView(){
  const [rows,setRows]=useState([]);
  const [insumos,setInsumos]=useState([]);
  const [alms,setAlms]=useState([]);
  const [f,setF]=useState({ tipo:"in", insumo_id:"", almacen_id:"", cantidad:"", costo_unit:"", origen:"Compra" });

  const load=()=> inv.movimientos().then(setRows);
  useEffect(()=>{ load(); inv.insumos().then(setInsumos); inv.almacenes().then(setAlms); },[]);

  const save=async (e)=>{
    e.preventDefault();
    await inv.crearMov(f);
    setF({ tipo:"in", insumo_id:"", almacen_id:"", cantidad:"", costo_unit:"", origen:"Compra" });
    load();
    // Notificar a Stock/Alertas
    window.dispatchEvent(new CustomEvent("inv:changed"));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={save} className="rounded-xl bg-white p-4 shadow ring-1 ring-black/5 grid gap-2 md:grid-cols-6">
        <select className="rounded-lg border px-2 py-2 md:col-span-2" value={f.insumo_id}
                onChange={e=>setF({...f,insumo_id:e.target.value})}>
          <option value="">— Insumo —</option>
          {insumos.map(i=>(<option key={i.id} value={i.id}>{i.nombre}</option>))}
        </select>
        <select className="rounded-lg border px-2 py-2" value={f.almacen_id}
                onChange={e=>setF({...f,almacen_id:e.target.value})}>
          <option value="">— Almacén —</option>
          {alms.map(a=>(<option key={a.id} value={a.id}>{a.nombre}</option>))}
        </select>
        <select className="rounded-lg border px-2 py-2" value={f.tipo}
                onChange={e=>setF({...f,tipo:e.target.value})}>
          <option value="in">Entrada</option>
          <option value="out">Salida</option>
        </select>
        <input className="rounded-lg border px-3 py-2" placeholder="Cantidad" type="number" step="0.01"
               value={f.cantidad} onChange={e=>setF({...f,cantidad:e.target.value})}/>
        <input className="rounded-lg border px-3 py-2" placeholder="Costo unit" type="number" step="0.01"
               value={f.costo_unit} onChange={e=>setF({...f,costo_unit:e.target.value})}/>
        <input className="rounded-lg border px-3 py-2" placeholder="Origen (compra/ajuste/merma)"
               value={f.origen} onChange={e=>setF({...f,origen:e.target.value})}/>
        <button className="md:col-span-6 rounded-lg bg-neutral-900 px-4 py-2 text-white">Registrar movimiento</button>
      </form>

      <div className="rounded-xl bg-white p-4 shadow ring-1 ring-black/5 overflow-auto">
        <table className="min-w-[700px] w-full text-sm">
          <thead><tr className="text-left text-neutral-500">
            <th>Fecha</th><th>Insumo</th><th>Almacén</th><th>Tipo</th>
            <th className="text-right">Cantidad</th><th className="text-right">Costo</th><th></th>
          </tr></thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id} className="border-t">
                <td className="py-2">{new Date(r.created_at).toLocaleString()}</td>
                <td>{r.insumo}</td><td>{r.almacen}</td><td>{r.tipo}</td>
                <td className="text-right">{Number(r.cantidad).toFixed(2)}</td>
               <td className="text-right">{r.costo_unit != null ? Number(r.costo_unit).toFixed(2) : "-"}</td>
                <td>{r.origen || r.referencia || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AlmacenesView(){
  const [rows, setRows] = useState([]);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await inv.almacenes();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("almacenes.load:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // NO devolver Promise aquí
    load();
    const onChanged = () => load();
    window.addEventListener("inv:changed", onChanged);
    return () => {
      window.removeEventListener("inv:changed", onChanged);
    };
  }, []);

  const add = async (e) => {
    e.preventDefault();
    const n = nombre.trim();
    if (!n) return;
    try {
      await inv.crearAlmacen(n);
      setNombre("");
      await load();
      window.dispatchEvent(new CustomEvent("inv:changed"));
    } catch (e) {
      console.error("crearAlmacen:", e);
      alert(e?.response?.data?.error || "No se pudo crear el almacén");
    }
  };

  const rename = async (id) => {
    const curr = rows.find(r => r.id === id);
    const nuevo = prompt("Nuevo nombre", curr?.nombre || "");
    if (!nuevo?.trim()) return;
    try {
      await inv.renombrarAlmacen(id, nuevo.trim());
      await load();
      window.dispatchEvent(new CustomEvent("inv:changed"));
    } catch (e) {
      console.error("renombrarAlmacen:", e);
      alert(e?.response?.data?.error || "No se pudo renombrar");
    }
  };

  const remove = async (id) => {
    if (!confirm("¿Eliminar almacén? (solo si no tiene movimientos)")) return;
    try {
      await inv.eliminarAlmacen(id);
      await load();
      window.dispatchEvent(new CustomEvent("inv:changed"));
    } catch (e) {
      console.error("eliminarAlmacen:", e);
      alert(e?.response?.data?.error || "No se pudo eliminar");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form onSubmit={add} className="rounded-xl bg-white p-4 shadow ring-1 ring-black/5 space-y-3">
        <h3 className="font-semibold">Nuevo almacén</h3>
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Nombre (p.ej. Cocina)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button className="rounded-lg bg-neutral-900 px-4 py-2 text-white">Agregar</button>
      </form>

      <div className="rounded-xl bg-white p-4 shadow ring-1 ring-black/5">
        <h3 className="mb-2 font-semibold">Almacenes</h3>

        {loading ? (
          <ul className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="h-8 animate-pulse rounded bg-neutral-100" />
            ))}
          </ul>
        ) : (
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2">
                <span>{r.nombre}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => rename(r.id)}
                    className="rounded-md border px-2 py-1 text-xs"
                  >
                    Renombrar
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    className="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
            {rows.length === 0 && !loading && (
              <li className="py-2 text-sm text-neutral-500">Sin almacenes aún.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
