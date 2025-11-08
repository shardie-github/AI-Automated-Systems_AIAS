import { NextResponse } from "next/server";
import { generateOpenAPISchema } from "@/lib/api/openapi";

/**
 * GET /api/docs
 * Returns OpenAPI/Swagger schema
 */
export async function GET() {
  const schema = generateOpenAPISchema();

  return NextResponse.json(schema, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
