import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Supabase Client for Browser/Client Components
 * 
 * CRITICAL: Throws hard error immediately if required env vars are missing.
 * This ensures runtime failures are caught early, not silently ignored.
 * 
 * Build-safe: During build (when SKIP_ENV_VALIDATION=true), returns placeholder
 * to prevent build failures. At runtime, throws hard error if vars are missing.
 * 
 * NOTE: For full Next.js 15 compatibility, consider installing @supabase/ssr
 * and using createBrowserClient from that package instead.
 */

export function createClient() {
  // Type-safe access: process.env is string | undefined
  const supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Build-safe check: Skip validation during build
  const isBuildTime = process.env.SKIP_ENV_VALIDATION === 'true' || 
                      process.env.SKIP_ENV_VALIDATION === '1' ||
                      (typeof window === 'undefined' && process.env.NODE_ENV !== 'production');
  
  // Hard error at runtime if missing (production safety)
  if (!supabaseUrl || !supabaseKey) {
    if (!isBuildTime) {
      // Runtime: Throw hard error immediately - do not fail silently
      throw new Error(
        `Missing required Supabase environment variables. ` +
        `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'set' : 'MISSING'}, ` +
        `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? 'set' : 'MISSING'}`
      );
    }
    // Build-time: Return placeholder to prevent build failures
    // This will fail at runtime if actually used, which is the desired behavior
    return createSupabaseClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-key',
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
    );
  }
  
  return createSupabaseClient<Database>(
    supabaseUrl,
    supabaseKey,
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );
}
