// src/pages/auth/Checkout.jsx
import { useLocation, useNavigate } from "react-router-dom";

export default function Checkout() {
  const { state } = useLocation(); // { form, choices, plan }
  const nav = useNavigate();

  const proceed = () => {
    // Aquí vas a abrir Culqi cuando tengas las llaves.
    alert("Redirigiremos a Culqi cuando actives tus llaves. Por ahora es un placeholder.");
    nav("/"); // o a un /gracias
  };

  const plan = state?.plan || { name: "Básico", price: 300 };

  return (
    <main className="py-12">
      <div className="mx-auto max-w-xl px-4">
        <h1 className="text-2xl font-bold">Pago de suscripción</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Revisa tu pedido antes de continuar al pago.
        </p>

        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Plan {plan.name}</div>
              <div className="text-sm text-neutral-600">Renovación mensual</div>
            </div>
            <div className="text-2xl font-bold">S/ {plan.price}</div>
          </div>

          {state?.form?.restaurant && (
            <div className="mt-4 text-sm">
              <div className="font-semibold">Restaurante</div>
              <div className="text-neutral-700">{state.form.restaurant}</div>
            </div>
          )}

          <button
            onClick={proceed}
            className="mt-6 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Continuar a pago (Culqi)
          </button>
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          Pagos procesados por Culqi u otra pasarela de pago. Emitimos comprobante al correo registrado.
        </p>
      </div>
    </main>
  );
}
