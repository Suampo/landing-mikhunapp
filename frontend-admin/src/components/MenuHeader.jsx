export default function MenuHeader({ query, setQuery, onCreate }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Menú</h2>
        <p className="text-sm text-gray-500">Administra tus platos e imágenes.</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          className="w-56 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-blue-500"
          placeholder="Buscar plato..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
          onClick={onCreate}
        >
          + Nuevo plato
        </button>
      </div>
    </div>
  );
}
