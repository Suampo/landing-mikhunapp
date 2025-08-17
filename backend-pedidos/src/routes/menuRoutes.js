// routes/menuRoutes.js
import { Router } from "express";
import { getMenu, getMenuPublic } from "../controllers/menuController.js";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuItemController.js";
import { uploadMenuImage } from "../controllers/menuImageController.js";
import { authTenant } from "../middlewares/authTenant.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

/** PÚBLICO (cliente QR) */
router.get("/public", getMenuPublic);

/** ADMIN (JWT) */
router.get("/", authTenant, getMenu);

// CRUD admin de items
router.get("/items", authTenant, getMenuItems);
router.post("/items", authTenant, createMenuItem);
router.put("/items/:id", authTenant, updateMenuItem);
router.delete("/items/:id", authTenant, deleteMenuItem);

// Imagen de un item
router.post(
  "/item/:id/upload-image",
  authTenant,
  upload.single("image"),
  uploadMenuImage
);

export default router;
