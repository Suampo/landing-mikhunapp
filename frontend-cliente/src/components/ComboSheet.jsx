// src/components/ComboSheet.jsx
import { useState, useEffect } from "react";

export default function ComboSheet({
  open,
  onClose,
  combo,
  onConfirm,
  absolute,
  fallbackImg,
  formatPEN,
}) {
  const [entradaId, setEntradaId] = useState(null);
  const [platoId, setPlatoId] = useState(null);

  useEffect(() => {
    if (!open) {
      setEntradaId(null);
      setPlatoId(null);
    }
  }, [open]);

  if (!open || !combo) return null;

  const entrada = combo.entradas.find((e) => e.id === entradaId);
  const plato = combo.platos.find((p) => p.id === platoId);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">
              {combo.nombre} — {formatPEN(combo.precio)}
            </h3>
            <button
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-100"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Entradas */}
            <div>
              <h4 className="font-medium mb-2">Elige una entrada</h4>
              <div className="grid grid-cols-2 gap-3">
                {combo.entradas.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setEntradaId(e.id)}
                    className={`text-left rounded-xl border p-2 hover:bg-neutral-50 ${
                      entradaId === e.id ? "ring-2 ring-emerald-500" : ""
                    }`}
                  >
                    <img
                      src={absolute(e.imagen_url) || fallbackImg}
                      alt={e.nombre}
                      className="aspect-[4/3] w-full rounded-lg object-cover"
                    />
                    <div className="mt-1 text-sm font-medium">{e.nombre}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Platos */}
            <div>
              <h4 className="font-medium mb-2">Elige un plato</h4>
              <div className="grid grid-cols-2 gap-3">
                {combo.platos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatoId(p.id)}
                    className={`text-left rounded-xl border p-2 hover:bg-neutral-50 ${
                      platoId === p.id ? "ring-2 ring-emerald-500" : ""
                    }`}
                  >
                    <img
                      src={absolute(p.imagen_url) || fallbackImg}
                      alt={p.nombre}
                      className="aspect-[4/3] w-full rounded-lg object-cover"
                    />
                    <div className="mt-1 text-sm font-medium">{p.nombre}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              className="rounded-lg border px-4 py-2 text-sm hover:bg-neutral-100"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              disabled={!entrada || !plato}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              onClick={() => onConfirm(entrada, plato)}
            >
              Agregar combo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}