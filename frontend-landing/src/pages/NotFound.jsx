import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="grid min-h-[60vh] place-items-center">
      <div className="text-center">
        <div className="text-6xl font-bold">404</div>
        <p className="mt-2 text-neutral-600">Página no encontrada.</p>
        <Link to="/" className="mt-4 inline-block rounded-lg border px-4 py-2 hover:bg-white">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
