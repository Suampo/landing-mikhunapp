export default function Privacy() {
  return (
    <main className="py-12">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-2xl font-bold">Política de Privacidad</h1>

        <section className="mt-6 space-y-4 text-sm leading-6 text-neutral-700">
          <p>
            Titular del banco de datos: [RAZÓN SOCIAL], RUC [RUC], [DIRECCIÓN]. Correo de privacidad:
            [EMAIL PRIVACIDAD].
          </p>

          <h2 className="mt-6 text-base font-semibold">1. Finalidades y bases legales</h2>
          <p>
            Tratamos datos de restaurantes (contacto, facturación, usuarios del panel) y de comensales
            (pedido, mesa, preferencia, estado y datos transaccionales no sensibles). Finalidades:
            (i) operar el servicio (ejecución contractual), (ii) seguridad/fraude (interés legítimo),
            (iii) facturación y cumplimiento (obligación legal), (iv) comunicaciones operativas y —si lo
            autorizas— marketing (consentimiento).
          </p>

          <h2 className="mt-6 text-base font-semibold">2. Datos que tratamos</h2>
          <p>
            Identificación y contacto, cuenta/tenant, logs de uso, pedidos por mesa, totales de venta e
            información para conciliación de pagos.
          </p>

          <h2 className="mt-6 text-base font-semibold">3. Pagos</h2>
          <p>
            Para pagos con tarjeta o Yape usamos Culqi. Culqi procesa los datos de tarjeta; MenuGo no
            almacena los números.
          </p>

          <h2 className="mt-6 text-base font-semibold">4. Encargados y transferencias</h2>
          <p>
            Usamos proveedores (cloud, correo, monitoreo). Podrían existir transferencias internacionales
            con garantías adecuadas.
          </p>

          <h2 className="mt-6 text-base font-semibold">5. Conservación</h2>
          <p>Conservamos datos mientras dure la relación y por plazos legales de prescripción.</p>

          <h2 className="mt-6 text-base font-semibold">6. Derechos ARCO</h2>
          <p>
            Puedes acceder, rectificar, cancelar u oponerte al tratamiento; y revocar consentimiento de
            marketing escribiendo a [EMAIL PRIVACIDAD]. También puedes acudir a la Autoridad Nacional de
            Protección de Datos Personales (MINJUSDH).
          </p>

          <h2 className="mt-6 text-base font-semibold">7. Seguridad</h2>
          <p>Aplicamos medidas técnicas y organizativas razonables (accesos, cifrado en tránsito, backups).</p>

          <h2 className="mt-6 text-base font-semibold">8. Menores</h2>
          <p>
            El menú digital es para público general; el panel admin para mayores de 18. Si detectamos
            datos de menores sin autorización, los eliminaremos.
          </p>

          <h2 className="mt-6 text-base font-semibold">9. Cookies</h2>
          <p>Usamos cookies necesarias y —si lo aceptas— analíticas. Puedes gestionarlas en tu navegador.</p>

          <h2 className="mt-6 text-base font-semibold">10. Banco de datos y registro</h2>
          <p>
            El banco de datos [NOMBRE] puede estar inscrito ante el RNPDP; consigna el Nº cuando lo tengas.
          </p>
        </section>
      </div>
    </main>
  );
}
