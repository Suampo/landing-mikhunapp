// src/components/legal/ConsentCheckbox.jsx
export default function ConsentCheckbox({
  requiredChecked,
  onRequiredChange,
  marketingChecked,
  onMarketingChange,
}) {
  return (
    <div className="mt-6 space-y-3 text-sm text-neutral-700">
      {/* Tratamiento necesario (obligatorio) */}
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={requiredChecked}
          onChange={(e) => onRequiredChange?.(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
          required
        />
        <span>
          Acepto el <strong>Tratamiento Necesario de Datos</strong> para operar el
          servicio (creación de cuenta, pedidos, seguridad). He leído la{" "}
          <a className="underline" href="/legal/privacidad" target="_blank" rel="noreferrer">
            Política de Privacidad
          </a>{" "}
          y el{" "}
          <a className="underline" href="/legal/consentimiento" target="_blank" rel="noreferrer">
            detalle del consentimiento
          </a>
          .
        </span>
      </label>

      {/* Marketing (opcional) */}
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={marketingChecked}
          onChange={(e) => onMarketingChange?.(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
        />
        <span>
          Autorizo recibir <strong>ofertas y novedades</strong> de MenuGo (puedo
          revocar en cualquier momento).    
        </span>
      </label>
    </div>
  );
}
