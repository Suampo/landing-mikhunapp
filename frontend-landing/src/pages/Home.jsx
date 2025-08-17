export default function Home() {
  // Pon tus PNG en /public/services
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
    ["Seguridad", "Aislamiento por restaurante, JWT y backups."],
    ["Reportes", "Ventas, tickets y métricas (export CSV)."],
  ];

  const faqs = [
    { q: "¿Cómo se activa la comanda impresa?", a: "Instalamos un servicio en tu Raspberry Pi conectada a la impresora térmica. Desde el panel eliges qué estados imprimen y con qué plantilla." },
    { q: "¿Puedo usar mi propia pasarela Culqi?", a: "Sí. Cada restaurante puede usar sus llaves de prueba/producción. Soportamos orden/charge y conciliación por webhooks." },
    { q: "¿Necesito SSL o dominio?", a: "Te damos un subdominio *.menugo.app con SSL gratis. Si prefieres tu dominio propio, también te ayudamos a configurarlo." },
    { q: "¿Cómo se cobra el servicio?", a: "Plan Básico con todo incluido (mensual o anual con descuento). Add-ons opcionales bajo demanda." },
  ];

  const card = "rounded-2xl bg-white/90 backdrop-blur border border-neutral-200/70 shadow-sm hover:shadow-md transition";

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-neutral-50">
        <div className="pointer-events-none absolute -top-36 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              SaaS para restaurantes
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Pedidos por QR, pago online y comanda automática
            </h1>
            <p className="mt-4 text-neutral-600">
              Reduce tiempos, evita errores y aumenta la rotación de mesas. MenuGo es un
              sistema multi-restaurante listo para operación con seguridad y soporte.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              
              <a href="#services" className="rounded-xl bg-emerald-600 px-5 py-3 text-white shadow-sm transition hover:bg-emerald-500">
                Ver servicios
              </a>
              <a href="/registro" className="rounded-xl border border-neutral-200 px-5 py-3 font-medium transition hover:bg-white">
                Crear cuenta
              </a>
            </div>

            <ul className="mt-6 grid gap-2 text-sm text-neutral-700">
              <li>✅ Multi-tenant por restaurante</li>
              <li>✅ QRs por mesa y estados de pedido</li>
              <li>✅ Integración con Culqi (tarjeta/Yape)</li>
              <li>✅ Conexion de impresora térmica con el Sistema</li>
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-neutral-600">
              <span className="rounded-full border border-neutral-200 px-3 py-1">Cifrado TLS/SSL</span>
              <span className="rounded-full border border-neutral-200 px-3 py-1">Soporte 24/7</span>
              <span className="rounded-full border border-neutral-200 px-3 py-1">Backups automáticos</span>
            </div>
          </div>

          {/* Media card con video o imagen (fallback) */}
          <div className={card + " p-4"}>
            <div className="aspect-video overflow-hidden rounded-xl bg-neutral-100">
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
              {[
                ["Mesas atendidas", "+10k"],
                ["Pedidos procesados", "+120k"],
                ["Tiempo/mesa", "-18%"],
              ].map(([kpi, val]) => (
                <div key={kpi} className="rounded-lg bg-neutral-50 border border-neutral-200/70 p-3">
                  <dt className="text-xs text-neutral-500">{kpi}</dt>
                  <dd className="text-lg font-semibold">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* HOW, SERVICES, FEATURES, PRICES, FAQ, CTA … (sin cambios de estructura) */}
      {/* ... (tu contenido tal como lo tenías, usa el mismo 'card' para estilo) ... */}
      
      {/* HOW */}
      <section id="how" className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">Cómo funciona</h2>
          
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              ["Escanea el QR", "El cliente escanea el QR de la mesa."],
              ["Arma el pedido", "Elige platos y combos en el menú digital."],
              ["Paga online", "Culqi: tarjeta/Yape (webhooks & conciliación)."],
              ["Comanda automática", "Se imprime en cocina y actualiza el panel."],
            ].map(([title, desc]) => (
              <div key={title} className={card + " p-4"}>
                <div className="font-semibold">{title}</div>
                <p className="mt-1 text-sm text-neutral-600">{desc}</p>
              </div>
              
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-14">
        
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold">Nuestros servicios</h2>
            <a href="/r/demo" className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50">
              Ver demo
            </a>
          </div>
          <p className="mt-2 text-sm text-neutral-600">
            Todo lo que necesitas: panel de administración, gestión de mesas y QRs, menú digital/combos y panel de cocina en tiempo real.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <figure key={s.title} className={card + " overflow-hidden group"}>
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

      {/* FUNCIONES */}
      <section id="features" className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">Funciones clave</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([title, desc]) => (
              <div key={title} className={card + " p-4"}>
                <div className="font-semibold">{title}</div>
                <p className="mt-1 text-sm text-neutral-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

     {/* PRICING */}
<section id="prices" className="py-14">
  <div className="mx-auto max-w-6xl px-4">
    <h2 className="text-2xl font-bold">Planes y precios</h2>

    <div className="mt-6 grid gap-6 md:grid-cols-2">
      {/* Básico */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="text-lg font-semibold">Básico</div>
        <div className="text-sm text-neutral-600">
          Incluye todo para operar desde el día 1
        </div>

        <div className="mt-3 flex items-end gap-2">
          <div className="text-4xl font-bold">S/ 250</div>
          <div className="pb-1 text-neutral-500">/ mes</div>
        </div>

        <ul className="mt-5 space-y-2 text-sm text-neutral-800">
          <li>• Menú digital, categorías y fotos</li>
          <li>• QRs por mesa y estados de pedido</li>
          <li>• Panel de cocina en tiempo real</li>
          <li>• Comanda térmica (Raspberry) incluida</li>
          <li>• Pagos con Culqi (test/producción)</li>
          
          <li>• Soporte estándar 7/7</li>
        </ul>

        {/* Promo (opcional) */}
        <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span className="font-semibold">Digitaliza tu restaurante </span>{" "}
          desde <strong>S/ 250</strong> al mes, sin complicaciones.
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/registro"
            className="rounded-xl bg-neutral-900 px-5 py-3 text-white hover:bg-neutral-800"
          >
            Empezar
          </a>
          
        </div>
      </div>

      {/* Premium (próximamente) */}
      <div className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="absolute right-4 top-4 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          Próximamente
        </div>

        <div className="text-lg font-semibold">Premium</div>
        <div className="text-sm text-neutral-600">Cadenas y operaciones avanzadas</div>

        <div className="mt-3 flex items-end gap-2">
          <div className="text-4xl font-bold">S/ —</div>
        </div>

        <ul className="mt-5 space-y-2 text-sm text-neutral-800">
          <li>• Proximamente tendremos mas noticias sobre el plan Premium , agradecemos su paciencia</li>
        { /* <li>• Todo lo del Básico</li>
          <li>• Multi-sede y roles avanzados</li>
          <li>• Métricas avanzadas y API</li>
          <li>• SLA y soporte prioritario</li> */}
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
</section>
      {/* FAQ */}
      <section id="faq" className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">Preguntas frecuentes</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q} className={card + " p-4"}>
                <div className="font-semibold">{f.q}</div>
                <p className="mt-1 text-sm text-neutral-600">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-200 bg-gradient-to-br from-neutral-50 to-white py-14">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h3 className="text-xl font-bold">¿Listo para modernizar tu operación?</h3>
          <p className="mt-2 text-neutral-600">
            Te ayudamos con el onboarding (SSL, QR, impresora y pagos) Contactanos.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
          
            <a href="/contacto" className="rounded-xl border border-neutral-200 bg-white px-5 py-3 font-medium transition hover:bg-neutral-50">
              Hablar con ventas
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
