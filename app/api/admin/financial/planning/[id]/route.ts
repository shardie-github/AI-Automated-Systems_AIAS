/**
 * Business Planning Documents API
 * 
 * Protected API for accessing business planning documents.
 * Requires Financial Admin access.
 * Documents are read from internal/private/ directories (encrypted with git-crypt).
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole, AdminRole } from "@/lib/auth/admin-auth";
import { addSecurityHeaders } from "@/lib/middleware/security";
import { getBusinessPlanningDocument } from "@/lib/admin/business-planning-access";
import { readFile } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/financial/planning/[id]
 * Get business planning document (requires financial admin access)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check financial admin access
    const adminCheck = await requireAdminRole(request, AdminRole.FINANCIAL_ADMIN);

    if (!adminCheck.authorized) {
      return adminCheck.response || NextResponse.json(
        { error: "Unauthorized: Financial Admin access required" },
        { status: 403 }
      );
    }

    const documentId = params.id;
    const document = getBusinessPlanningDocument(documentId);

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check user has access to this document
    const hasAccess = adminCheck.user?.role === "super_admin" ||
      (adminCheck.user?.role === "financial_admin" && document.requiresAccess !== "super_admin");

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Insufficient permissions for this document" },
        { status: 403 }
      );
    }

    // In production, read from encrypted storage
    // For now, return document metadata
    const response = NextResponse.json({
      document: {
        id: document.id,
        name: document.name,
        category: document.category,
        description: document.description,
        location: document.location,
        encrypted: document.encrypted,
      },
      message: "Document is stored in encrypted format",
      note: "In production, this endpoint would decrypt and return the actual document content",
      accessLevel: document.requiresAccess,
    });

    addSecurityHeaders(response);
    return response;
  } catch (error) {
    console.error("Error accessing business planning document:", error);
    return NextResponse.json(
      { error: "Failed to access document" },
      { status: 500 }
    );
  }
}
