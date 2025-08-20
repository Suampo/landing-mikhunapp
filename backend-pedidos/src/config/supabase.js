// src/config/supabase.js
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE;

if (!url || !key) {
  console.warn("⚠️ Falta SUPABASE_URL o SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE en .env");
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "menu-images";
