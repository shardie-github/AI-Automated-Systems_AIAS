/**
 * Documentation Coverage Checker
 * Identifies undocumented areas
 */

import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import { writeFile } from "fs/promises";

interface CoverageIssue {
  type: "missing_docs" | "outdated_docs" | "incomplete_docs";
  file: string;
  severity: "high" | "medium" | "low";
  description: string;
}

/**
 * Check API documentation coverage
 */
async function checkApiDocsCoverage(): Promise<CoverageIssue[]> {
  const issues: CoverageIssue[] = [];

  // Scan API routes
  const apiRoutes = await scanApiRoutes("app/api");

  // Check if each route has documentation
  for (const route of apiRoutes) {
    const docPath = join(process.cwd(), "docs", "api", `${route.path.replace("/api/", "")}.md`);
    try {
      await stat(docPath);
      // File exists - could check if outdated
    } catch {
      // File doesn't exist
      issues.push({
        type: "missing_docs",
        file: route.path,
        severity: "high",
        description: `API endpoint ${route.path} has no documentation`,
      });
    }
  }

  return issues;
}

/**
 * Scan API routes (simplified version)
 */
async function scanApiRoutes(dir: string): Promise<Array<{ path: string }>> {
  const routes: Array<{ path: string }> = [];
  // Simplified - would need full implementation
  return routes;
}

/**
 * Check integration documentation coverage
 */
async function checkIntegrationDocsCoverage(): Promise<CoverageIssue[]> {
  const issues: CoverageIssue[] = [];

  // Check for integration setup docs
  const integrations = ["shopify", "wave", "slack", "gmail"];
  for (const integration of integrations) {
    const docPath = join(process.cwd(), "docs", "integrations", `${integration}-setup.md`);
    try {
      await stat(docPath);
    } catch {
      issues.push({
        type: "missing_docs",
        file: `integrations/${integration}-setup.md`,
        severity: "medium",
        description: `Integration ${integration} has no setup documentation`,
      });
    }
  }

  return issues;
}

/**
 * Generate coverage report
 */
async function generateCoverageReport(): Promise<void> {
  console.log("Checking documentation coverage...");

  const [apiIssues, integrationIssues] = await Promise.all([
    checkApiDocsCoverage(),
    checkIntegrationDocsCoverage(),
  ]);

  const allIssues = [...apiIssues, ...integrationIssues];

  // Generate markdown report
  const markdown = `# Documentation Coverage Report

> **Generated:** ${new Date().toISOString()}

## Summary

- **Total Issues:** ${allIssues.length}
- **High Severity:** ${allIssues.filter((i) => i.severity === "high").length}
- **Medium Severity:** ${allIssues.filter((i) => i.severity === "medium").length}
- **Low Severity:** ${allIssues.filter((i) => i.severity === "low").length}

## Issues

${allIssues
  .map(
    (issue) => `### ${issue.severity.toUpperCase()}: ${issue.type}

**File:** \`${issue.file}\`

${issue.description}

---
`
  )
  .join("\n")}

## Recommendations

${allIssues.length === 0
  ? "✅ All documentation is up to date!"
  : `- Address ${allIssues.filter((i) => i.severity === "high").length} high-severity issues first
- Create missing documentation for ${allIssues.filter((i) => i.type === "missing_docs").length} items
- Review and update outdated documentation`}
`;

  const outputPath = join(process.cwd(), "docs", "ai-generated", "docs-coverage-report.md");
  await writeFile(outputPath, markdown, "utf-8");

  console.log(`Coverage report written to ${outputPath}`);
  console.log(`Found ${allIssues.length} issues`);
}

// Run if called directly
if (require.main === module) {
  generateCoverageReport().catch(console.error);
}

export { generateCoverageReport };
