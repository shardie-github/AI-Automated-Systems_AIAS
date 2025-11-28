import { NextRequest, NextResponse } from "next/server";
import { createGETHandler } from "@/lib/api/route-handler";
import { workflowTemplates, getTemplatesByCategory } from "@/lib/workflows/templates";

export const runtime = "edge";

/**
 * GET /api/workflows/templates
 * Get workflow templates
 */
export const GET = createGETHandler(
  async (context) => {
    const { request } = context;
    const category = request.nextUrl.searchParams.get("category");
    const integration = request.nextUrl.searchParams.get("integration");

    let templates = workflowTemplates;

    if (category) {
      templates = getTemplatesByCategory(category as "ecommerce" | "accounting" | "communication" | "productivity" | "marketing");
    }

    if (integration) {
      templates = templates.filter((t) => t.requiredIntegrations.includes(integration));
    }

    return NextResponse.json({
      templates,
      count: templates.length,
    });
  },
  {
    requireAuth: false,
    cache: { enabled: true, ttl: 3600 }, // Cache for 1 hour
  }
);
