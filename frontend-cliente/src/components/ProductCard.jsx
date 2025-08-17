import { memo } from "react";

function ProductCard({ item, onAdd, absolute, fallbackImg, formatPEN }) {
  const price = formatPEN(item.precio);
  const src = absolute(item.imagen_url) || fallbackImg;

  return (
    <div className="group h-full flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      {/* Imagen */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        <img
          src={src}
          alt={item.nombre}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImg;
          }}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute right-2 top-2 sm:right-3 sm:top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-white backdrop-blur">
          {price}
        </span>
      </div>

      {/* Contenido con min-w-0 */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 min-w-0">
        <h3 className="line-clamp-1 text-sm sm:text-base font-semibold">
          {item.nombre}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs sm:text-sm text-neutral-600">
          {item.descripcion || "Delicioso y recién preparado."}
        </p>

        {/* Footer sin desbordes (mobile first) */}
        <div className="mt-auto grid min-w-0 grid-cols-[1fr_auto] items-center gap-1.5">
          <button
            onClick={() => onAdd(item)}
            className="h-10 w-full rounded-lg bg-emerald-600 px-3 sm:px-4 text-[13px] sm:text-sm font-medium text-white transition hover:bg-emerald-700 active:translate-y-[1px]"
          >
            Agregar
          </button>
          <span className="ml-1 whitespace-nowrap text-[11px] sm:text-sm leading-none tabular-nums tracking-tight">
            {price}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
