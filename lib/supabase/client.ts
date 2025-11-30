import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Supabase Client for Server and Client Components
 * 
 * All configuration is loaded dynamically from environment variables.
 * No hardcoded values are used.
 * 
 * CRITICAL: Throws hard error if required environment variables are missing.
 * This ensures build-time failures rather than runtime failures.
 */

// Validate required environment variables at module load time
if (!env.supabase.url) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL is required but not set. ' +
    'Please set this variable in your environment configuration.'
  );
}

if (!env.supabase.anonKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY is required but not set. ' +
    'Please set this variable in your environment configuration.'
  );
}

export const supabase = createSupabaseClient(
  env.supabase.url,
  env.supabase.anonKey,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);

// Export createClient function for compatibility
export function createClient(
  url?: string, 
  key?: string, 
  options?: { auth?: { persistSession?: boolean; autoRefreshToken?: boolean; detectSessionInUrl?: boolean } }
) {
  const finalUrl = url || env.supabase.url;
  const finalKey = key || env.supabase.anonKey;
  
  if (!finalUrl) {
    throw new Error('Supabase URL is required but not provided');
  }
  
  if (!finalKey) {
    throw new Error('Supabase anon key is required but not provided');
  }
  
  return createSupabaseClient(
    finalUrl,
    finalKey,
    options || { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );
}
