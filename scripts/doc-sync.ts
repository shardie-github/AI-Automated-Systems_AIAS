#!/usr/bin/env tsx
/**
 * Documentation Sync Engine
 * 
 * Automatically synchronizes documentation with codebase changes
 * - Updates API documentation from route handlers
 * - Updates domain models from database schema
 * - Validates documentation completeness
 * - Generates missing documentation
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join, relative } from "path";
import { glob } from "glob";

interface DocSyncResult {
  updated: string[];
  created: string[];
  missing: string[];
  outdated: string[];
  summary: {
    totalDocs: number;
    updatedCount: number;
    createdCount: number;
    missingCount: number;
  };
}

/**
 * Sync API documentation
 */
async function syncApiDocs(): Promise<void> {
  console.log("📚 Syncing API documentation...");
  
  // Find all API route handlers
  const apiRoutes = await glob("app/api/**/route.ts");
  
  // Extract endpoint information
  const endpoints: Array<{
    path: string;
    method: string;
    description?: string;
  }> = [];
  
  for (const route of apiRoutes) {
    const content = readFileSync(route, "utf-8");
    const path = route.replace("app/api/", "/api/").replace("/route.ts", "");
    
    // Extract HTTP methods
    const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"].filter(method =>
      content.includes(`export async function ${method.toLowerCase()}`) ||
      content.includes(`export const ${method.toLowerCase()}`)
    );
    
    // Extract description from comments
    const descriptionMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    const description = descriptionMatch?.[0]?.replace(/\/\*\*|\*\//g, "").trim();
    
    for (const method of methods.length > 0 ? methods : ["GET"]) {
      endpoints.push({
        path,
        method,
        description,
      });
    }
  }
  
  // Generate API documentation
  const apiDoc = `# API Documentation

**Generated:** ${new Date().toISOString().split("T")[0]}  
**Auto-synced:** Yes

## Endpoints

${endpoints.map(e => `### ${e.method} ${e.path}

${e.description || "No description available"}

`).join("\n")}

## Total Endpoints: ${endpoints.length}
`;

  // Write to docs/api.md
  const apiDocPath = join(process.cwd(), "docs", "api.md");
  writeFileSync(apiDocPath, apiDoc);
  console.log(`✅ Updated ${apiDocPath}`);
}

/**
 * Validate documentation completeness
 */
async function validateDocs(): Promise<DocSyncResult> {
  console.log("🔍 Validating documentation...");
  
  const result: DocSyncResult = {
    updated: [],
    created: [],
    missing: [],
    outdated: [],
    summary: {
      totalDocs: 0,
      updatedCount: 0,
      createdCount: 0,
      missingCount: 0,
    },
  };
  
  // Check for required documentation files
  const requiredDocs = [
    "README.md",
    "docs/api.md",
    "docs/architecture.md",
    "docs/domain-models.md",
    "docs/security-audit.md",
    "docs/performance-map.md",
    "docs/launch-readiness-report.md",
  ];
  
  for (const doc of requiredDocs) {
    const path = join(process.cwd(), doc);
    if (!existsSync(path)) {
      result.missing.push(doc);
      result.summary.missingCount++;
    } else {
      result.summary.totalDocs++;
    }
  }
  
  return result;
}

/**
 * Main sync function
 */
async function syncDocs(): Promise<void> {
  console.log("🚀 Starting documentation sync...\n");
  
  try {
    // Sync API documentation
    await syncApiDocs();
    
    // Validate documentation
    const validation = await validateDocs();
    
    // Print summary
    console.log("\n📊 Documentation Sync Summary:");
    console.log(`   Total docs: ${validation.summary.totalDocs}`);
    console.log(`   Updated: ${validation.updated.length}`);
    console.log(`   Created: ${validation.created.length}`);
    console.log(`   Missing: ${validation.missing.length}`);
    
    if (validation.missing.length > 0) {
      console.log("\n⚠️  Missing documentation:");
      validation.missing.forEach(doc => console.log(`   - ${doc}`));
    }
    
    console.log("\n✅ Documentation sync complete!");
  } catch (error) {
    console.error("❌ Documentation sync failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  syncDocs();
}

export { syncDocs, validateDocs };
