export default function Returns() {
  return (
    <main className="py-12">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-2xl font-bold">Cambios y Devoluciones</h1>

        <section className="mt-6 space-y-4 text-sm leading-6 text-neutral-700">
          <p>
            Esta política aplica a la <strong>suscripción del software MenuGo</strong> contratada por el
            restaurante. No regula la venta de comidas/bebidas al comensal (esa relación corresponde al
            restaurante y su propio Libro de Reclamaciones).
          </p>

          <h2 className="mt-6 text-base font-semibold">1. Anulaciones</h2>
          <p>
            Puedes solicitar la anulación antes de la activación del servicio o dentro de las 24 horas
            siguientes al cobro, si no hubo uso efectivo. Escríbenos a [EMAIL SOPORTE].
          </p>

          <h2 className="mt-6 text-base font-semibold">2. Reembolsos</h2>
          <p>
            Mes iniciado no es reembolsable salvo error imputable a MenuGo (cobro duplicado, problema
            técnico que imposibilite el uso y no sea atribuible a terceros). Los reembolsos se procesan
            por el mismo medio de pago.
          </p>

          <h2 className="mt-6 text-base font-semibold">3. Cambios de plan</h2>
          <p>
            Puedes cambiar de plan en cualquier momento; el nuevo plan rige desde el siguiente ciclo de
            facturación, salvo acuerdo distinto.
          </p>

          <h2 className="mt-6 text-base font-semibold">4. Procedimiento</h2>
          <ol className="list-decimal pl-5">
            <li>Envíanos correo con: razón social, RUC, correo de la cuenta y motivo.</li>
            <li>Evaluaremos tu solicitud y te informaremos el resultado.</li>
            <li>Si procede, gestionaremos la anulación/reembolso en un plazo razonable.</li>
          </ol>

          <h2 className="mt-6 text-base font-semibold">5. Ley aplicable</h2>
          <p>
            Se rige por la normativa peruana y el Código de Protección y Defensa del Consumidor (cuando
            corresponda).
          </p>
        </section>
      </div>
    </main>
  );
}
