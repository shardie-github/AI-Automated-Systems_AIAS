import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Supabase Client for Server and Client Components
 * 
 * All configuration is loaded dynamically from environment variables.
 * No hardcoded values are used.
 */

export const supabase = createClient(
  env.supabase.url,
  env.supabase.anonKey,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
