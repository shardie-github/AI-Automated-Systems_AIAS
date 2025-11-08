/**
 * OpenAPI/Swagger Schema Generator
 * Generates OpenAPI 3.0 schema from API routes
 */

export interface OpenAPISchema {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
    contact?: {
      name?: string;
      email?: string;
      url?: string;
    };
  };
  servers: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
    securitySchemes?: Record<string, any>;
  };
}

/**
 * Generate OpenAPI schema for the API
 */
export function generateOpenAPISchema(): OpenAPISchema {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aias-platform.com";

  return {
    openapi: "3.0.3",
    info: {
      title: "AIAS Platform API",
      version: "1.0.0",
      description: "Enterprise-grade AI consultancy platform API",
      contact: {
        name: "AIAS Platform Team",
        email: "support@aias-platform.com",
      },
    },
    servers: [
      {
        url: baseUrl,
        description: "Production server",
      },
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    paths: {
      "/api/healthz": {
        get: {
          summary: "Health check endpoint",
          description: "Returns the health status of the application and its dependencies",
          operationId: "healthCheck",
          tags: ["Health"],
          responses: {
            "200": {
              description: "All systems operational",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      ok: { type: "boolean" },
                      timestamp: { type: "string", format: "date-time" },
                      db: {
                        type: "object",
                        properties: {
                          ok: { type: "boolean" },
                          latency_ms: { type: "number" },
                        },
                      },
                      auth: {
                        type: "object",
                        properties: {
                          ok: { type: "boolean" },
                          latency_ms: { type: "number" },
                        },
                      },
                      rest: {
                        type: "object",
                        properties: {
                          ok: { type: "boolean" },
                          latency_ms: { type: "number" },
                        },
                      },
                      storage: {
                        type: "object",
                        properties: {
                          ok: { type: "boolean" },
                          buckets_count: { type: "number" },
                        },
                      },
                      total_latency_ms: { type: "number" },
                    },
                  },
                },
              },
            },
            "503": {
              description: "Service unavailable",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      ok: { type: "boolean" },
                      error: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string" },
                  message: { type: "string" },
                  code: { type: "string" },
                },
              },
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: { type: "number", minimum: 1, default: 1 },
            limit: { type: "number", minimum: 1, maximum: 100, default: 20 },
            offset: { type: "number", minimum: 0 },
          },
        },
      },
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token from Supabase Auth",
        },
        ApiKey: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "API key for service-to-service authentication",
        },
      },
    },
  };
}

/**
 * Convert OpenAPI schema to JSON string
 */
export function getOpenAPISchemaJSON(): string {
  return JSON.stringify(generateOpenAPISchema(), null, 2);
}
