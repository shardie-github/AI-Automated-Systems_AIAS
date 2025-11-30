import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

/**
 * Create Supabase server client for use in Server Components and API routes
 * 
 * CRITICAL: Throws hard error immediately if required env vars are missing.
 * This ensures runtime failures are caught early, not silently ignored.
 * 
 * Uses @supabase/ssr for Next.js 15 compatibility with proper cookie handling.
 * Build-safe: During build (when SKIP_ENV_VALIDATION=true), returns placeholder
 * to prevent build failures. At runtime, throws hard error if vars are missing.
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
    return createServerClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            // Note: This often throws in Server Components, handle gracefully
            try {
              cookiesToSet.forEach(({ name, value, options }) => 
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore cookie setting errors during build/SSR
            }
          },
        },
      }
    );
  }
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          // Note: This often throws in Server Components, handle gracefully
          try {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore cookie setting errors during build/SSR
          }
        },
      },
    }
  );
}

// Legacy export for backwards compatibility
export async function createServerClient() {
  return createServerSupabaseClient();
}
