/**
 * Admin Route Guard
 * 
 * Middleware for protecting admin routes.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { addSecurityHeaders } from "./security";

/**
 * Admin route guard middleware
 */
export async function adminGuard(
  request: NextRequest
): Promise<NextResponse | null> {
  const path = request.nextUrl.pathname;

  // Check if this is an admin route
  if (!path.startsWith("/admin")) {
    return null; // Not an admin route, continue
  }

  // Check admin access
  const adminCheck = await requireAdmin(request);

  if (!adminCheck.authorized) {
    // Redirect to signin if not authenticated
    if (request.nextUrl.pathname.startsWith("/api")) {
      return adminCheck.response || NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("redirect", path);
    const response = NextResponse.redirect(signInUrl);
    addSecurityHeaders(response);
    return response;
  }

  // Add admin headers
  const response = NextResponse.next();
  addSecurityHeaders(response);
  response.headers.set("X-Admin-User", adminCheck.user?.email || "");
  response.headers.set("X-Admin-Role", adminCheck.user?.role || "");

  return response;
}

/**
 * Financial admin route guard (for sensitive financial data)
 */
export async function financialAdminGuard(
  request: NextRequest
): Promise<NextResponse | null> {
  const path = request.nextUrl.pathname;

  // Check if this is a financial route
  if (!path.startsWith("/admin/financial") && !path.startsWith("/api/admin/financial")) {
    return null;
  }

  // Require financial admin role
  const { requireAdminRole } = await import("@/lib/auth/admin-auth");
  const { AdminRole } = await import("@/lib/auth/admin-auth");

  const adminCheck = await requireAdminRole(request, AdminRole.FINANCIAL_ADMIN);

  if (!adminCheck.authorized) {
    if (request.nextUrl.pathname.startsWith("/api")) {
      return adminCheck.response || NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const response = NextResponse.redirect(new URL("/admin?error=financial_access_required", request.url));
    addSecurityHeaders(response);
    return response;
  }

  const response = NextResponse.next();
  addSecurityHeaders(response);
  response.headers.set("X-Admin-User", adminCheck.user?.email || "");
  response.headers.set("X-Admin-Role", adminCheck.user?.role || "");

  return response;
}
