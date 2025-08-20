// src/controllers/reportesController.js
import { pool } from "../config/db.js";

/**
 * Ventas por fecha (rango)
 * GET /api/reportes/ventas-fecha?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
export async function ventasPorFecha(req, res) {
  try {
    const restaurantId = Number(req.user.restaurantId);
    const { from, to } = req.query; // 'YYYY-MM-DD'
    if (!from || !to) {
      return res.status(400).json({ error: "from y to requeridos (YYYY-MM-DD)" });
    }

    const sql = `
      SELECT
        p.created_at::date AS fecha,
        SUM(p.total)::numeric AS ventas
      FROM pedidos p
      WHERE p.restaurant_id = $1
        AND p.estado = 'pagado'
        AND p.created_at >= $2::date
        AND p.created_at <  ($3::date + interval '1 day')
      GROUP BY 1
      ORDER BY 1;
    `;
    const { rows } = await pool.query(sql, [restaurantId, from, to]);
    res.json(rows);
  } catch (e) {
    console.error("ventasPorFecha:", e);
    res.status(500).json({ error: "No se pudo calcular ventas" });
  }
}

/**
 * KPIs cabecera (día actual)
 * GET /api/reportes/kpis
 */
export async function kpis(req, res) {
  try {
    const restaurantId = Number(req.user.restaurantId);

    // Solo created_at::date para compatibilidad universal
    const { rows } = await pool.query(
      `
      WITH base AS (
        SELECT created_at::date AS d, total
        FROM pedidos
        WHERE restaurant_id = $1
          AND estado = 'pagado'
          AND created_at::date = CURRENT_DATE
      )
      SELECT
        COALESCE(SUM(total),0)::numeric AS ventas_dia,
        COUNT(*)::int AS tickets
      FROM base;
      `,
      [restaurantId]
    );

    const ventasDia = Number(rows[0]?.ventas_dia || 0);
    const tickets   = Number(rows[0]?.tickets || 0);
    const avg       = tickets ? ventasDia / tickets : 0;
    const margen    = 0; // placeholder hasta tener recetas/costos

    res.json({ ventasDia, tickets, avg, margen });
  } catch (e) {
    console.error("kpis:", e);
    res.status(500).json({ error: "No se pudieron calcular los KPIs" });
  }
}

/**
 * Serie ventas últimos N días (por defecto 7)
 * GET /api/reportes/sales-by-day?days=7
 */
export async function ventasUltimosDias(req, res) {
  try {
    const restaurantId = Number(req.user.restaurantId);
    const days = Math.max(1, Math.min(31, Number(req.query.days || 7)));

    // Compatibilidad: NO usamos order_day; solo created_at::date
    const { rows } = await pool.query(
      `
      WITH days AS (
        SELECT generate_series(
          CURRENT_DATE - ($2::int - 1),
          CURRENT_DATE,
          '1 day'
        )::date AS d
      ),
      agg AS (
        SELECT created_at::date AS d,
               SUM(total)::numeric AS total
        FROM pedidos
        WHERE restaurant_id = $1
          AND estado = 'pagado'
          AND created_at::date BETWEEN CURRENT_DATE - ($2::int - 1) AND CURRENT_DATE
        GROUP BY 1
      )
      SELECT days.d, COALESCE(agg.total,0) AS total
      FROM days
      LEFT JOIN agg ON agg.d = days.d
      ORDER BY days.d;
      `,
      [restaurantId, days]
    );

    const fmt = new Intl.DateTimeFormat("es-PE", { weekday: "short" });
    const labels = rows.map(r => fmt.format(new Date(r.d)).slice(0,1).toUpperCase());
    const data   = rows.map(r => Number(r.total));

    res.json({ labels, data, points: rows });
  } catch (e) {
    console.error("ventasUltimosDias:", e);
    res.status(500).json({ error: "No se pudo obtener la serie de ventas" });
  }
}
