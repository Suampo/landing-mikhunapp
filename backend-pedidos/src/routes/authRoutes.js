import { Router } from "express";
import { login, loginCliente, me, generarTokenTemporal, validateToken } from "../controllers/authController.js";
import { generarTokenServicio } from "../controllers/authController.js";
import { authAny } from "../middlewares/authAny.js";

const router = Router();

router.post("/login", login);
router.post("/login-cliente", loginCliente);
router.post("/token-temporal", generarTokenTemporal);
router.get("/me", authAny, me);
router.post("/generar-token-servicio", generarTokenServicio);

// ✅ Agrega validate-token
router.get("/validate-token", authAny, validateToken);

export default router;
