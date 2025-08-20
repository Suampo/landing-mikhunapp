// src/routes/combosRoutes.js
import { Router } from "express";
import multer from "multer";
import { authTenant } from "../middlewares/authTenant.js";
import {
  getCombos,
  createCombo,
  updateCombo,
  deleteCombo,
  updateComboCover,
} from "../controllers/combosController.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.use(authTenant);

router.get("/", getCombos);
router.post("/", createCombo);
router.put("/:id", updateCombo);
router.delete("/:id", deleteCombo);

// subir portada de combo
router.put("/:id/cover", upload.single("image"), updateComboCover);

export default router;
