import { createClient } from "@supabase/supabase-js";

// Usa la Service Role en backend (NUNCA en frontend)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE,
  { auth: { persistSession: false }, global: { headers: { "X-Client-Info": "backend" } } }
);
