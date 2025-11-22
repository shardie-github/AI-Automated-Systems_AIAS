import { NextRequest, NextResponse } from "next/server";
import { createGETHandler } from "@/lib/api/route-handler";
import { getTemplate } from "@/lib/workflows/templates";

export const runtime = "edge";

/**
 * GET /api/workflows/templates/[id]
 * Get a specific workflow template by ID
 */
export const GET = createGETHandler(
  async (context) => {
    const { request } = context;
    
    // Get template ID from URL
    const templateId = request.nextUrl.pathname.split("/").pop();
    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID required" },
        { status: 400 }
      );
    }

    const template = getTemplate(templateId);

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  },
  {
    requireAuth: false,
    cache: { enabled: true, ttl: 3600 }, // Cache for 1 hour
  }
);
