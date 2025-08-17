import { useParams } from "react-router-dom";

export default function RestaurantPublic() {
  const { slug } = useParams();
  return (
    <main className="py-12">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-2xl font-bold">Perfil del restaurante</h1>
        <p className="mt-1 text-neutral-600 text-sm">Slug: <span className="font-mono">{slug}</span></p>

        <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-lg font-semibold">La Parrilla Demo</div>
          <p className="text-sm text-neutral-600">
            RUC 00000000000 · Av. Siempre Viva 742 · Lima
          </p>
          <p className="mt-3 text-sm">
            Página pública con datos del comercio, políticas y acceso al menú digital.
          </p>
          <div className="mt-4 flex gap-3">
            <a href="http://localhost:5174/?restaurantId=1&mesaId=1&mesaCode=M1"
               className="rounded-lg bg-emerald-600 px-4 py-2 text-white text-sm font-medium hover:bg-emerald-500">
              Ver menú
            </a>
            <a href="/contacto" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-white">
              Contacto
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
