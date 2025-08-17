import { pool } from "../config/db.js";
import QRCode from "qrcode";
import crypto from "crypto";

const base64url = (buf) =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const signQR = ({ restaurantId, mesaId, codigo }) => {
  const secret = process.env.QR_SECRET || "dev-qr-secret";
  const msg = `${restaurantId}:${mesaId}:${codigo}`;
  const mac = crypto.createHmac("sha256", secret).update(msg).digest();
  return base64url(mac);
};

export const listarMesas = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { rows } = await pool.query(
      "SELECT id, codigo, descripcion FROM mesas WHERE restaurant_id = $1 ORDER BY id ASC",
      [restaurantId]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ listarMesas:", err.stack || err.message);
    res.status(500).json({ error: "Error listando mesas" });
  }
};

export const crearMesa = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId; // del token
    const { codigo, descripcion } = req.body || {};
    if (!codigo || !String(codigo).trim()) {
      return res.status(400).json({ error: "Falta código" });
    }

    const { rows } = await pool.query(
      `INSERT INTO mesas (restaurant_id, codigo, descripcion)
       VALUES ($1, $2, $3)
       RETURNING id, codigo, descripcion`,
      [restaurantId, String(codigo).trim(), descripcion || null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "Ya existe una mesa con ese código" });
    }
    console.error("❌ crearMesa:", err.stack || err.message, err?.detail || "");
    res.status(500).json({ error: "Error creando mesa" });
  }
};

export const eliminarMesa = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;
    await pool.query("DELETE FROM mesas WHERE id = $1 AND restaurant_id = $2", [
      id,
      restaurantId,
    ]);
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ eliminarMesa:", err.stack || err.message);
    res.status(500).json({ error: "Error eliminando mesa" });
  }
};

export const generarQRDeMesa = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { mesaId } = req.params;

    const r = await pool.query(
      "SELECT codigo FROM mesas WHERE id = $1 AND restaurant_id = $2",
      [mesaId, restaurantId]
    );
    if (r.rowCount === 0) {
      return res.status(404).json({ error: "Mesa no encontrada" });
    }
    const codigo = r.rows[0].codigo;

    const PUBLIC_URL = (process.env.CLIENT_PUBLIC_URL || "http://localhost:5174").replace(
      /\/+$/,
      ""
    );

    // Firma HMAC contra manipulación
    const s = signQR({ restaurantId, mesaId, codigo });

    const url = `${PUBLIC_URL}/?mesaId=${encodeURIComponent(
      mesaId
    )}&restaurantId=${encodeURIComponent(
      restaurantId
    )}&mesaCode=${encodeURIComponent(codigo)}&s=${encodeURIComponent(s)}`;

    const png = await QRCode.toDataURL(url, { width: 640, margin: 1 });

    res.json({ ok: true, url, png });
  } catch (err) {
    console.error("❌ generarQRDeMesa:", err.stack || err.message);
    res.status(500).json({ error: "Error generando QR" });
  }
};
