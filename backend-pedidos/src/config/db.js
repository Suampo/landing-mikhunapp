import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

// Ajustes sanos para Supabase / Postgres administrado
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.PG_MAX || "10", 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 7_000,
  keepAlive: true,
  ssl:
    process.env.PG_SSL === "false"
      ? false
      : { rejectUnauthorized: false }, // Supabase
});

// Test de conexión (libera cliente)
(async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("✅ Conectado a PostgreSQL");
  } catch (err) {
    console.error("❌ Error de conexión:", err);
  }
})();
