// src/services/culqi.js
let culqiInstance = null;

export function ensureCulqi(publicKey, config) {
  if (!window.CulqiCheckout) {
    alert("No cargó Culqi JS");
    return null;
  }
  culqiInstance = new window.CulqiCheckout(publicKey, config);
  return culqiInstance;
}

export function openCulqiCheckout({ amount, email, orderId, onToken, onOrder }) {
  const publicKey = import.meta.env.VITE_CULQI_PUBLIC_KEY; // define esto en .env del cliente
  const settings = {
    title: "Mikhunapp",
    currency: "PEN",
    amount,
    order: orderId || undefined, // si pasas order → muestra Yape/otros
  };
  const client = { email };
  const paymentMethods = { tarjeta: true, yape: !!orderId }; // yape solo si hay order
  const options = { lang: "es", installments: true, modal: true, paymentMethods };

  const config = { settings, client, options };
  const instance = ensureCulqi(publicKey, config);
  if (!instance) return;

  window.Culqi.culqi = () => {
    if (window.Culqi.token) {
      const tokenId = window.Culqi.token.id;
      window.Culqi.close();
      onToken?.(tokenId);
    } else if (window.Culqi.order) {
      const order = window.Culqi.order;
      window.Culqi.close();
      onOrder?.(order);
    } else if (window.Culqi.error) {
      console.log("Culqi error:", window.Culqi.error);
    }
  };

  instance.open();
}
