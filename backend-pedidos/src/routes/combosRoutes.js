// src/routes/combosRoutes.js
import { Router } from "express";
import { authTenant } from "../middlewares/authTenant.js";
import {
  getCombos,
  createCombo,
  updateCombo,
  deleteCombo,
} from "../controllers/combosController.js";

const router = Router();

router.use(authTenant);            // todas protegidas

router.get("/", getCombos);        // solo activos
router.post("/", createCombo);
router.put("/:id", updateCombo);
router.delete("/:id", deleteCombo); // soft delete

export default router;
