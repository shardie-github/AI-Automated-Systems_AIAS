/**
 * API Documentation Generator
 * Scans API routes and generates documentation
 */

import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import { writeFile } from "fs/promises";

interface Endpoint {
  method: string;
  path: string;
  description?: string;
  auth?: boolean;
  params?: string[];
  response?: string;
}

/**
 * Scan API routes directory
 */
async function scanApiRoutes(dir: string = "app/api"): Promise<Endpoint[]> {
  const endpoints: Endpoint[] = [];

  async function scanDir(currentDir: string, basePath: string = ""): Promise<void> {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        await scanDir(fullPath, relativePath);
      } else if (entry.name === "route.ts" || entry.name === "route.tsx") {
        // Found an API route
        const content = await readFile(fullPath, "utf-8");
        const endpoint = parseRouteFile(content, relativePath);
        if (endpoint) {
          endpoints.push(endpoint);
        }
      }
    }
  }

  await scanDir(dir);
  return endpoints;
}

/**
 * Parse route file to extract endpoint info
 */
function parseRouteFile(content: string, path: string): Endpoint | null {
  // Extract HTTP methods
  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
  const foundMethods: string[] = [];

  for (const method of methods) {
    if (content.includes(`export async function ${method}`) || content.includes(`export function ${method}`)) {
      foundMethods.push(method);
    }
  }

  if (foundMethods.length === 0) {
    return null;
  }

  // Extract description from comments
  const commentMatch = content.match(/\/\*\*[\s\S]*?\*\//);
  let description: string | undefined;
  if (commentMatch) {
    description = commentMatch[0]
      .replace(/\/\*\*|\*\//g, "")
      .replace(/\*/g, "")
      .trim();
  }

  // Check for authentication
  const hasAuth = content.includes("getUser") || content.includes("auth") || content.includes("Unauthorized");

  // Extract path parameters
  const params: string[] = [];
  const paramMatches = path.match(/\[(\w+)\]/g);
  if (paramMatches) {
    paramMatches.forEach((match) => {
      params.push(match.replace(/[\[\]]/g, ""));
    });
  }

  // Use first method found (simplified)
  return {
    method: foundMethods[0],
    path: `/api${path.replace(/\/route\.tsx?$/, "").replace(/\/api/, "")}`,
    description,
    auth: hasAuth,
    params: params.length > 0 ? params : undefined,
  };
}

/**
 * Generate API documentation
 */
async function generateApiDocs(): Promise<void> {
  console.log("Scanning API routes...");
  const endpoints = await scanApiRoutes();

  console.log(`Found ${endpoints.length} endpoints`);

  // Generate markdown
  const markdown = `# API Documentation (Auto-Generated)

> **Note:** This documentation is auto-generated. Last updated: ${new Date().toISOString()}

## Endpoints

${endpoints
  .map(
    (endpoint) => `### ${endpoint.method} ${endpoint.path}

${endpoint.description || "No description available"}

${endpoint.auth ? "**Requires Authentication:** Yes" : "**Requires Authentication:** No"}

${endpoint.params ? `**Path Parameters:** ${endpoint.params.join(", ")}` : ""}

---
`
  )
  .join("\n")}

## Summary

- **Total Endpoints:** ${endpoints.length}
- **Authenticated Endpoints:** ${endpoints.filter((e) => e.auth).length}
- **Public Endpoints:** ${endpoints.filter((e) => !e.auth).length}
`;

  // Write to docs directory
  const outputPath = join(process.cwd(), "docs", "ai-generated", "api-docs.md");
  await writeFile(outputPath, markdown, "utf-8");

  console.log(`Documentation written to ${outputPath}`);
}

// Run if called directly
if (require.main === module) {
  generateApiDocs().catch(console.error);
}

export { generateApiDocs };
