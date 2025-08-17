// src/components/MenuCard.jsx
const FALLBACK = "/no-image.png";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const toAbs = (u) => (u?.startsWith("http") ? u : u ? `${API_BASE}${u}` : "");

export default function MenuCard({
  item,
  onEdit,
  onDelete,
  onToggleActive,
  categoryName, // 👈 NUEVO
}) {
  const src = toAbs(item.imagen_url) || FALLBACK;
  const inactive = item.activo === false;

  return (
    <div
      className={[
        "group h-full flex flex-col overflow-hidden rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 transition hover:shadow-md",
        inactive ? "opacity-60 grayscale" : "",
      ].join(" ")}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img
          src={src}
          onError={(e) => {
            e.currentTarget.src = FALLBACK;
          }}
          alt={item.nombre}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Chip de categoría (izquierda) */}
        {categoryName && (
          <span className="absolute left-2 top-2 max-w-[70%] truncate rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur sm:text-xs">
            {categoryName}
          </span>
        )}

        {/* Chip de precio (derecha) */}
        <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur sm:text-xs">
          S/ {Number(item.precio || 0).toFixed(2)}
        </span>
      </div>

      <div className="flex-1 min-w-0 p-4 flex flex-col">
        <h3 className="line-clamp-1 font-semibold">
          {item.nombre || "Sin nombre"}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
          {item.descripcion || "Sin descripción"}
        </p>

        <div className="mt-auto pt-4 flex items-center gap-2">
          {onToggleActive && (
            <button
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                inactive
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-amber-300 bg-amber-50 text-amber-800"
              }`}
              onClick={() => onToggleActive(item)}
            >
              {inactive ? "Mostrar" : "Ocultar"}
            </button>
          )}
          <button
            className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-1.5 text-sm text-yellow-800"
            onClick={() => onEdit(item)}
          >
            Editar
          </button>
          <button
            className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-700"
            onClick={() => onDelete(item.id)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
