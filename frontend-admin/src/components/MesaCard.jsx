import { useState } from "react";

export default function MesaCard({ mesa, qr, onGenerate, onDelete, onCopy }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleGenerateClick = async () => {
    if (open) { setOpen(false); return; }
    if (!qr && typeof onGenerate === "function") {
      try {
        setBusy(true);
        await onGenerate(mesa.id);
      } finally {
        setBusy(false);
      }
    }
    setOpen(true);
  };

  return (
    <div className="self-start rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{mesa.codigo}</h3>
          <p className="mt-0.5 text-sm text-neutral-600">
            {mesa.descripcion || "Sin descripción"}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
            onClick={handleGenerateClick}
            disabled={busy}
          >
            {open ? "Ocultar QR" : busy ? "Generando..." : "Generar QR"}
          </button>

          <button
            className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
            onClick={() => onDelete(mesa.id)}
          >
            Eliminar
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-neutral-800">QR generado</span>
            <div className="flex items-center gap-2">
              <a
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                href={qr || "#"}
                download={`mesa_${mesa.codigo}.png`}
                onClick={(e) => { if (!qr) e.preventDefault(); }}
              >
                Descargar
              </a>
              <button
                className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs transition hover:bg-neutral-50 disabled:opacity-50"
                onClick={() => onCopy(mesa.id)}
                disabled={!qr}
              >
                Copiar link
              </button>
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            {qr ? (
              <img
                src={qr}
                alt={`QR de ${mesa.codigo}`}
                className="h-auto w-40 rounded-md border border-neutral-200"
                loading="lazy"
              />
            ) : (
              <div className="grid h-40 w-40 place-items-center rounded-md border border-dashed border-neutral-300 text-xs text-neutral-500">
                Genera el QR para mostrarlo
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
