// src/routes/reportesRoutes.js
import { Router } from "express";
import { authTenant } from "../middlewares/authTenant.js";
import {
  ventasPorFecha,
  kpis,
  ventasUltimosDias,
} from "../controllers/reportesController.js";

const r = Router();

r.use(authTenant);

r.get("/ventas-fecha", ventasPorFecha);
r.get("/kpis", kpis);
r.get("/sales-by-day", ventasUltimosDias);

export default r;
