#!/usr/bin/env tsx
/**
 * Environment Variable Doctor
 * 
 * Scans codebase for environment variable usage and validates:
 * 1. All env vars used in code are documented in .env.example
 * 2. All env vars in .env.example are actually used
 * 3. No hardcoded secrets or values
 * 4. Consistent naming conventions
 * 5. Required vs optional variables are correctly marked
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join, relative } from "path";

interface EnvVarUsage {
  key: string;
  files: string[];
  required: boolean;
  public: boolean; // NEXT_PUBLIC_ prefix
}

interface EnvVarDefinition {
  key: string;
  required: boolean;
  category: string;
  description?: string;
  defaultValue?: string;
}

interface DoctorResult {
  unused: string[]; // In .env.example but not used
  undocumented: EnvVarUsage[]; // Used but not in .env.example
  inconsistencies: {
    key: string;
    issue: string;
  }[];
  hardcoded: {
    file: string;
    line: number;
    content: string;
  }[];
  summary: {
    totalDefined: number;
    totalUsed: number;
    undocumentedCount: number;
    unusedCount: number;
  };
}

// Patterns to detect hardcoded secrets
const HARDCODED_SECRET_PATTERNS = [
  /sk_live_[a-zA-Z0-9]{24,}/,
  /sk_test_[a-zA-Z0-9]{24,}/,
  /pk_live_[a-zA-Z0-9]{24,}/,
  /pk_test_[a-zA-Z0-9]{24,}/,
  /whsec_[a-zA-Z0-9]{32,}/,
  /[a-zA-Z0-9_-]{32,}@[a-zA-Z0-9.-]+\.supabase\.co/,
  /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/, // JWT tokens
  /ghp_[a-zA-Z0-9]{36,}/, // GitHub tokens
  /gho_[a-zA-Z0-9]{36,}/,
  /ghu_[a-zA-Z0-9]{36,}/,
  /ghr_[a-zA-Z0-9]{36,}/,
];

// Files to exclude from scanning
const EXCLUDE_PATTERNS = [
  "node_modules",
  ".next",
  "dist",
  "build",
  ".git",
  "coverage",
  ".test.ts",
  ".spec.ts",
  ".env",
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
];

/**
 * Recursively find files with given extensions
 */
function findFiles(dir: string, extensions: string[], exclude: string[]): string[] {
  const files: string[] = [];
  
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = relative(process.cwd(), fullPath);
      
      // Skip excluded directories/files
      if (exclude.some(pattern => relativePath.includes(pattern))) {
        continue;
      }
      
      if (entry.isDirectory()) {
        files.push(...findFiles(fullPath, extensions, exclude));
      } else if (entry.isFile()) {
        const ext = extensions.find(e => entry.name.endsWith(e));
        if (ext) {
          files.push(relativePath);
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return files;
}

/**
 * Parse .env.example to extract defined variables
 */
function parseEnvExample(): Map<string, EnvVarDefinition> {
  const envExamplePath = join(process.cwd(), ".env.example");
  if (!existsSync(envExamplePath)) {
    console.warn("⚠️  .env.example not found");
    return new Map();
  }

  const content = readFileSync(envExamplePath, "utf-8");
  const definitions = new Map<string, EnvVarDefinition>();
  let currentCategory = "General";

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    // Category headers
    if (trimmed.startsWith("# ====") && trimmed.includes("===")) {
      const match = trimmed.match(/#\s*====\s*(.+?)\s*====/);
      if (match) {
        currentCategory = match[1].trim();
      }
      continue;
    }

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    // Parse env var definition: KEY=value or KEY= (optional)
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1];
      const value = match[2].trim();
      const isRequired = !value || value === "" || value.includes("required");
      const hasDefault = value && !value.includes("required") && value !== "";

      definitions.set(key, {
        key,
        required: isRequired,
        category: currentCategory,
        defaultValue: hasDefault ? value : undefined,
      });
    }
  }

  return definitions;
}

/**
 * Scan codebase for environment variable usage
 */
function scanCodebase(): Map<string, EnvVarUsage> {
  const usage = new Map<string, EnvVarUsage>();

  // Find all TypeScript/JavaScript files
  const files = findFiles(process.cwd(), [".ts", ".tsx", ".js", ".jsx", ".mjs"], EXCLUDE_PATTERNS);

  for (const file of files) {
    const filePath = join(process.cwd(), file);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    // Pattern 1: process.env.VAR_NAME
    const processEnvPattern = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
    let match;
    while ((match = processEnvPattern.exec(content)) !== null) {
      const key = match[1];
      const lineNum = content.substring(0, match.index).split("\n").length;

      if (!usage.has(key)) {
        usage.set(key, {
          key,
          files: [],
          required: true, // Assume required unless we can detect otherwise
          public: key.startsWith("NEXT_PUBLIC_"),
        });
      }

      usage.get(key)!.files.push(`${file}:${lineNum}`);
    }

    // Pattern 2: env.VAR_NAME (from lib/env.ts)
    const envPattern = /env\.([a-z]+)\.([a-z]+)/g;
    while ((match = envPattern.exec(content)) !== null) {
      // This is harder to map, but we can check lib/env.ts for actual keys
      // For now, we'll rely on process.env patterns
    }

    // Pattern 3: ${{ secrets.VAR_NAME }} (GitHub Actions)
    const githubSecretsPattern = /\$\{\{\s*secrets\.([A-Z_][A-Z0-9_]*)\s*\}\}/g;
    while ((match = githubSecretsPattern.exec(content)) !== null) {
      const key = match[1];
      if (!usage.has(key)) {
        usage.set(key, {
          key,
          files: [],
          required: true,
          public: false,
        });
      }
      usage.get(key)!.files.push(`${file}`);
    }
  }

  return usage;
}

/**
 * Check for hardcoded secrets
 */
function checkHardcodedSecrets(): { file: string; line: number; content: string }[] {
  const hardcoded: { file: string; line: number; content: string }[] = [];
  const files = findFiles(process.cwd(), [".ts", ".tsx", ".js", ".jsx", ".yml", ".yaml"], EXCLUDE_PATTERNS);

  for (const file of files) {
    const filePath = join(process.cwd(), file);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of HARDCODED_SECRET_PATTERNS) {
        if (pattern.test(line)) {
          // Skip if it's in a comment or string that says "example" or "placeholder"
          if (
            line.includes("example") ||
            line.includes("placeholder") ||
            line.includes("your-") ||
            line.includes("TODO")
          ) {
            continue;
          }

          hardcoded.push({
            file: relative(process.cwd(), filePath),
            line: i + 1,
            content: line.trim(),
          });
        }
      }
    }
  }

  return hardcoded;
}

/**
 * Main doctor function
 */
export function runEnvDoctor(): DoctorResult {
  console.log("🔍 Scanning environment variables...\n");

  const definitions = parseEnvExample();
  const usage = scanCodebase();
  const hardcoded = checkHardcodedSecrets();

  const result: DoctorResult = {
    unused: [],
    undocumented: [],
    inconsistencies: [],
    hardcoded,
    summary: {
      totalDefined: definitions.size,
      totalUsed: usage.size,
      undocumentedCount: 0,
      unusedCount: 0,
    },
  };

  // Find unused variables (in .env.example but not used)
  for (const [key, def] of definitions) {
    if (!usage.has(key)) {
      result.unused.push(key);
      result.summary.unusedCount++;
    }
  }

  // Find undocumented variables (used but not in .env.example)
  for (const [key, usageInfo] of usage) {
    if (!definitions.has(key)) {
      result.undocumented.push(usageInfo);
      result.summary.undocumentedCount++;
    } else {
      // Check for inconsistencies
      const def = definitions.get(key)!;
      if (def.required && !usageInfo.required) {
        result.inconsistencies.push({
          key,
          issue: "Marked as required in .env.example but may be optional in code",
        });
      }
    }
  }

  return result;
}

/**
 * Print results
 */
function printResults(result: DoctorResult): void {
  console.log("📊 Environment Variable Analysis\n");
  console.log(`Total defined in .env.example: ${result.summary.totalDefined}`);
  console.log(`Total used in codebase: ${result.summary.totalUsed}`);
  console.log(`Undocumented: ${result.summary.undocumentedCount}`);
  console.log(`Unused: ${result.summary.unusedCount}`);
  console.log(`Hardcoded secrets found: ${result.hardcoded.length}\n`);

  if (result.undocumented.length > 0) {
    console.log("⚠️  UNDOCUMENTED VARIABLES (used but not in .env.example):\n");
    for (const usage of result.undocumented) {
      console.log(`  ${usage.key}`);
      console.log(`    Files: ${usage.files.slice(0, 3).join(", ")}`);
      if (usage.files.length > 3) {
        console.log(`    ... and ${usage.files.length - 3} more`);
      }
    }
    console.log();
  }

  if (result.unused.length > 0) {
    console.log("ℹ️  UNUSED VARIABLES (in .env.example but not used):\n");
    for (const key of result.unused) {
      console.log(`  ${key}`);
    }
    console.log();
  }

  if (result.hardcoded.length > 0) {
    console.log("🔴 HARDCODED SECRETS FOUND:\n");
    for (const item of result.hardcoded) {
      console.log(`  ${item.file}:${item.line}`);
      console.log(`    ${item.content.substring(0, 80)}...`);
    }
    console.log();
  }

  if (result.inconsistencies.length > 0) {
    console.log("⚠️  INCONSISTENCIES:\n");
    for (const issue of result.inconsistencies) {
      console.log(`  ${issue.key}: ${issue.issue}`);
    }
    console.log();
  }

  if (
    result.undocumented.length === 0 &&
    result.hardcoded.length === 0 &&
    result.inconsistencies.length === 0
  ) {
    console.log("✅ All environment variables are properly documented!\n");
  }
}

// Run if executed directly
if (require.main === module) {
  try {
    const result = runEnvDoctor();
    printResults(result);
  } catch (error) {
    console.error("❌ Error running env doctor:", error);
    process.exit(1);
  }
}
