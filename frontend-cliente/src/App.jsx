import { StrictMode, useEffect, useMemo, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

import Home from "./pages/Home";
import Category from "./pages/Category";
import Combo from "./pages/Combo";

import CartBar, { CARTBAR_H } from "./components/CartBar";
import CartSheet from "./components/CartSheet";
import { MenuProvider } from "./hooks/useMenuPublic";
// ⬇️ usa el flujo público híbrido
import { openPublicCheckoutCulqi } from "./services/culqi";

export const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#6b7280">Sin imagen</text></svg>`
  );

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
export const absolute = (url) =>
  url?.startsWith?.("http") ? url : url ? `${API_BASE}${url}` : "";

const PEN = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});
export const formatPEN = (v) => {
  try {
    return PEN.format(Number(v || 0));
  } catch {
    return `S/ ${Number(v || 0).toFixed(2)}`;
  }
};

// -------- carrito compartido por toda la app --------
function useCart() {
  const [cart, setCart] = useState([]);
  useEffect(() => {
    const onAdd = (e) => {
      const it = e.detail.item;
      setCart((prev) => {
        if (!it.isCombo) {
          const found = prev.find((p) => !p.isCombo && p.id === it.id);
          return found
            ? prev.map((p) => (p === found ? { ...p, cantidad: p.cantidad + 1 } : p))
            : [...prev, { ...it, cantidad: 1 }];
        }
        return [...prev, { ...it, cantidad: 1 }];
      });
    };
    window.addEventListener("cart:add", onAdd);
    return () => window.removeEventListener("cart:add", onAdd);
  }, []);
  const total = useMemo(
    () => cart.reduce((s, i) => s + Number(i.precio || 0) * i.cantidad, 0),
    [cart]
  );
  const itemCount = useMemo(() => cart.reduce((a, i) => a + i.cantidad, 0), [cart]);
  const addAt = (idx) =>
    setCart((prev) =>
      prev.map((i, k) => (k === idx ? { ...i, cantidad: i.cantidad + 1 } : i))
    );
  const removeAt = (idx) =>
    setCart((prev) =>
      prev
        .map((i, k) => (k === idx ? { ...i, cantidad: i.cantidad - 1 } : i))
        .filter((i) => i.cantidad > 0)
    );
  return { cart, setCart, total, itemCount, addAt, removeAt };
}

// ---------- helpers de pago ----------
const toItemsPayload = (cart) =>
  cart.map((i) =>
    i.isCombo
      ? {
          comboId: i.comboId,
          entradaId: i.entrada.id,
          platoId: i.plato.id,
          cantidad: i.cantidad,
        }
      : { id: i.id, cantidad: i.cantidad }
  );

const genIdem = () =>
  crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(16).slice(2)}`;

function useUrlParams() {
  const p = new URLSearchParams(location.search);
  return {
    mesaId: Number(p.get("mesaId") || 1),
    restaurantId: Number(p.get("restaurantId") || 1),
    mesaCode: p.get("mesaCode") || null,
  };
}

export default function App() {
  const { cart, setCart, total, itemCount, addAt, removeAt } = useCart();
  const [openCart, setOpenCart] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const { mesaId, restaurantId, mesaCode } = useUrlParams();

  // ---- auth cliente (igual al que ya tenías) ----
  const autoLogin = useCallback(async () => {
    try {
      let token = localStorage.getItem("token");
      if (token) {
        try {
          await axios.get(`${API_BASE}/api/auth/validate-token`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return token;
        } catch {
          localStorage.removeItem("token");
          token = null;
        }
      }
      const { data } = await axios.post(`${API_BASE}/api/auth/login-cliente`, {
        restaurantId,
      });
      token = data.token;
      localStorage.setItem("token", token);
      return token;
    } catch (err) {
      console.error("autoLogin:", err.response?.data || err.message);
      throw new Error("No se pudo autenticar al cliente");
    }
  }, [restaurantId]);

  // ---- enviar solo pedido (sin pagar) ----
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
      setCart([]);
      setOpenCart(false);
      setTimeout(() => setMensaje(""), 5000);
    } catch (error) {
      if (error?.response?.status === 409 && error?.response?.data?.pedidoId) {
        setMensaje(
          `⚠️ La mesa ya tiene un pedido abierto (#${error.response.data.pedidoId})`
        );
        setTimeout(() => setMensaje(""), 5000);
        return;
      }
      console.error("sendOrder:", error.response?.data || error.message);
    }
  }, [autoLogin, cart, mesaId, setCart]);

  // ---- simular pago ----
  const simulatePay = useCallback(async () => {
    try {
      if (!cart.length) return alert("Tu carrito está vacío.");
      const token = await autoLogin();
      const headers = { Authorization: `Bearer ${token}` };
      const idempotencyKey = genIdem();
      const items = toItemsPayload(cart);

      let pedidoId;
      try {
        const r = await axios.post(
          `${API_BASE}/api/pedidos`,
          { mesaId, items, idempotencyKey },
          { headers }
        );
        pedidoId = r.data.pedidoId;
      } catch (e) {
        if (e?.response?.status === 409 && e?.response?.data?.pedidoId)
          pedidoId = e.response.data.pedidoId;
        else throw e;
      }

      await axios.post(`${API_BASE}/api/pedidos/${pedidoId}/pagado`, {}, { headers });
      setMensaje(`✅ Pago simulado para el pedido #${pedidoId}`);
      setCart([]);
      setOpenCart(false);
      setTimeout(() => setMensaje(""), 5000);
    } catch (err) {
      console.error("simulatePay:", err.response?.data || err.message);
      alert("❌ No se pudo simular el pago.");
    }
  }, [cart, autoLogin, mesaId, setCart]);

  // ---- pagar con Culqi (flujo público híbrido: Orders → fallback token) ----
  const handlePay = useCallback(async () => {
    try {
      const amountPreview = Math.round(total * 100);
      if (!amountPreview || amountPreview <= 0) return alert("Tu carrito está vacío.");
      const email = "mikhunappfood@gmail.com"; // TODO: reemplazar por email del cliente

      // 1) autenticarse como cliente (para crear pedido local)
      const token = await autoLogin();
      const headers = { Authorization: `Bearer ${token}` };
      const idempotencyKey = genIdem();
      const items = toItemsPayload(cart);

      // 2) crear pedido local (o reutilizar si ya existe)
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
          pedidoId = e.response.data.pedidoId;
          totalServer = total;
        } else {
          throw e;
        }
      }

      // 3) abrir Culqi BYO (público). Esto intentará Orders; si falla, cae a token+charge.
      const amount = Math.round(Number(totalServer) * 100); // céntimos
      const metadata = {
        restaurant_id: restaurantId,
        order_id: pedidoId,
        mesa_id: mesaId,
        table_code: mesaCode ?? String(mesaId),
        idempotency_key: idempotencyKey,
      };

      await openPublicCheckoutCulqi({
        restaurantId,         // ← pk/secret salen de la DB por restaurante
        amount,
        customer: { email },  // puedes pasar fullName/phone si los tienes
        metadata,
        currency: "PEN",
        description: `Pedido #${pedidoId}`,
      });

      // El cierre del pedido lo hará tu webhook (o el endpoint charge público en fallback)
      // Aquí puedes mostrar un aviso:
      alert("Pago iniciado. Esperando confirmación…");
    } catch (e) {
      console.error("PAY ERROR:", e.response?.data || e.message);
      alert(
        typeof e?.response?.data === "object"
          ? JSON.stringify(e.response.data)
          : e.response?.data || e.message
      );
    }
  }, [total, mesaCode, mesaId, restaurantId, cart, autoLogin]);

  return (
    <StrictMode>
      {/* mensaje superior */}
      {mensaje && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700">
            {mensaje}
          </div>
        </div>
      )}

      <BrowserRouter>
        <MenuProvider>
          {/* Este wrapper agrega espacio inferior cuando el carrito está visible */}
          <div
            className="min-h-svh"
            style={
              itemCount > 0
                ? { paddingBottom: `calc(${CARTBAR_H}px + env(safe-area-inset-bottom))` }
                : undefined
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/categoria/:id" element={<Category />} />
              <Route path="/combo" element={<Combo />} />
            </Routes>
          </div>

          {/* barra inferior + sheet */}
          <CartBar
            itemCount={itemCount}
            total={total}
            formatPEN={formatPEN}
            onOpenCart={() => setOpenCart(true)}
            onSend={sendOrder}
            onPay={handlePay}
          />

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
        </MenuProvider>
      </BrowserRouter>
    </StrictMode>
  );
}
