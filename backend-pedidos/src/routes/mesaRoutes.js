import { Router } from "express";
import { authTenant } from "../middlewares/authTenant.js";
import {
  listarMesas,
  crearMesa,
  eliminarMesa,
  generarQRDeMesa,
} from "../controllers/mesaController.js";

const router = Router();

// Todas requieren ADMIN/STAFF; siempre filtrar por req.user.restaurantId en el controlador
router.get("/", authTenant, listarMesas);
router.post("/", authTenant, crearMesa);
router.delete("/:id", authTenant, eliminarMesa);
router.get("/:mesaId/qr", authTenant, generarQRDeMesa);

export default router;
