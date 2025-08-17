export default function BackgroundGlows() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* arriba-izq (grande) */}
      <div className="absolute -top-28 -left-28 h-[520px] w-[520px] rounded-full bg-emerald-400/15 blur-3xl" />
      {/* arriba-der (mediano) */}
      <div className="absolute top-10 -right-24 h-[420px] w-[420px] rounded-full bg-emerald-300/12 blur-3xl" />
      {/* centro-derecha (pequeño) */}
      <div className="absolute top-1/2 right-8 h-[260px] w-[260px] -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      {/* abajo-izq (mediano) */}
      <div className="absolute -bottom-24 -left-24 h-[520px] w-[520px] rounded-full bg-emerald-400/12 blur-3xl" />
      {/* abajo-der (suave) */}
      <div className="absolute -bottom-36 -right-32 h-[600px] w-[600px] rounded-full bg-emerald-400/8 blur-3xl" />
    </div>
  );
}
