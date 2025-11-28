import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Supabase Client for Server and Client Components
 * 
 * All configuration is loaded dynamically from environment variables.
 * No hardcoded values are used.
 */

export const supabase = createSupabaseClient(
  env.supabase.url,
  env.supabase.anonKey,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);

// Export createClient function for compatibility
export function createClient(url?: string, key?: string, options?: any) {
  return createSupabaseClient(
    url || env.supabase.url,
    key || env.supabase.anonKey,
    options || { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );
}
