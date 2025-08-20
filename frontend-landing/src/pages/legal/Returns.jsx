export default function Returns() {
  return (
    <main className="py-12">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-2xl font-bold">Cambios y Devoluciones de la Suscripción (SaaS – Mikhunapp)</h1>

        <section className="mt-6 space-y-4 text-sm leading-6 text-neutral-700">
          <p>
            <strong>Ámbito.</strong> Esta política aplica a la <strong>suscripción del software Mikhunapp</strong> contratada por el Restaurante.
            No regula la venta de comidas/bebidas al comensal (esa relación corresponde al Restaurante y su <strong>Libro de Reclamaciones</strong>).
          </p>

          <p>
            <strong>Definiciones rápidas.</strong><br />
            <strong>Activación del servicio:</strong> habilitación del Tenant y de las credenciales del Panel Admin.<br />
            <strong>Uso efectivo:</strong> acceso al Panel, creación/edición de productos, menús o usuarios, o gestión de pedidos.
          </p>

          <h2 className="mt-6 text-base font-semibold">1. Anulaciones</h2>
          <p>
            Puedes solicitar la <strong>anulación</strong> antes de la <strong>activación</strong> o dentro de <strong>24 horas</strong> posteriores al cobro
            <strong> si no hubo uso efectivo</strong>. Escríbenos a <strong>mikhunappfood@gmail.com</strong>.
          </p>

          <h2 className="mt-6 text-base font-semibold">2. Reembolsos</h2>
          <p>
            El <strong>mes iniciado no es reembolsable</strong>, salvo: (i) <strong>cobro duplicado</strong> o (ii) <strong>falla técnica atribuible a Mikhunapp</strong>
            que <strong>imposibilite el uso</strong> (no por terceros como cloud/ISP/Culqi u otra pasarela de pago) y que <strong>hayas reportado</strong> oportunamente a <strong>mikhunappfood@gmail.com</strong>.
            Los reembolsos aprobados se procesan por el <strong>mismo medio de pago</strong>.
          </p>

          <h2 className="mt-6 text-base font-semibold">3. Cambios de plan</h2>
          <p>
            Puedes solicitar <strong>cambio de plan</strong> en cualquier momento. El nuevo plan <strong>rige desde el siguiente ciclo</strong> de facturación,
            salvo acuerdo distinto por escrito.
          </p>

          <h2 className="mt-6 text-base font-semibold">4. Procedimiento</h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Envía un correo a <strong>mikhunappfood@gmail.com</strong> con: <em>razón social</em>, <em>RUC</em>, <em>correo de la cuenta</em> y <em>motivo</em> (con evidencias si aplica).</li>
            <li><strong>Acuse de recibo:</strong> dentro de <strong>2 días hábiles</strong>.</li>
            <li><strong>Evaluación y respuesta:</strong> hasta <strong>5 días hábiles</strong>.</li>
            <li><strong>Ejecución de anulación/reembolso (si procede):</strong> hasta <strong>10 días hábiles</strong> (el abono depende del emisor del medio de pago).</li>
          </ol>

          <h2 className="mt-6 text-base font-semibold">5. Ley aplicable</h2>
          <p>
            Se rige por la <strong>normativa peruana</strong> y, cuando corresponda, por el <strong>Código de Protección y Defensa del Consumidor</strong>.
          </p>
        </section>
      </div>
    </main>
  );
}
