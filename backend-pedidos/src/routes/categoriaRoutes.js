import { Router } from "express";
import {
  listCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "../controllers/categoriaController.js";
import { authTenant } from "../middlewares/authTenant.js";

const router = Router();

// ✅ protegido: el controlador tomará restaurantId del token
router.get("/", authTenant, listCategorias);

router.post("/", authTenant, createCategoria);
router.put("/:id", authTenant, updateCategoria);
router.delete("/:id", authTenant, deleteCategoria);

export default router;
