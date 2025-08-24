// src/services/culqi.js
import {
  apiGetPublicConfig,
  apiPreparePublicOrder,
  apiChargePublicToken,
} from "./api";

/**
 * Crea una instancia de CulqiCheckout con settings adecuados.
 * - Si pasas `order`, habilitamos Yape/Billeteras.
 * - Si no, solo tarjeta (token).
 */
function buildCulqiInstance(publicKey, {
  title,
  currency,
  amount,
  order,                // opcional
  email,                // opcional (prefill)
}) {
  if (!window.CulqiCheckout) {
    throw new Error(
      "Culqi no está cargado. Agrega <script src='https://js.culqi.com/checkout-js'></script> en public/index.html"
    );
  }

  const settings = { title, currency, amount, ...(order ? { order } : {}) };
  const client   = email ? { email } : {};
  const options  = {
    lang: "es",
    installments: true,
    modal: true,
    // Yape/billeteras SOLO si hay order
    paymentMethods: order
      ? { tarjeta: true, yape: true, bancaMovil: true }
      : { tarjeta: true },
  };

  // 👇 La callback `culqi` cuelga de **la instancia**, no de window
  return new window.CulqiCheckout(publicKey, { settings, client, options });
}

/**
 * Abre Culqi para el público (BYO keys por restaurante).
 * Estrategia híbrida: intenta ORDER (Yape/etc) y si no está habilitado → token+charge.
 */
export async function openPublicCheckoutCulqi({
  restaurantId,
  amount,                 // céntimos
  customer,               // { email, fullName?, phone? }
  metadata = {},          // { table_code | mesaId | order_id ... }
  currency = "PEN",
  description = "Pedido",
}) {
  if (!restaurantId) throw new Error("Falta restaurantId");
  if (!amount || !customer?.email) throw new Error("Faltan monto/email");

  // 1) Obtener publicKey del restaurante
  const cfg = await apiGetPublicConfig(restaurantId); // { culqiPublicKey, name }
  const publicKey = cfg.culqiPublicKey;

  // 2) Intentar crear ORDER (abre métodos alternativos)
  try {
    const data = await apiPreparePublicOrder(restaurantId, {
      amount,
      currency,
      email: customer.email,
      description,
      paymentMethods: { tarjeta: true, yape: true, bancaMovil: true },
      metadata,
    });

    if (data?.culqi?.orderId) {
      const inst = buildCulqiInstance(publicKey, {
        title: cfg.name || "Pago",
        currency,
        amount,
        order: data.culqi.orderId,
        email: customer.email,
      });

      return new Promise((resolve, reject) => {
        inst.culqi = function () {
          if (inst.order) {
            resolve({ mode: "order", order: inst.order });
            alert("Procesando pago… gracias por tu pedido.");
          } else if (inst.error) {
            reject(inst.error);
            alert(inst.error?.user_message || "Error en el pago");
          }
        };
        inst.open();
      });
    }

    // Si tu backend devolviera link de pago:
    if (data?.paymentUrl) {
      location.href = data.paymentUrl;
      return;
    }

    // Si no hubo order, cae a token:
    return tokenFallback({
      publicKey, restaurantId, amount, currency, customer, metadata, description,
    });
  } catch (err) {
    // Orders no habilitado → token+charge
    console.warn("[Orders] no disponible → token+charge:", err?.message || err);
    return tokenFallback({
      publicKey, restaurantId, amount, currency, customer, metadata, description,
    });
  }
}

function tokenFallback({
  publicKey,
  restaurantId,
  amount,
  currency,
  customer,
  metadata,
  description,
}) {
  const inst = buildCulqiInstance(publicKey, {
    title: "Pago",
    currency,
    amount,
    email: customer.email,
  });

  return new Promise((resolve, reject) => {
    inst.culqi = async function () {
      try {
        if (inst.token) {
          const tokenId = inst.token.id;
          const out = await apiChargePublicToken(restaurantId, {
            amount,
            currency,
            email: customer.email,
            tokenId,
            description,
            metadata,
          });
          resolve({ mode: "token+charge", result: out });
          alert("Pago en proceso. ¡Gracias!");
        } else if (inst.error) {
          reject(inst.error);
          alert(inst.error?.user_message || "No se pudo procesar el pago");
        }
      } catch (e) {
        reject(e);
        alert("No se pudo completar el pago.");
      }
    };
    inst.open();
  });
}

// (alias opcional si en algún lado importas openCulqiCheckout)
export { openPublicCheckoutCulqi as openCulqiCheckout };
