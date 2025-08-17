export default function CategoryTile({ title, image, onClick, subtitle }) {
  return (
    <button onClick={onClick} className="flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden hover:shadow-md transition">
      <img src={image} alt={title} className="h-36 w-full object-cover" />
      <div className="p-4 text-left">
        <div className="font-semibold">{title}</div>
        {subtitle && <div className="text-sm text-neutral-500">{subtitle}</div>}
      </div>
    </button>
  );
}
