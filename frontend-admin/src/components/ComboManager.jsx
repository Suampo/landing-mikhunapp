// src/components/ComboManager.jsx
import { useEffect, useMemo, useState } from "react";
import {
  getCombos,
  createCombo,
  updateCombo,
  deleteCombo,
} from "../services/combosApi";

export default function ComboManager({ cats: externalCats = [] }) {
  const [cats, setCats] = useState(externalCats);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // evita dobles clics

  // Form
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [catEntrada, setCatEntrada] = useState("");
  const [catPlato, setCatPlato] = useState("");

  // id -> nombre para chips
  const catNameById = useMemo(
    () => Object.fromEntries((cats || []).map((c) => [c.id, c.nombre])),
    [cats]
  );

  // sincroniza categorías del padre sin crear loops
  useEffect(() => {
    setCats(Array.isArray(externalCats) ? externalCats : []);
  }, [externalCats]);

  const load = async () => {
    setLoading(true);
    try {
      const co = await getCombos();
      setCombos(Array.isArray(co) ? co : []);
    } catch (e) {
      console.error("getCombos error:", e?.response?.data || e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    const n = nombre.trim();
    const p = Number(precio);
    if (!n) return alert("Ingresa un nombre.");
    if (!Number.isFinite(p) || p < 0) return alert("Precio inválido.");
    if (!catEntrada || !catPlato) return alert("Selecciona ambas categorías.");

    try {
      setSaving(true);
      await createCombo({
        nombre: n,
        precio: p,
        categoriaEntradaId: Number(catEntrada),
        categoriaPlatoId: Number(catPlato),
        activo: true,
      });
      setNombre("");
      setPrecio("");
      setCatEntrada("");
      setCatPlato("");
      await load();
    } catch (e) {
      console.error("createCombo error:", e?.response?.data || e?.message || e);
      alert("No se pudo crear el combo.");
    } finally {
      setSaving(false);
    }
  };

  const rename = async (id) => {
    const cur = combos.find((x) => x.id === id);
    const nuevo = prompt("Nombre del combo", cur?.nombre || "");
    if (!nuevo || !nuevo.trim()) return;

    try {
      await updateCombo(id, { nombre: nuevo.trim() });
      await load();
    } catch (e) {
      console.error("updateCombo(nombre) error:", e?.response?.data || e?.message || e);
      alert("No se pudo renombrar el combo.");
    }
  };

  const changePrice = async (id) => {
    const cur = combos.find((x) => x.id === id);
    const txt = prompt("Nuevo precio", String(cur?.precio ?? ""));
    if (txt == null) return;
    const p = Number(txt);
    if (!Number.isFinite(p) || p < 0) return alert("Precio inválido.");

    try {
      await updateCombo(id, { precio: p });
      await load();
    } catch (e) {
      console.error("updateCombo(precio) error:", e?.response?.data || e?.message || e);
      alert("No se pudo actualizar el precio.");
    }
  };

  const remove = async (id) => {
    if (!confirm("¿Eliminar combo? Esta acción no se puede deshacer.")) return;
    try {
      setDeletingId(id);
      await deleteCombo(id);                   // DELETE o fallback a PUT activo:false (ver combosApi)
      // Actualización optimista:
      setCombos((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error("deleteCombo error:", e?.response?.data || e?.message || e);
      alert("No se pudo eliminar el combo.");
      // Fallback a recarga completa por si falló la optimista:
      await load();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <h3 className="mb-3 text-base font-semibold">Combos (Menú del día)</h3>

      <form onSubmit={add} className="mb-4 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
        <input
          className="rounded-lg border px-3 py-2 text-sm outline-none"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          disabled={saving}
        />
        <input
          type="number"
          step="0.01"
          className="rounded-lg border px-3 py-2 text-sm outline-none"
          placeholder="Precio (S/)"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          disabled={saving}
        />
        <select
          className="rounded-lg border px-3 py-2 text-sm outline-none"
          value={catEntrada}
          onChange={(e) => setCatEntrada(e.target.value)}
          disabled={saving}
        >
          <option value="">— Categoría 1 (entrada) —</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border px-3 py-2 text-sm outline-none"
          value={catPlato}
          onChange={(e) => setCatPlato(e.target.value)}
          disabled={saving}
        >
          <option value="">— Categoría 2 (plato) —</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <div className="sm:col-span-2 md:col-span-4">
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-white disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Creando…" : "Crear combo"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando…</p>
      ) : combos.length === 0 ? (
        <p className="text-sm text-neutral-500">Sin combos.</p>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {combos.map((co) => {
            const c1Id = co.categoria_entrada_id ?? co.categoriaEntradaId;
            const c2Id = co.categoria_plato_id ?? co.categoriaPlatoId;
            const cat1 = catNameById[c1Id] || "—";
            const cat2 = catNameById[c2Id] || "—";

            return (
              <div
                key={co.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div>
                  <div className="font-medium">{co.nombre}</div>
                  <div className="text-xs text-neutral-600">
                    Precio: S/ {Number(co.precio || 0).toFixed(2)}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700 ring-1 ring-neutral-200">
                      {cat1}
                    </span>
                    <span className="text-[11px] text-neutral-400">+</span>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700 ring-1 ring-neutral-200">
                      {cat2}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded border px-2 py-1 text-xs"
                    onClick={() => rename(co.id)}
                  >
                    Renombrar
                  </button>
                  <button
                    type="button"
                    className="rounded border px-2 py-1 text-xs"
                    onClick={() => changePrice(co.id)}
                  >
                    Precio
                  </button>
                  <button
                    type="button"
                    className="rounded border border-red-300 bg-red-50 px-2 py-1 text-xs text-red-700 disabled:opacity-60"
                    onClick={() => remove(co.id)}
                    disabled={deletingId === co.id}
                  >
                    {deletingId === co.id ? "Eliminando…" : "Eliminar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
