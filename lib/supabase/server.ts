import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Create Supabase server client for use in Server Components and API routes
 * This client uses cookies for authentication
 * 
 * CRITICAL: Validates environment variables before creating client
 */
export async function createServerClient() {
  // Validate required environment variables
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

  // Note: Cookies are handled by Supabase client automatically
  return createClient(
    env.supabase.url,
    env.supabase.anonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}
