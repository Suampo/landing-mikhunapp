// src/pages/auth/RegisterRestaurant.jsx
import { useState } from "react";
// 👇 corrige el import: este archivo está en src/pages/auth y el modal en src/pages/legal
import ConsentModal from "../legal/ConsentModal.jsx";

export default function RegisterRestaurant() {
  const [form, setForm] = useState({ nombre: "", email: "", contacto: "", telefono: "" });
  const [consent, setConsent] = useState({ required: false, marketing: false });
  const [openConsent, setOpenConsent] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitToApi = async () => {
    setLoading(true);
    try {
      const payload = { ...form, consent_required: consent.required, consent_marketing: consent.marketing };
      console.log("submit", payload);
      alert("Registro enviado ✨");
    } catch (e) {
      console.error(e);
      alert("No se pudo registrar");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!consent.required) {
      setOpenConsent(true);
      setPendingSubmit(true);
      return;
    }
    submitToApi();
  };

  const handleConsentConfirm = ({ marketing }) => {
    setConsent({ required: true, marketing: !!marketing });
    setOpenConsent(false);
    if (pendingSubmit) {
      setPendingSubmit(false);
      submitToApi();
    }
  };

  return (
    <main className="relative overflow-hidden">
      {/* blobs verdes */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-400/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -right-48 h-[460px] w-[460px] rounded-full bg-emerald-400/10 blur-3xl" />

      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Registra tu restaurante</h1>
        <p className="mt-2 text-neutral-600">
          Te tomará menos de 2 minutos. Luego eliges tu plan y pasas al pago.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <div>
            <label className="text-sm font-medium">Nombre del restaurante</label>
            <input
              className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-emerald-500"
              placeholder="Ej: La Esquina de Juan"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Contacto</label>
              <input
                className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-emerald-500"
                placeholder="Nombre y apellido"
                value={form.contacto}
                onChange={(e) => setForm((f) => ({ ...f, contacto: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Teléfono</label>
              <input
                className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-emerald-500"
                placeholder="+51 9xx xxx xxx"
                value={form.telefono}
                onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-emerald-500"
              placeholder="tucorreo@restaurante.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>

          <p className="text-xs text-neutral-600">
            Al registrarte aceptas el tratamiento necesario de datos.{" "}
            <button
              type="button"
              onClick={() => setOpenConsent(true)}
              className="underline decoration-emerald-600 underline-offset-2 hover:text-black"
            >
              Ver y aceptar
            </button>.
          </p>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-70"
            >
              {loading ? "Enviando…" : "Continuar"}
            </button>
          </div>
        </form>
      </section>

      {/* Modal de consentimiento */}
      <ConsentModal
        open={openConsent}
        onClose={() => setOpenConsent(false)}
        onConfirm={handleConsentConfirm}
        defaultMarketing={false}
      />
    </main>
  );
}
