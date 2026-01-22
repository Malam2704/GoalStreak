import { localAdapter } from "./adapters/local.js";
import { supabaseAdapter } from "./adapters/supabase.js";

const MODE = import.meta.env.VITE_DATA_MODE || "local";

const adapters = {
  local: localAdapter,
  supabase: supabaseAdapter
};

export const dataClient = adapters[MODE] || localAdapter;
export const dataMode = adapters[MODE] ? MODE : "local";
