// src/routes/categoriaRoutes.js
import { Router } from "express";
import { authTenant } from "../middlewares/authTenant.js";
import {
  listCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  updateCategoriaCover,
  upload, // 👈 viene del controlador, NO lo vuelvas a crear aquí
} from "../controllers/categoriaController.js";

const router = Router();

router.get("/", authTenant, listCategorias);
router.post("/", authTenant, createCategoria);
router.put("/:id", authTenant, updateCategoria);
router.delete("/:id", authTenant, deleteCategoria);

// Subir portada (campo: "image")
router.put("/:id/cover", authTenant, upload.single("image"), updateCategoriaCover);

export default router;
