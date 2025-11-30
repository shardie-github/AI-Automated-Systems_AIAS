import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Admin Authentication Helper
 * Verifies user has admin role for protected admin routes
 */

// Use centralized env management - throws error if missing
const supabaseUrl = env.supabase.url;
const supabaseServiceKey = env.supabase.serviceRoleKey;

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Verify admin authentication from request
 */
export async function verifyAdminAuth(
  request: NextRequest
): Promise<{ user: AdminUser | null; error: string | null }> {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      // In development, allow access if no token (for testing)
      if (env.runtime.isDevelopment) {
        return {
          user: {
            id: "dev-admin",
            email: "admin@aias-platform.com",
            role: "admin",
          },
          error: null,
        };
      }
      return { user: null, error: "No authorization token provided" };
    }

    // Verify token with Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { user: null, error: "Invalid or expired token" };
    }

    // Check if user has admin role
    // TODO: Implement proper role checking from user metadata or database
    const userRole = user.user_metadata?.role || "user";

    if (userRole !== "admin") {
      return { user: null, error: "Insufficient permissions. Admin role required." };
    }

    return {
      user: {
        id: user.id,
        email: user.email || "",
        role: userRole,
      },
      error: null,
    };
  } catch (error) {
    console.error("Admin auth error:", error);
    return {
      user: null,
      error: "Authentication error",
    };
  }
}

/**
 * Check if request is from authenticated admin (simplified for development)
 */
export function isAdminRequest(request: NextRequest): boolean {
  // In development, always allow
  if (env.runtime.isDevelopment) {
    return true;
  }

  // In production, check for admin token
  const authHeader = request.headers.get("authorization");
  return !!authHeader;
}
