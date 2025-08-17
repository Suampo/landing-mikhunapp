// src/routes/menuItemRoutes.js
import { Router } from "express";
import { authTenant } from "../middlewares/authTenant.js";
import { upload } from "../middlewares/multer.js";

import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuItemController.js";
import { uploadMenuImage } from "../controllers/menuImageController.js";

const router = Router();

router.get("/", authTenant, getMenuItems);           // GET /api/menu-items
router.post("/", authTenant, createMenuItem);        // POST /api/menu-items
router.put("/:id", authTenant, updateMenuItem);      // PUT /api/menu-items/:id
router.delete("/:id", authTenant, deleteMenuItem);   // DELETE /api/menu-items/:id
router.post("/:id/upload-image", authTenant, upload.single("image"), uploadMenuImage);
// POST /api/menu-items/:id/upload-image

export default router;
