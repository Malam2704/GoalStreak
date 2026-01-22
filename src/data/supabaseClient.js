import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (url && anonKey) {
  globalThis.supabase = createClient(url, anonKey);
} else if (import.meta.env.VITE_DATA_MODE === "supabase") {
  console.warn(
    "Supabase env missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}
