import { useEffect, useState } from "react";

export default function Home() {
  // ---- DATA ----
  const services = [
    { title: "Panel de inicio (Admin)", desc: "Resumen operativo: ventas del día, pedidos activos, producto más vendido y curva de últimos 7 días.", img: "/services/01-dashboard.png", alt: "Panel admin" },
    { title: "Mesas y QRs", desc: "Crea/edita mesas, genera un QR por mesa en un clic y mantén todo ordenado con búsqueda.", img: "/services/02-mesas.png", alt: "Mesas y QR" },
    { title: "Menú (Administrador)", desc: "Gestiona categorías, precios, fotos y disponibilidad. Crea combos y define sus componentes.", img: "/services/03-menu-admin.png", alt: "Menú admin" },
    { title: "Pedidos en vivo (Cocina)", desc: "Panel de cocina/KDS con estados en tiempo real. Compatible con comanda impresa.", img: "/services/04-pedidos-cocina.png", alt: "Cocina KDS" },
    { title: "Menú Digital — Fondos", desc: "Catálogo de platos de fondo, fotos grandes y botón de agregar. Optimizado para móvil.", img: "/services/05-menu-fondos.png", alt: "Fondos" },
    { title: "Menú Digital — Entradas", desc: "Sección de entradas con imágenes, descripción breve y precio visible.", img: "/services/06-menu-entradas.png", alt: "Entradas" },
    { title: "Menú Digital — Extras", desc: "Agrega extras y adicionales. Todo configurable desde el panel admin.", img: "/services/07-menu-extras.png", alt: "Extras" },
    { title: "Combos (card)", desc: "Crea combos del día (ej. Menú S/ 12). Define precio y categorías permitidas.", img: "/services/08-combos-card.png", alt: "Combos card" },
    { title: "Combo: elige entrada", desc: "El cliente elige una (1) entrada de entre las permitidas para el combo.", img: "/services/09-combo-elige-entrada.png", alt: "Elegir entrada" },
    { title: "Combo: elige plato", desc: "Luego elige un (1) plato de fondo. Reglas de selección y stock desde el admin.", img: "/services/10-combo-elige-plato.png", alt: "Elegir plato" },
  ];

  const features = [
    ["Panel admin", "Gestión de categorías, productos, combos e imágenes."],
    ["Mesas y QRs", "Códigos por mesa, estados de pedido, QR listo para imprimir."],
    ["Pagos", "Culqi (tarjeta/Yape), idempotencia y webhooks."],
    ["Cocina en tiempo real", "Socket.IO y comanda térmica con cola/ACK en Raspberry."],
    ["Seguridad", "Aislamiento por restaurante (segregación lógica), JWT."],
    ["Reportes", "Ventas, tickets y métricas (exportación bajo solicitud)."],
  ];

  const faqs = [
    { q: "¿Cómo se activa la comanda impresa?", a: "Instalamos un servicio en tu Raspberry Pi conectada a la impresora térmica. Desde el panel eliges qué estados imprimen y con qué plantilla." },
    { q: "¿Puedo usar mi propia pasarela Culqi?", a: "Sí. Cada restaurante puede usar sus llaves de prueba/producción. Soportamos orden/charge y conciliación por webhooks." },
    { q: "¿Necesito SSL o dominio?", a: "Te damos un subdominio *.mikhunapp.com con SSL gratis. Si prefieres tu dominio propio, también te ayudamos a configurarlo." },
    { q: "¿Cómo se cobra el servicio?", a: "Plan Básico con todo incluido (mensual o anual con descuento). Add-ons opcionales bajo demanda." },
  ];

  // KPI counter
  function Counter({ to, duration = 1.2, prefix = "", suffix = "" }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
      const startTime = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - startTime) / (duration * 1000));
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(to * eased));
        if (p < 1) requestAnimationFrame(step);
      };
      const raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    }, [to, duration]);
    return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
  }

  const card =
    "rounded-2xl bg-white/90 backdrop-blur border border-neutral-200/70 shadow-sm hover:shadow-md transition";

  return (
    <main className="relative overflow-x-hidden">
      {/* Keyframes + decor global */}
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
      `}</style>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[620px] w-[620px] rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-teal-300/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(#e5e7eb 1px, transparent 1px), radial-gradient(#e5e7eb 1px, transparent 1px)",
            backgroundPosition: "0 0, 8px 8px",
            backgroundSize: "16px 16px",
            maskImage:
              "linear-gradient(180deg, transparent, black 8%, black 92%, transparent)",
          }}
        />
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 md:grid-cols-[1.05fr_1fr] md:py-20">
          {/* Copy */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              SaaS para restaurantes
            </p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Pedidos por QR, pago online y comanda automática
            </h1>
            <p className="mt-4 max-w-xl text-neutral-700">
              Reduce tiempos, evita errores y aumenta la rotación de mesas. Mikhunapp es un
              sistema multi-restaurante listo para operación con seguridad y soporte.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#services" className="rounded-xl bg-emerald-600 px-5 py-3 text-white shadow-sm transition hover:bg-emerald-500">
                Ver servicios
              </a>
              <a href="/registro" className="rounded-xl border border-neutral-200 bg-white px-5 py-3 font-medium transition hover:bg-neutral-50">
                Crear cuenta
              </a>
            </div>

            {/* Bullets */}
            <ul className="mt-6 grid gap-2 text-sm text-neutral-800">
              {[
                "Multi-tenant por restaurante",
                "QRs por mesa y estados de pedido",
                "Integración con Culqi (tarjeta/Yape)",
                "Conexión de impresora térmica",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="text-emerald-600">✔️</span> {t}
                </li>
              ))}
            </ul>

            {/* Chips (sin prometer backups) */}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-neutral-700">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">Cifrado TLS/SSL</span>
              <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1">Multi-tenant (segregación lógica)</span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">Pagos con Culqi</span>
              <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1">Exportación bajo solicitud</span>
            </div>
          </div>

          {/* Media card */}
          <div className={card + " p-4"}>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-neutral-100">
              <div className="pointer-events-none absolute inset-0 -z-10 animate-[float_6s_ease-in-out_infinite] bg-[radial-gradient(45%_45%_at_70%_30%,rgba(16,185,129,0.12),transparent_60%)]" />
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                className="h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                poster="/services/01-dashboard.png"
                onError={(e) => {
                  e.currentTarget.outerHTML =
                    '<img src="/services/01-dashboard.png" alt="Panel" class="h-full w-full object-cover"/>';
                }}
              >
                <source src="/assets/hero.mp4" type="video/mp4" />
              </video>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-emerald-50/80 border border-emerald-200 p-3">
                <dt className="text-xs text-emerald-700">Mesas atendidas</dt>
                <dd className="text-lg font-semibold text-emerald-900">+<Counter to={10000} /></dd>
              </div>
              <div className="rounded-lg bg-emerald-50/80 border border-emerald-200 p-3">
                <dt className="text-xs text-emerald-700">Pedidos procesados</dt>
                <dd className="text-lg font-semibold text-emerald-900">+<Counter to={120000} /></dd>
              </div>
              <div className="rounded-lg bg-emerald-50/80 border border-emerald-200 p-3">
                <dt className="text-xs text-emerald-700">Tiempo/mesa</dt>
                <dd className="text-lg font-semibold text-emerald-900">-<Counter to={18} suffix="%" /></dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Marquee de integraciones */}
        <div className="mx-auto max-w-6xl px-4 pb-8">
          <div className="overflow-hidden rounded-xl border border-neutral-200/70 bg-white/80 backdrop-blur">
            <div className="flex whitespace-nowrap [animation:marquee_22s_linear_infinite]">
              {"Culqi · Impresora térmica · Socket.IO · SSL · Idempotencia · Webhooks · Raspberry".split(" · ").map((v, i) => (
                <div key={i} className="px-6 py-3 text-xs text-neutral-600">{v}</div>
              ))}
              {"Culqi · Impresora térmica · Socket.IO · SSL · Idempotencia · Webhooks · Raspberry".split(" · ").map((v, i) => (
                <div key={"b"+i} className="px-6 py-3 text-xs text-neutral-600">{v}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="relative py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40" />
        <div className="mx-auto max-w-6xl px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">✨ Pasos</div>
          <h2 className="mt-3 text-2xl font-bold">Cómo funciona</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              ["Escanea el QR", "El cliente escanea el QR de la mesa."],
              ["Arma el pedido", "Elige platos y combos en el menú digital."],
              ["Paga online", "Culqi: tarjeta/Yape (webhooks & conciliación)."],
              ["Comanda automática", "Se imprime en cocina y actualiza el panel."],
            ].map(([title, desc]) => (
              <div key={title} className={card + " p-4 bg-white/95"}>
                <div className="font-semibold">{title}</div>
                <p className="mt-1 text-sm text-neutral-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
{/* SERVICES */}
<section id="services" className="relative py-16 overflow-hidden">
  {/* Fondo seguro, centrado y recortado dentro de la sección */}
  <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
    <div className="absolute left-1/2 top-0 h-full w-[140%] -translate-x-1/2 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/40" />
  </div>

  <div className="mx-auto max-w-6xl px-4">
    <div className="flex items-end justify-between">
      <h2 className="text-2xl font-bold">Nuestros servicios</h2>
    </div>
    <p className="mt-2 text-sm text-neutral-600">
      Todo lo que necesitas: panel de administración, gestión de mesas y QRs, menú digital/combos y panel de cocina en tiempo real.
    </p>

    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => (
        <figure key={s.title} className={card + " overflow-hidden group bg-white/95"}>
          <img
            src={s.img}
            alt={s.alt}
            className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <figcaption className="p-4">
            <div className="font-semibold">{s.title}</div>
            <p className="mt-1 text-sm text-neutral-600">{s.desc}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  </div>
</section>
      {/* FEATURES */}
      <section id="features" className="relative py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-neutral-50 via-white to-emerald-50/40" />
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">Funciones clave</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([title, desc]) => (
              <div key={title} className={card + " p-4 bg-white/95"}>
                <div className="font-semibold">{title}</div>
                <p className="mt-1 text-sm text-neutral-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING (ajustado: items-start, h-full y gradiente suave) */}
      <section id="prices" className="relative py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.10),transparent_60%)]" />
        </div>

        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">Planes y precios</h2>

          {/* 👇 evita estirar columnas */}
          <div className="mt-6 grid gap-6 md:grid-cols-2 items-start">
            {/* Básico */}
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-emerald-300/50 via-emerald-400/50 to-teal-400/50">
              {/* 👇 el blanco llena la altura */}
              <div className="h-full rounded-3xl bg-white p-6">
                <div className="text-lg font-semibold">Básico</div>
                <div className="text-sm text-neutral-600">Incluye todo para operar desde el día 1</div>

                <div className="mt-3 flex items-end gap-2">
                  <div className="text-4xl font-bold text-emerald-700">S/ 300</div>
                  <div className="pb-1 text-neutral-500">/ mes</div>
                </div>

                <ul className="mt-5 space-y-2 text-sm text-neutral-800">
                  <li>• Menú digital, categorías y fotos</li>
                  <li>• QRs por mesa y estados de pedido</li>
                  <li>• Panel de cocina en tiempo real</li>
                  <li>• Comanda térmica (Raspberry) incluida</li>
                  <li>• Pagos con Culqi u otra pasarela (test/producción)</li>
                  <li>• Soporte estándar L–V</li>
                </ul>

                <div className="mt-6 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 text-sm text-emerald-800">
                  <span className="font-semibold">Digitaliza tu restaurante </span>
                  desde <strong>S/ 300</strong> al mes, sin complicaciones.
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="/registro" className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-white hover:bg-neutral-800">
                    Empezar <span aria-hidden>→</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Premium */}
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-emerald-300/50 via-emerald-400/50 to-teal-400/50">
              <div className="h-full relative rounded-3xl bg-white p-6">
                <div className="absolute right-5 top-5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Próximamente</div>
                <div className="text-lg font-semibold">Premium</div>
                <div className="text-sm text-neutral-600">Cadenas y operaciones avanzadas</div>

                <div className="mt-3 flex items-end gap-2">
                  <div className="text-4xl font-bold text-neutral-800">S/ —</div>
                </div>

                <ul className="mt-5 space-y-2 text-sm text-neutral-800">
                  <li>• Próximamente más noticias sobre el plan Premium</li>
                </ul>

                <p className="mt-6 text-sm text-neutral-600">
                  ¿Te interesa? Marca la opción <em>“Avísenme del Plan Premium”</em> en el consentimiento
                  o <a href="/contacto" className="underline">escríbenos</a>.
                </p>

                <button
                  type="button"
                  disabled
                  className="mt-4 cursor-not-allowed rounded-xl border px-5 py-3 text-neutral-500"
                  title="Muy pronto"
                >
                  Elegir Premium
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="relative py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-tr from-neutral-50 to-white" />
        <div className="mx-auto max-w-6xl px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">✨ Casos</div>
          <h2 className="mt-3 text-2xl font-bold">Lo que dicen nuestros clientes</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {[
              { name: "Parrillas Don Lucho", text: "Implementamos QR por mesa y pago con Yape. Disminuyeron los errores de comanda y ganamos rotación." },
              { name: "Cevichería La Marina", text: "El panel de cocina en tiempo real nos ordenó la salida. La conciliación con Culqi fue directa." },
            ].map((t) => (
              <blockquote key={t.name} className={card + " p-4 bg-white/95"}>
                <p className="text-neutral-700">“{t.text}”</p>
                <footer className="mt-3 text-sm text-neutral-500">— {t.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 opacity-[0.16] bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
        <div className="mx-auto max-w-6xl px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">✨ Ayuda</div>
          <h2 className="mt-3 text-2xl font-bold">Preguntas frecuentes</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqs.map((f) => (
              <details key={f.q} className={card + " p-4 bg-white/95 open:shadow-md"}>
                <summary className="cursor-pointer list-none font-semibold">{f.q}</summary>
                <p className="mt-2 text-sm text-neutral-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final con fondo visible y alto contraste */}
      <section className="relative isolate border-t border-neutral-200 py-16 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500">
        <div className="mx-auto max-w-6xl px-4 text-center text-white">
          <h3 className="text-xl font-bold">¿Listo para modernizar tu operación?</h3>
          <p className="mt-2 text-white/90">
            Te ayudamos con el onboarding (SSL, QR, impresora y pagos).{" "}
            <a href="/contacto" className="underline">Contáctanos</a>.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <a
              href="/registro"
              className="rounded-xl bg-white px-5 py-3 font-medium text-emerald-700 hover:bg-emerald-50"
            >
              Crear cuenta
            </a>
            <a
              href="/contacto"
              className="rounded-xl border border-white/70 bg-transparent px-5 py-3 font-medium hover:bg-white/10"
            >
              Hablar con ventas
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
