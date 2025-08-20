export default function CategoryTile({ title, image, onClick, subtitle }) {
  const img = image || "";
  return (
    <button
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
    >
      <div className="relative h-36 w-full overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-full w-full bg-neutral-200" />
        )}
      </div>
      <div className="p-4 text-left">
        <div className="font-semibold">{title}</div>
        {subtitle && <div className="text-sm text-neutral-500">{subtitle}</div>}
      </div>
    </button>
  );
}
