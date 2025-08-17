// src/components/MenuItemEdit.jsx
import { useEffect, useMemo, useState } from "react";
import { getCategories } from "../services/categoriesApi";

export default function MenuItemEdit({
  item,
  onSave,
  categorias: categoriasProp, // opcional: si el padre ya pasó categorías
}) {
  const [nombre, setNombre] = useState(item?.nombre || "");
  const [precio, setPrecio] = useState(item?.precio ?? "");
  const [descripcion, setDescripcion] = useState(item?.descripcion || "");
  const [imagen, setImagen] = useState(null);
  const [categoriaId, setCategoriaId] = useState(item?.categoria_id ?? null); // number | null

  const [cats, setCats] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);

  // Usar categorías del padre si las envía; si no, usar las que carguemos
  const categoriasMemo = useMemo(
    () => (Array.isArray(categoriasProp) ? categoriasProp : cats),
    [categoriasProp, cats]
  );

  // Carga de categorías solo si el padre no las pasó
  useEffect(() => {
    if (Array.isArray(categoriasProp)) return;
    (async () => {
      try {
        setLoadingCats(true);
        const data = await getCategories(); // backend toma restaurantId del token
        setCats(Array.isArray(data) ? data : []);
      } finally {
        setLoadingCats(false);
      }
    })();
  }, [categoriasProp]);

  // Resincronizar campos cuando cambia el item (abrir/editar otro plato)
  useEffect(() => {
    setNombre(item?.nombre || "");
    setPrecio(item?.precio ?? "");
    setDescripcion(item?.descripcion || "");
    setCategoriaId(item?.categoria_id ?? null); // number | null
    setImagen(null);
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = (nombre || "").trim();
    const p = Number(precio);
    if (!n) return alert("El nombre es requerido");
    if (Number.isNaN(p)) return alert("El precio no es válido");

    onSave({
      nombre: n,
      precio: p,
      descripcion: (descripcion || "").trim() || null,
      imagen, // File o null
      categoriaId: categoriaId ?? null, // ya es number o null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">Nombre</label>
        <input
          className="rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-blue-500"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>

      {/* Precio */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">Precio</label>
        <input
          type="number"
          step="0.01"
          className="rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-blue-500"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
        />
      </div>

      {/* Descripción */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">Descripción</label>
        <textarea
          rows={3}
          className="rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-blue-500"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>

      {/* Categoría */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">Categoría</label>
        <select
          className="rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-blue-500"
          value={categoriaId != null ? String(categoriaId) : ""} // controlado como string
          onChange={(e) =>
            setCategoriaId(e.target.value ? Number(e.target.value) : null) // convertir a number|null
          }
        >
          <option value="">— Sin categoría —</option>
          {categoriasMemo.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.nombre}
            </option>
          ))}
        </select>
        {loadingCats && (
          <span className="text-xs text-neutral-500">Cargando categorías…</span>
        )}
      </div>

      {/* Imagen + Guardar */}
      <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
        <label className="text-sm">
          <span className="mr-2"></span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files?.[0] || null)}
          />
        </label>
        <div className="text-xs text-neutral-500 truncate max-w-[50%]">
          {imagen?.name ?? ""}
        </div>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
