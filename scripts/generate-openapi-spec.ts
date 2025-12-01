#!/usr/bin/env tsx
/**
 * Generate Complete OpenAPI Specification
 * Scans all API routes and generates comprehensive OpenAPI 3.0 spec
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "fs";
import { join, relative } from "path";

interface RouteInfo {
  path: string;
  methods: string[];
  description?: string;
  authRequired?: boolean;
  requestBody?: any;
  responses?: any;
}

function findRoutes(dir: string, basePath: string = ""): RouteInfo[] {
  const routes: RouteInfo[] = [];
  
  if (!existsSync(dir)) {
    return routes;
  }

  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Handle dynamic routes [id]
      const segment = entry.name.startsWith("[") && entry.name.endsWith("]")
        ? `{${entry.name.slice(1, -1)}}`
        : entry.name;
      
      const newBasePath = basePath ? `${basePath}/${segment}` : segment;
      routes.push(...findRoutes(fullPath, newBasePath));
    } else if (entry.name === "route.ts" || entry.name === "route.js") {
      const routePath = basePath || "/";
      const content = readFileSync(fullPath, "utf-8");
      const methods = extractMethods(content);
      const info = extractRouteInfo(content, routePath);
      
      routes.push({
        path: `/api${routePath}`,
        methods,
        ...info,
      });
    }
  }
  
  return routes;
}

function extractMethods(content: string): string[] {
  const methods: string[] = [];
  
  if (content.includes("export async function GET") || content.includes("export const GET")) {
    methods.push("get");
  }
  if (content.includes("export async function POST") || content.includes("export const POST")) {
    methods.push("post");
  }
  if (content.includes("export async function PUT") || content.includes("export const PUT")) {
    methods.push("put");
  }
  if (content.includes("export async function DELETE") || content.includes("export const DELETE")) {
    methods.push("delete");
  }
  if (content.includes("export async function PATCH") || content.includes("export const PATCH")) {
    methods.push("patch");
  }
  
  return methods.length > 0 ? methods : ["get"];
}

function extractRouteInfo(content: string, path: string): Partial<RouteInfo> {
  const info: Partial<RouteInfo> = {};
  
  // Extract description from comments
  const commentMatch = content.match(/\/\*\*[\s\S]*?\*\//);
  if (commentMatch) {
    const comment = commentMatch[0];
    const descMatch = comment.match(/\*\s*(.+)/);
    if (descMatch) {
      info.description = descMatch[1].trim();
    }
  }
  
  // Check for auth requirement
  info.authRequired = !content.includes("requireAuth: false") && 
                      !content.includes("security: []");
  
  // Extract schema information
  const schemaMatch = content.match(/(z\.object|zod\.object)\([\s\S]*?\)/);
  if (schemaMatch) {
    // Basic schema detection
    info.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            description: "Request body schema",
          },
        },
      },
    };
  }
  
  return info;
}

function generateOpenAPISpec(routes: RouteInfo[]): string {
  const paths: Record<string, any> = {};
  
  for (const route of routes) {
    if (!paths[route.path]) {
      paths[route.path] = {};
    }
    
    for (const method of route.methods) {
      const operation: any = {
        tags: [getTag(route.path)],
        summary: route.description || `${method.toUpperCase()} ${route.path}`,
        operationId: `${method}_${route.path.replace(/[^a-zA-Z0-9]/g, "_")}`,
      };
      
      if (route.authRequired) {
        operation.security = [{ bearerAuth: [] }];
      }
      
      if (route.requestBody) {
        operation.requestBody = route.requestBody;
      }
      
      operation.responses = {
        "200": {
          description: "Success",
          content: {
            "application/json": {
              schema: {
                type: "object",
              },
            },
          },
        },
        "400": {
          description: "Bad Request",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        "401": {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        "500": {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      };
      
      paths[route.path][method] = operation;
    }
  }
  
  return JSON.stringify({
    openapi: "3.0.3",
    info: {
      title: "AIAS Platform API",
      description: "Enterprise-grade AI consultancy platform API",
      version: "1.0.0",
      contact: {
        name: "AIAS Platform Support",
        email: "support@aias-platform.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "https://aias-platform.com/api",
        description: "Production",
      },
      {
        url: "http://localhost:3000/api",
        description: "Development",
      },
    ],
    tags: [
      { name: "Health", description: "Health and status endpoints" },
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Settings", description: "User settings management" },
      { name: "Workflows", description: "Workflow automation management" },
      { name: "Agents", description: "AI agent management" },
      { name: "Telemetry", description: "Telemetry and analytics" },
      { name: "Leads", description: "Lead generation endpoints" },
      { name: "Billing", description: "Billing and subscriptions" },
      { name: "Admin", description: "Admin endpoints" },
      { name: "Integrations", description: "Third-party integrations" },
    ],
    paths,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
            message: {
              type: "string",
              description: "Detailed error message",
            },
            details: {
              type: "object",
              description: "Additional error details",
            },
          },
        },
        HealthCheck: {
          type: "object",
          properties: {
            ok: {
              type: "boolean",
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
            db: {
              type: "object",
              properties: {
                ok: { type: "boolean" },
                latency_ms: { type: "number" },
              },
            },
          },
        },
      },
    },
  }, null, 2);
}

function getTag(path: string): string {
  if (path.includes("/health")) return "Health";
  if (path.includes("/auth")) return "Auth";
  if (path.includes("/settings")) return "Settings";
  if (path.includes("/workflows")) return "Workflows";
  if (path.includes("/agents")) return "Agents";
  if (path.includes("/telemetry")) return "Telemetry";
  if (path.includes("/leads")) return "Leads";
  if (path.includes("/billing") || path.includes("/stripe")) return "Billing";
  if (path.includes("/admin")) return "Admin";
  if (path.includes("/integrations")) return "Integrations";
  return "General";
}

function main() {
  const apiDir = join(process.cwd(), "app/api");
  const routes = findRoutes(apiDir);
  
  console.log(`Found ${routes.length} API routes`);
  
  const spec = generateOpenAPISpec(routes);
  const outputPath = join(process.cwd(), "docs/openapi-complete.yaml");
  
  writeFileSync(outputPath, spec);
  console.log(`✅ OpenAPI spec generated: ${outputPath}`);
}

if (require.main === module) {
  main();
}
