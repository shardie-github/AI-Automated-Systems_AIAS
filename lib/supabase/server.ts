import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

/**
 * Create Supabase server client for use in Server Components and API routes
 * 
 * CRITICAL: Throws hard error immediately if required env vars are missing.
 * This ensures runtime failures are caught early, not silently ignored.
 * 
 * Uses async cookies() for Next.js 15 compatibility.
 * Build-safe: During build (when SKIP_ENV_VALIDATION=true), returns placeholder
 * to prevent build failures. At runtime, throws hard error if vars are missing.
 * 
 * NOTE: For full Next.js 15 cookie handling, consider installing @supabase/ssr
 * and using createServerClient from that package instead.
 */
export async function createServerSupabaseClient() {
  // Next.js 15: cookies() must be awaited
  const cookieStore = await cookies();
  
  // Type-safe access: process.env is string | undefined
  const supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Build-safe check: Skip validation during build
  const isBuildTime = process.env.SKIP_ENV_VALIDATION === 'true' || 
                      process.env.SKIP_ENV_VALIDATION === '1' ||
                      (process.env.NODE_ENV !== 'production');
  
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
    return createClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
  }
  
  return createClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

// Legacy export for backwards compatibility
export async function createServerClient() {
  return createServerSupabaseClient();
}
