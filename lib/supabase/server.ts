import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Create Supabase server client for use in Server Components and API routes
 * This client uses cookies for authentication
 */
export async function createServerClient() {
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
