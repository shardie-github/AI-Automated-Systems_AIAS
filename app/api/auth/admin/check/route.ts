/**
 * Admin Access Check API
 * 
 * Checks if current user has admin access.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, hasAdminRole, AdminRole } from "@/lib/auth/admin-auth";
import { addSecurityHeaders } from "@/lib/middleware/security";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/admin/check
 * Check admin access
 */
export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser) {
      return NextResponse.json(
        { isAdmin: false, hasFinancialAccess: false },
        { status: 403 }
      );
    }

    const hasFinancialAccess = await hasAdminRole(adminUser.id, AdminRole.FINANCIAL_ADMIN);

    const response = NextResponse.json({
      isAdmin: true,
      hasFinancialAccess,
      email: adminUser.email,
      role: adminUser.role,
    });

    addSecurityHeaders(response);
    return response;
  } catch (error) {
    console.error("Error checking admin access:", error);
    return NextResponse.json(
      { isAdmin: false, hasFinancialAccess: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
