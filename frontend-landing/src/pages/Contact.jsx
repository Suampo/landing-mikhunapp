export default function Contact() {
  return (
    <main className="relative overflow-hidden">
      {/* blobs verdes */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-400/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -right-48 h-[460px] w-[460px] rounded-full bg-emerald-400/10 blur-3xl" />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Contacto</h1>
        <p className="mt-3 text-lg text-neutral-700">
          Escríbenos a <a className="text-emerald-700 underline" href="mikhunappfood@gmail.com"> mikhunappfood@gmail.com</a> o WhatsApp <span className="font-medium">+51 950 809 208</span>.
        </p>
      </section>
    </main>
  );
}