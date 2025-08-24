import { useNavigate } from "react-router-dom";
import CategoryTile from "../components/CategoryTile";
import { useMenuPublic } from "../hooks/useMenuPublic";
import { openPublicCheckoutCulqi } from "../services/culqi";

const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'>
  <rect width='100%' height='100%' fill='#e5e7eb'/>
  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
        font-family='Arial, sans-serif' font-size='16' fill='#6b7280'>Sin imagen</text>
</svg>`);

export default function Home() {
  const nav = useNavigate();
  const { loading, error, categories, combos, restaurantId, mesaId, mesaCode } = useMenuPublic();

  const mesa = (mesaCode && `#${mesaCode}`) || (mesaId ? `Mesa ${mesaId}` : "—");

  // TODO: reemplaza por el total real del carrito en soles
  const totalEnSoles = 5;
  const amount = Math.round(Number(totalEnSoles) * 100);

  const onPay = async () => {
    try {
      const metadata = {};
      if (mesaCode) metadata.table_code = String(mesaCode);
      if (mesaId)   metadata.mesaId = Number(mesaId);

      const customer = {
        email: localStorage.getItem("guest_email") || "cliente.demo@correo.com",
        fullName: localStorage.getItem("guest_name") || "",
        phone: localStorage.getItem("guest_phone") || "",
      };

      await openPublicCheckoutCulqi({
        restaurantId,
        amount,
        customer,
        metadata,
        currency: "PEN",
        description: "Pedido en MikhunApp",
      });
    } catch (e) {
      console.error(e);
      alert("No se pudo iniciar el pago.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 pb-28">
      <header className="mb-5">
        <h1 className="text-xl font-bold">🍽 Menú Digital — {mesa}</h1>
        <p className="text-sm text-neutral-500">Restaurant: {restaurantId}</p>
     
      </header>

      {/* Combos */}
      {Array.isArray(combos) && combos.length > 0 && (
        <>
          <h2 className="mb-3 text-lg font-semibold">Combos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {combos.map((co) => (
              <CategoryTile
                key={co.id}
                title={co.nombre}
                subtitle="Elige 1 entrada + 1 fondo"
                image={co.cover_url || FALLBACK}
                onClick={() => nav(`/combo${location.search}`)}
              />
            ))}
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
              key={c.id ?? `otros`}
              title={c.nombre}
              image={c.cover_url || FALLBACK}
              onClick={() => c.id != null && nav(`/categoria/${c.id}${location.search}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
