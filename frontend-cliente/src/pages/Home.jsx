import { useNavigate } from "react-router-dom";
import CategoryTile from "../components/CategoryTile";
import { useMenuPublic } from "../hooks/useMenuPublic";

const IMG_BY_CAT = {
  Entrada: "https://picsum.photos/seed/entradas/640/360",
  Fondo:   "https://picsum.photos/seed/fondos/640/360",
  Extras:  "https://picsum.photos/seed/extras/640/360",
  Bebidas: "https://picsum.photos/seed/bebidas/640/360",
};

export default function Home() {
  const nav = useNavigate();
  const { loading, error, categories, combos, restaurantId } = useMenuPublic();

  const mesa = new URLSearchParams(location.search).get("mesaCode")
            || new URLSearchParams(location.search).get("mesaId")
            || 1;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <header className="mb-5">
        <h1 className="text-xl font-bold">🍽 Menú Digital — Mesa {mesa}</h1>
        <p className="text-sm text-neutral-500">Restaurant: {restaurantId}</p>
      </header>

      {/* Combos */}
      {combos?.length > 0 && (
        <>
          <h2 className="mb-3 text-lg font-semibold">Combos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <CategoryTile
              title="Menú del día"
              subtitle="Elige 1 entrada + 1 fondo"
              image="https://picsum.photos/seed/combos/640/360"
              onClick={() => nav("/combo" + location.search)}
            />
          </div>
          <div className="my-6 h-px bg-neutral-200" />
        </>
      )}

      {/* Categorías */}
      <h2 className="mb-3 text-lg font-semibold">Empieza tu pedido aquí</h2>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-neutral-200" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <CategoryTile
              key={c.id}
              title={c.nombre}
              image={IMG_BY_CAT[c.nombre] || "https://picsum.photos/seed/cat/640/360"}
              onClick={() => nav(`/categoria/${c.id}${location.search}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
