import { Router } from "express";
import {
  obtenerPedidos,
  crearPedido,
  actualizarPedidoEstado,
  obtenerPedidosRecientes,
  ventasPorDia,
} from "../controllers/pedidoController.js";
import { authTenant } from "../middlewares/authTenant.js";
import { authAny } from "../middlewares/authAny.js";
import { authKitchen } from "../middlewares/authKitchen.js";

const router = Router();

// ========================
// Listados para Admin/Staff
// ========================
router.get("/", authTenant, obtenerPedidos);
router.get("/admin/recent", authTenant, obtenerPedidosRecientes);
router.get("/admin/stats/sales-by-day", authTenant, ventasPorDia);

// ========================
// Listado de pedidos para cocina
// ========================
router.get("/cocina", authKitchen, obtenerPedidos); // <- Usar el controller directamente

// ========================
// Actualización de estado de pago (PATCH)
// ========================
router.patch("/:id", authTenant, actualizarPedidoEstado);

// ========================
// Creación de pedido (cliente o admin)
// ========================
router.post("/", authAny, crearPedido);

// ========================
// Simulación: marcar pedido como pagado
// ========================
router.post("/:id/pagado", authAny, async (req, res) => {
  try {
    req.body.estado = "pagado";
    await actualizarPedidoEstado(req, res);
  } catch (e) {
    console.error("Error simulando pago:", e);
    res.status(500).json({ error: "No se pudo marcar como pagado" });
  }
});

export default router;
