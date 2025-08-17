// src/components/CategoriesManager.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoriesApi";

export default function CategoriesManager({ onChange }) {
  const [loading, setLoading] = useState(false);
  const [cats, setCats] = useState([]);
  const [nombre, setNombre] = useState("");

  // guardamos la última versión enviada al padre para evitar onChange redundantes
  const lastSentRef = useRef([]);

  const shallowEqualCats = (a = [], b = []) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i]?.id !== b[i]?.id || a[i]?.nombre !== b[i]?.nombre) return false;
    }
    return true;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const c = await getCategories(); // restaurantId viene del token
      const safe = Array.isArray(c) ? c : [];
      setCats(safe);

      // solo notificar al padre si de verdad cambió
      if (onChange && !shallowEqualCats(lastSentRef.current, safe)) {
        onChange(safe);
        lastSentRef.current = safe;
      }
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  useEffect(() => {
    // se ejecuta solo una vez (o cuando cambie la referencia estable de load)
    load();
  }, [load]);

  const add = async (e) => {
    e.preventDefault();
    const n = nombre.trim();
    if (!n) return;
    await createCategory(n);
    setNombre("");
    await load();
  };

  const rename = async (id) => {
    const current = cats.find((c) => c.id === id);
    const nuevo = prompt("Nuevo nombre de categoría", current?.nombre || "");
    if (!nuevo?.trim()) return;
    await updateCategory(id, nuevo.trim());
    await load();
  };

  const remove = async (id) => {
    if (!confirm("¿Eliminar categoría? (los platos quedarán sin categoría)")) return;
    await deleteCategory(id);
    await load();
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">Categorías</h3>
      </div>

      <form onSubmit={add} className="mb-3 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          placeholder="Nueva categoría (ej. Pizzas)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
          Agregar
        </button>
      </form>

      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-neutral-100" />
          ))
        ) : cats.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin categorías.</p>
        ) : (
          cats.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2"
            >
              <span className="truncate text-sm">{c.nombre}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => rename(c.id)}
                  className="rounded-md border px-2 py-1 text-xs hover:bg-neutral-50"
                >
                  Renombrar
                </button>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  className="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
