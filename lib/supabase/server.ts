import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Create Supabase server client for use in Server Components and API routes
 * This client uses cookies for authentication
 */
export async function createServerClient() {
  const cookieStore = await cookies();
  
  return createClient(
    env.supabase.url,
    env.supabase.anonKey,
    {
      auth: {
        getSession: async () => {
          const accessToken = cookieStore.get("sb-access-token")?.value;
          const refreshToken = cookieStore.get("sb-refresh-token")?.value;
          
          if (!accessToken) return { data: { session: null }, error: null };
          
          return {
            data: {
              session: {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_at: Date.now() / 1000 + 3600,
                expires_in: 3600,
                token_type: "bearer",
                user: null,
              },
            },
            error: null,
          };
        },
      },
    }
  );
}
