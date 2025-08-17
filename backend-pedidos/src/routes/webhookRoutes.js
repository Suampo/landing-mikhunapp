import { Router } from "express";
import { culqiWebhook } from "../controllers/webhookController.js";

const router = Router();

// La firma de Culqi se valida en el controlador usando req.body (raw Buffer) y headers
router.post("/culqi", culqiWebhook);

export default router;
