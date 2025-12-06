/**
 * Admin Authentication & Authorization
 * 
 * Provides utilities for checking admin access and protecting admin routes.
 */

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(env.supabase.url, env.supabase.anonKey);

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId?: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !data) return false;

    // Check if user has admin role
    return data.role === "admin" || data.role === "super_admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Get current admin user from session
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("sb-access-token")?.value;

    if (!authToken) return null;

    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.getUser(authToken);

    if (error || !user) return null;

    // Check admin status
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) return null;

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email || "",
      role: profile?.role || "admin",
      isAdmin: true,
    };
  } catch (error) {
    console.error("Error getting admin user:", error);
    return null;
  }
}

/**
 * Require admin access middleware
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ authorized: boolean; user?: AdminUser; response?: NextResponse }> {
  const adminUser = await getAdminUser();

  if (!adminUser) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: adminUser,
  };
}

/**
 * Check admin access in server components
 */
export async function checkAdminAccess(): Promise<{
  isAdmin: boolean;
  user: AdminUser | null;
  redirect?: string;
}> {
  const adminUser = await getAdminUser();

  if (!adminUser) {
    return {
      isAdmin: false,
      user: null,
      redirect: "/signin?redirect=/admin",
    };
  }

  return {
    isAdmin: true,
    user: adminUser,
  };
}

/**
 * Admin role levels
 */
export enum AdminRole {
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
  FINANCIAL_ADMIN = "financial_admin",
}

/**
 * Check if user has specific admin role
 */
export async function hasAdminRole(
  userId: string,
  requiredRole: AdminRole
): Promise<boolean> {
  const user = await getAdminUser();
  if (!user || user.id !== userId) return false;

  const roleHierarchy: Record<AdminRole, number> = {
    [AdminRole.ADMIN]: 1,
    [AdminRole.FINANCIAL_ADMIN]: 2,
    [AdminRole.SUPER_ADMIN]: 3,
  };

  const userRoleLevel = roleHierarchy[user.role as AdminRole] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Require specific admin role
 */
export async function requireAdminRole(
  request: NextRequest,
  requiredRole: AdminRole
): Promise<{ authorized: boolean; user?: AdminUser; response?: NextResponse }> {
  const adminCheck = await requireAdmin(request);

  if (!adminCheck.authorized || !adminCheck.user) {
    return adminCheck;
  }

  const hasRole = await hasAdminRole(adminCheck.user.id, requiredRole);
  if (!hasRole) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: `Unauthorized: ${requiredRole} role required` },
        { status: 403 }
      ),
    };
  }

  return adminCheck;
}
