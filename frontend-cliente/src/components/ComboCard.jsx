export default function ComboCard({ combo, onChoose }) {
  return (
    <div className="h-full flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4">
      <div className="flex-1">
        <h4 className="font-semibold">{combo.nombre}</h4>
        <p className="text-sm text-neutral-600 mt-1">
          Elige 1 entrada + 1 plato.
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-semibold">S/ {Number(combo.precio).toFixed(2)}</span>
        <button
          className="rounded-lg bg-emerald-600 px-3 py-2 text-white text-sm hover:bg-emerald-700"
          onClick={onChoose}
        >
          Elegir
        </button>
      </div>
    </div>
  );
}
