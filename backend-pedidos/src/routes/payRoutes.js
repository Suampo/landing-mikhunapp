// src/routes/payRoutes.js
import { Router } from "express";
import { authAny } from "../middlewares/authAny.js";
import { apiCreateCulqiOrder, apiCreateCulqiCharge } from "../controllers/payController.js";

const router = Router();
router.post("/culqi/order", authAny, apiCreateCulqiOrder);
router.post("/culqi/charge", authAny, apiCreateCulqiCharge);
export default router;