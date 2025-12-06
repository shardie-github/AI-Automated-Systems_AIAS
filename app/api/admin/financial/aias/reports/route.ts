/**
 * AIAS Financial Reports API
 * 
 * Protected API for accessing AIAS financial reports.
 * Requires Financial Admin access.
 * Data is read from internal/private/financial/aias/ (encrypted).
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole, AdminRole } from "@/lib/auth/admin-auth";
import { addSecurityHeaders } from "@/lib/middleware/security";
import { readFile } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/financial/aias/reports
 * Get financial reports (requires financial admin access)
 */
export async function GET(request: NextRequest) {
  try {
    // Check financial admin access
    const adminCheck = await requireAdminRole(request, AdminRole.FINANCIAL_ADMIN);

    if (!adminCheck.authorized) {
      return adminCheck.response || NextResponse.json(
        { error: "Unauthorized: Financial Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "monthly";
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    // Construct file path (in production, this would read from database or secure storage)
    const reportsDir = join(process.cwd(), "internal", "private", "financial", "aias");
    
    // In production, you would:
    // 1. Read from encrypted storage
    // 2. Decrypt using git-crypt or similar
    // 3. Return the data

    // For now, return structure (actual data would be encrypted)
    const response = NextResponse.json({
      message: "Financial reports are stored in encrypted format",
      location: "internal/private/financial/aias/",
      encrypted: true,
      accessLevel: "financial_admin",
      note: "In production, this endpoint would decrypt and return actual financial data",
    });

    addSecurityHeaders(response);
    return response;
  } catch (error) {
    console.error("Error accessing financial reports:", error);
    return NextResponse.json(
      { error: "Failed to access financial reports" },
      { status: 500 }
    );
  }
}
