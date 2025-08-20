// src/routes/inventarioRoutes.js
import { Router } from "express";
import { authTenant } from "../middlewares/authTenant.js";
import {
  listUnidades,
  listAlmacenes,
  getStock,
  getInsumos,
  createInsumo,
  getMovimientos,
  createMovimiento,
  createAlmacen, renameAlmacen, deleteAlmacen,
} from "../controllers/inventarioController.js";

const router = Router();
router.use(authTenant);

router.get("/unidades", listUnidades);
router.get("/almacenes", listAlmacenes);

router.get("/stock", getStock);
router.get("/insumos", getInsumos);
router.post("/insumos", createInsumo);

router.get("/movimientos", getMovimientos);
router.post("/movimientos", createMovimiento);

router.get("/almacenes", listAlmacenes);
router.post("/almacenes", createAlmacen);
router.put("/almacenes/:id", renameAlmacen);
router.delete("/almacenes/:id", deleteAlmacen);
export default router;
