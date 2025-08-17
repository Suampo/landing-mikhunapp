// src/pages/Mesas.jsx
import useMesas from "../hooks/useMesas.js";
import MesasHeader from "../components/MesasHeader";
import MesaCard from "../components/MesaCard";

export default function Mesas() {
  const {
    filtered, loading, query, setQuery,
    adding, addMesa, removeMesa,
    qrData, generarQR, copiarQR,
  } = useMesas();

  return (
    <div className="mx-auto w-full max-w-6xl">
      <MesasHeader
        onAdd={addMesa}
        adding={adding}
        query={query}
        setQuery={setQuery}
      />
      {/* ...resto igual */}
      {loading ? (
        /* skeleton */
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <div className="mb-2 h-5 w-32 rounded bg-neutral-200" />
              <div className="mb-4 h-4 w-48 rounded bg-neutral-200" />
              <div className="h-8 w-28 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <p className="text-neutral-600">No hay mesas. Crea una con el formulario de arriba.</p>
        </div>
      ) : (
        <div className="grid items-start auto-rows-min gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((m) => (
            <MesaCard
              key={m.id}
              mesa={m}
              qr={qrData[m.id]}
              onGenerate={generarQR}
              onDelete={(id) => { if (confirm("¿Eliminar mesa?")) removeMesa(id); }}
              onCopy={async (id) => { await copiarQR(id); alert("Link copiado"); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
