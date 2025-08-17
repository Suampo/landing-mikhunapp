// src/App.jsx (cliente)
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import ProductCard from "./components/ProductCard";
import CartBar from "./components/CartBar";
import CartSheet from "./components/CartSheet";
import ComboCard from "./components/ComboCard";
import ComboSheet from "./components/ComboSheet";
import { openCulqiCheckout } from "./services/culqi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
  <rect width="100%" height="100%" fill="#e5e7eb"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="18" fill="#6b7280">
    Sin imagen
  </text>
</svg>
`);

export const absolute = (url) =>
  url?.startsWith?.("http") ? url : (url ? `${API_BASE}${url}` : "");

const PEN = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});
export const formatPEN = (v) => {
  try { return PEN.format(Number(v || 0)); }
  catch { return `S/ ${Number(v || 0).toFixed(2)}`; }
};

// helpers
const toItemsPayload = (cart) =>
  cart.map((i) =>
    i.isCombo
      ? { comboId: i.comboId, entradaId: i.entrada.id, platoId: i.plato.id, cantidad: i.cantidad }
      : { id: i.id, cantidad: i.cantidad }
  );

const genIdem = () =>
  (crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(16).slice(2)}`);

export default function App() {
  const [menu, setMenu] = useState([]);
  const [combos, setCombos] = useState([]);
  const [cart, setCart] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openCombo, setOpenCombo] = useState(null); // { combo }

  const { mesaId, restaurantId, mesaCode } = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      mesaId: Number(p.get("mesaId") || 1),
      restaurantId: Number(p.get("restaurantId") || 1),
      mesaCode: p.get("mesaCode") || null,
    };
  }, []);

  const fetchMenuPublic = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${API_BASE}/api/menu/public?restaurantId=${restaurantId}`
      );
      setMenu(Array.isArray(data?.categories) ? data.categories : []);
      setCombos(Array.isArray(data?.combos) ? data.combos : []);
    } catch (err) {
      console.error("❌ Error cargando menú público:", err.message);
      setMenu([]); setCombos([]);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { fetchMenuPublic(); }, [fetchMenuPublic]);
  const autoLogin = useCallback(async () => {
  try {
    let token = localStorage.getItem("token");

    // Validar token antes de usarlo
    if (token) {
      try {
        await axios.get(`${API_BASE}/api/auth/validate-token`, { // endpoint opcional
          headers: { Authorization: `Bearer ${token}` },
        });
        return token; // token válido
      } catch {
        localStorage.removeItem("token"); // token inválido, lo eliminamos
        token = null;
      }
    }

    // Si no hay token o estaba inválido, pedimos uno nuevo
    const { data } = await axios.post(`${API_BASE}/api/auth/login-cliente`, { restaurantId });
    token = data.token;
    localStorage.setItem("token", token);
    return token;

  } catch (err) {
    console.error("❌ autoLogin falló:", err.response?.data || err.message);
    throw new Error("No se pudo autenticar al cliente");
  }
}, [restaurantId]);
// === Pago simulado (sin Culqi) => usa /api/dev/simular-pago que EMITE al KDS ===
 const simulatePay = useCallback(async () => {
  try {
    if (!cart.length) {
      alert("Tu carrito está vacío.");
      return;
    }

    const token = await autoLogin();
    const headers = { Authorization: `Bearer ${token}` };
    const idempotencyKey = genIdem();
    const items = toItemsPayload(cart);

    // 1) Crear/reutilizar pedido
    let pedidoId;
    try {
      const res = await axios.post(
        `${API_BASE}/api/pedidos`,
        { mesaId, items, idempotencyKey },
        { headers }
      );
      pedidoId = res.data.pedidoId;
    } catch (e) {
      if (e?.response?.status === 409 && e?.response?.data?.pedidoId) {
        pedidoId = e.response.data.pedidoId;
      } else {
        throw e;
      }
    }

    
    // 2) Simular pago en backend (marca pagado + EMITE a cocina)
     //    Requiere que hayas montado /api/dev/simular-pago en el backend.
     await fetch(`${API_BASE}/api/dev/simular-pago`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ pedidoId }),
     }).then(r => {
       if (!r.ok) throw new Error(`HTTP ${r.status}`);
       return r.json();
     });

    setMensaje(`✅ Pago simulado para el pedido #${pedidoId}`);
    setCart([]);
    setOpenCart(false);

    // 3) Simular impresión de comanda
    console.log("🔹 Simulación de envío a impresora: ", items);

    setTimeout(() => setMensaje(""), 5000);
  } catch (err) {
    console.error("Error simulando pago:", err.response?.data || err.message);
    alert("❌ No se pudo simular el pago.");
  }
}, [cart, mesaId, autoLogin]);
  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const found = prev.find((i) => !i.isCombo && i.id === item.id);
      return found
        ? prev.map((i) => (i === found ? { ...i, cantidad: i.cantidad + 1 } : i))
        : [...prev, { ...item, cantidad: 1 }];
    });
  }, []);

  const addComboToCart = useCallback((combo, entrada, plato) => {
    setCart((prev) => [
      ...prev,
      { isCombo: true, comboId: combo.id, nombreCombo: combo.nombre, precio: combo.precio, entrada, plato, cantidad: 1 },
    ]);
    setOpenCombo(null);
  }, []);

  const addAt = useCallback((index) => {
    setCart((prev) => prev.map((i, idx) => (idx === index ? { ...i, cantidad: i.cantidad + 1 } : i)));
  }, []);
  const removeAt = useCallback((index) => {
    setCart((prev) =>
      prev.map((i, idx) => (idx === index ? { ...i, cantidad: i.cantidad - 1 } : i)).filter((i) => i.cantidad > 0)
    );
  }, []);

  const total = useMemo(
    () => cart.reduce((sum, it) => sum + Number(it.precio || 0) * it.cantidad, 0),
    [cart]
  );
  const itemCount = useMemo(() => cart.reduce((a, i) => a + i.cantidad, 0), [cart]);

  // === Enviar pedido sin pagar (con idempotencyKey) ===
  const sendOrder = useCallback(async () => {
    try {
      const token = await autoLogin();
      const idempotencyKey = genIdem();
      const items = toItemsPayload(cart);

      const { data } = await axios.post(
        `${API_BASE}/api/pedidos`,
        { mesaId, items, idempotencyKey },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensaje(`✅ Pedido #${data.pedidoId} enviado con éxito`);
      setCart([]); setOpenCart(false);
      setTimeout(() => setMensaje(""), 5000);
    } catch (error) {
      // Maneja 409 (mesa ya tiene pedido abierto)
      if (error?.response?.status === 409 && error?.response?.data?.pedidoId) {
        setMensaje(`⚠️ La mesa ya tiene un pedido abierto (#${error.response.data.pedidoId})`);
        setTimeout(() => setMensaje(""), 5000);
        return;
      }
      console.error("❌ Error enviando pedido:", error.response?.data || error.message);
    }
  }, [autoLogin, cart, mesaId]);

  // === Pago con Culqi (crea/reutiliza pedido + order/charge) ===
  const handlePay = useCallback(async () => {
    try {
      const amountPreview = Math.round(total * 100);
      if (!amountPreview || amountPreview <= 0) {
        alert("Tu carrito está vacío.");
        return;
      }
      const email = "cliente@menugo.app"; // o el email real del cliente
      const token = await autoLogin();
      const headers = { Authorization: `Bearer ${token}` };

      // 1) Crea/reutiliza pedido (manejo de 409)
      const idempotencyKey = genIdem();
      const items = toItemsPayload(cart);

      let pedidoId, totalServer;
      try {
        const r = await axios.post(
          `${API_BASE}/api/pedidos`,
          { mesaId, items, idempotencyKey },
          { headers }
        );
        pedidoId = r.data?.pedidoId;
        totalServer = Number(r.data?.total || total);
      } catch (e) {
        if (e?.response?.status === 409 && e?.response?.data?.pedidoId) {
          // Reutiliza el pedido abierto
          pedidoId = e.response.data.pedidoId;
          // si quieres, puedes pedir el total al backend con un endpoint /api/pedidos/:id
          totalServer = total; // fallback local
        } else {
          throw e;
        }
      }

      const amount = Math.round(Number(totalServer) * 100); // céntimos

      // 2) Crea Orden en Culqi con metadata robusta (siempre con table_code)
      const metadata = {
        restaurant_id: restaurantId,
        order_id: pedidoId,
        mesa_id: mesaId,
        table_code: mesaCode ?? String(mesaId), // 👈 nunca null
        idempotency_key: idempotencyKey,
      };

      const ordRes = await axios.post(
        `${API_BASE}/api/pay/culqi/order`,
        {
          amount,
          email,
          description: `Pedido #${pedidoId}`,
          metadata,
          mesaId, // 👈 por si el backend necesita derivar table_code
          paymentMethods: { card: true, yape: true },
        },
        { headers }
      );
      const orderId = ordRes.data?.order?.id;
      if (!orderId) {
        console.error("ORDER RESPONSE:", ordRes.data);
        alert("No se pudo generar la orden de pago.");
        return;
      }

      // 3) Abrir Culqi
      openCulqiCheckout({
        amount,
        email,
        orderId,
        onToken: async (tokenId) => {
          try {
            await axios.post(
              `${API_BASE}/api/pay/culqi/charge`,
              {
                amount,
                email,
                tokenId,
                description: `Pedido #${pedidoId}`,
                metadata,
                mesaId, // opcional (refuerzo para derivar)
              },
              { headers }
            );
            alert("✅ Pago enviado. Esperando confirmación…");
          } catch (e) {
            console.error("CHARGE ERROR:", e.response?.data || e.message);
            alert("❌ Pago con tarjeta rechazado");
          }
        },
        onOrder: () => {
          // Yape / PagoEfectivo: el webhook actualizará el pedido a "pagado"
          alert("Orden creada. Completa el pago en la app. Esperando confirmación…");
        },
      });
    } catch (e) {
      console.error("ORDER ERROR:", e.response?.data || e.message);
      alert(
        typeof e?.response?.data === "object"
          ? JSON.stringify(e.response.data)
          : (e.response?.data || e.message)
      );
    }
  }, [total, mesaCode, mesaId, restaurantId, cart, autoLogin]);

  return (
    <div className="min-h-svh bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-lg sm:text-xl font-bold tracking-tight">
              🍽 Menú Digital — Mesa {mesaCode || mesaId}
            </h1>
            <p className="text-xs text-neutral-500">Restaurant: {restaurantId}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
           
          </div>
        </div>
      </header>

      {/* Mensaje */}
      {mensaje && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700">
            {mensaje}
          </div>
        </div>
      )}

      {/* Contenido */}
      <main className={`mx-auto w-full max-w-6xl px-4 py-6 ${itemCount > 0 ? "pb-28" : ""}`}>
        {/* Combos */}
        {combos.length > 0 && (
          <section className="mb-8">
            <h3 className="mb-2 text-lg font-semibold">Combos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
              {combos.map((co) => (
                <ComboCard key={co.id} combo={co} onChoose={() => setOpenCombo({ combo: co })} />
              ))}
            </div>
          </section>
        )}

        {/* Categorías */}
        <h2 className="mb-3 text-base sm:text-lg font-semibold tracking-tight">Platos</h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 items-stretch">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-full flex flex-col overflow-hidden rounded-2xl bg-white p-3 sm:p-4 shadow-sm ring-1 ring-black/5">
                <div className="aspect-[4/3] w-full rounded-lg bg-neutral-200" />
                <div className="mt-3 h-4 w-3/4 rounded bg-neutral-200" />
                <div className="mt-2 h-3 w-full rounded bg-neutral-200" />
                <div className="mt-auto h-10 w-28 rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        ) : Array.isArray(menu) && menu.length > 0 ? (
          <div className="space-y-8">
            {menu.map((cat) => (
              <section key={cat.id || cat.nombre}>
                <h3 className="mb-2 text-lg font-semibold">{cat.nombre}</h3>
                {Array.isArray(cat.items) && cat.items.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 items-stretch">
                    {cat.items.map((item) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        onAdd={addToCart}
                        absolute={absolute}
                        fallbackImg={FALLBACK_IMG}
                        formatPEN={formatPEN}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 text-sm">Sin productos en esta categoría.</p>
                )}
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center text-neutral-600">
            No hay productos disponibles.
          </div>
        )}

        {/* Selector de Combo */}
        <ComboSheet
          open={!!openCombo}
          onClose={() => setOpenCombo(null)}
          combo={openCombo?.combo}
          onConfirm={(entrada, plato) => addComboToCart(openCombo.combo, entrada, plato)}
          absolute={absolute}
          fallbackImg={FALLBACK_IMG}
          formatPEN={formatPEN}
        />

        {/* Carrito completo (desktop) */}
        <section className="mt-10 hidden sm:block">
          <h2 className="mb-3 text-lg font-semibold tracking-tight">🛒 Carrito</h2>

          {cart.length === 0 ? (
            <p className="text-neutral-600">Vacío</p>
          ) : (
            <>
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5">
                    <img
                      src={absolute(item.isCombo ? item.entrada?.imagen_url : item.imagen_url) || FALLBACK_IMG}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                      alt={item.isCombo ? item.nombreCombo : item.nombre}
                      className="h-12 w-12 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium leading-tight">
                        {item.isCombo ? item.nombreCombo : item.nombre}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {item.isCombo ? `${item.entrada?.nombre} + ${item.plato?.nombre}` : item.descripcion}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {item.cantidad} x {formatPEN(item.precio)} ={" "}
                        <strong>{formatPEN(Number(item.precio || 0) * item.cantidad)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => removeAt(idx)} className="h-10 w-10 rounded-lg border border-neutral-300 text-lg leading-none hover:bg-neutral-100">−</button>
                      <button onClick={() => addAt(idx)}    className="h-10 w-10 rounded-lg border border-neutral-300 text-lg leading-none hover:bg-neutral-100">+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-lg font-semibold">Total: {formatPEN(total)}</div>
                <div className="flex gap-2">
                  <button
  onClick={simulatePay}
  className="h-11 rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-500"
>
  Simular Pago
</button>
                  <button
                    onClick={handlePay}
                    className="h-11 rounded-xl bg-emerald-600 px-5 text-white hover:bg-emerald-500"
                  >
                    Pagar (Tarjeta o Yape)
                  </button>
                  <button
                    onClick={sendOrder}
                    className="h-11 rounded-xl bg-neutral-900 px-5 text-white transition hover:bg-neutral-800 active:translate-y-[1px]"
                  >
                    Enviar Pedido
                  </button>
                  
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {/* Barra inferior (móvil) */}
      <CartBar
        itemCount={itemCount}
        total={total}
        formatPEN={formatPEN}
        onOpenCart={() => setOpenCart(true)}
        onSend={sendOrder}
        onPay={handlePay}
      />

      {/* Sheet móvil */}
      <CartSheet
        open={openCart}
        onClose={() => setOpenCart(false)}
        cart={cart}
        total={total}
        formatPEN={formatPEN}
        absolute={absolute}
        fallbackImg={FALLBACK_IMG}
        onAdd={addAt}
        onRemove={removeAt}
        onSend={sendOrder}
        onPay={handlePay}
      />
    </div>
  );
}


