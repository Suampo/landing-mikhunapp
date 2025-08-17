export default function Terms() {
  return (
    <main className="py-12">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-2xl font-bold">Términos y Condiciones</h1>

        <section className="mt-6 space-y-4 text-sm leading-6 text-neutral-700">
          <p>
            <strong>Última actualización:</strong> [dd/mm/aaaa]. Titular del servicio:
            [RAZÓN SOCIAL], RUC [RUC], domicilio en [DIRECCIÓN COMPLETA] (“MenuGo”, “nosotros”).
          </p>

          <h2 className="mt-6 text-base font-semibold">1. Objeto</h2>
          <p>
            MenuGo es una plataforma SaaS para restaurantes que permite menú digital, pedidos por
            QR, pagos en línea y comanda automática. Estos Términos regulan el uso del sitio
            [DOMINIO] y subdominios (p. ej. [restaurante].menugo.app) y del Panel Admin por parte
            de restaurantes y comensales.
          </p>

          <h2 className="mt-6 text-base font-semibold">2. Aceptación</h2>
          <p>
            Al usar el sitio, crear una cuenta o escanear un QR, aceptas estos Términos y nuestra
            Política de Privacidad.
          </p>

          <h2 className="mt-6 text-base font-semibold">3. Cuentas y restaurantes (multi-tenant)</h2>
          <p>
            Cada restaurante tiene su propio espacio (tenant). El titular del restaurante es responsable
            de la veracidad de su información y del contenido que publique (precios, fotos, combos)
            y de los usuarios a los que dé acceso. Prohibido compartir credenciales o usar el servicio
            para fines ilícitos.
          </p>

          <h2 className="mt-6 text-base font-semibold">4. Pedidos y pagos</h2>
          <p>
            Los pedidos se generan desde el menú digital y se reflejan en panel/cocina en tiempo real.
            Los pagos en línea se procesan mediante Culqi; los datos de pago se tratan bajo sus políticas.
            La emisión de comprobantes del consumo y cambios/devoluciones corresponden al restaurante.
          </p>

          <h2 className="mt-6 text-base font-semibold">5. Planes, precios y facturación</h2>
          <p>
            Plan: [Básico/Premium]. Precio: S/ [99/199/250] mensuales (definir IGV). La suscripción
            se renueva automáticamente hasta su cancelación desde el Panel o por escrito a
            [EMAIL SOPORTE]. Mes iniciado no reembolsable salvo error imputable a MenuGo o norma aplicable.
          </p>

          <h2 className="mt-6 text-base font-semibold">6. Disponibilidad del servicio</h2>
          <p>
            Buscamos alta disponibilidad. Pueden existir mantenimientos o fallas ajenas a nuestro control
            (cloud, Internet, Culqi). Adoptamos medidas razonables de continuidad y seguridad.
          </p>

          <h2 className="mt-6 text-base font-semibold">7. Contenidos e IP</h2>
          <p>
            El software, marca y diseños de MenuGo son de [RAZÓN SOCIAL]. El restaurante es titular
            del contenido que sube y nos otorga licencia de uso para operar la plataforma.
          </p>

          <h2 className="mt-6 text-base font-semibold">8. Uso prohibido</h2>
          <ul className="list-disc pl-5">
            <li>Vulnerar seguridad del sistema.</li>
            <li>Descompilar o derivar código.</li>
            <li>Usar la plataforma para actividades ilícitas o engañosas.</li>
          </ul>

          <h2 className="mt-6 text-base font-semibold">9. Datos personales</h2>
          <p>
            Tratamos datos conforme a la Ley N.° 29733 y su Reglamento. Revisa la{" "}
            <a className="underline" href="/legal/privacidad">Política de Privacidad</a>.
          </p>

          <h2 className="mt-6 text-base font-semibold">10. Consumidor y reclamos</h2>
          <p>
            Para comensales aplica el Código de Protección y Defensa del Consumidor (Ley N.° 29571).
            Contamos con Libro de Reclamaciones (virtual/presencial) conforme a norma peruana.
          </p>

          <h2 className="mt-6 text-base font-semibold">11. Limitación de responsabilidad</h2>
          <p>
            MenuGo provee un servicio tecnológico. No somos responsables por calidad de platos, tiempos,
            stock o decisiones comerciales del restaurante.
          </p>

          <h2 className="mt-6 text-base font-semibold">12. Modificaciones</h2>
          <p>Podemos actualizar estos Términos publicando la nueva fecha de vigencia.</p>

          <h2 className="mt-6 text-base font-semibold">13. Ley aplicable y jurisdicción</h2>
          <p>Se rigen por las leyes del Perú. Competencia: [Juzgados de Lima/ciudad].</p>

          <p className="mt-6">
            <strong>Contacto:</strong> [EMAIL SOPORTE] · [WHATSAPP/TEL]
          </p>
        </section>
      </div>
    </main>
  );
}
