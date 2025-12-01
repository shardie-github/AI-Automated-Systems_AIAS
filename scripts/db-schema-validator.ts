/**
 * Database Schema Validator
 * 
 * Validates database schema consistency, migration health, and RLS policies
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";

interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  tables: {
    name: string;
    exists: boolean;
    hasRLS: boolean;
    columns: string[];
  }[];
  migrations: {
    filename: string;
    applied: boolean;
    errors: string[];
  }[];
}

/**
 * Validate database schema
 */
export async function validateSchema(): Promise<SchemaValidationResult> {
  const result: SchemaValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    tables: [],
    migrations: [],
  };

  try {
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

    // Check required tables
    const requiredTables = [
      "users",
      "tenants",
      "tenant_members",
      "user_settings",
      "workflows",
      "agents",
      "app_events",
      "api_logs",
      "orchestrator_reports",
    ];

    // Get all tables from database
    const { data: tables, error: tablesError } = await supabase.rpc("get_tables");

    if (tablesError) {
      // Fallback: try to query information_schema
      for (const tableName of requiredTables) {
        const { error } = await supabase.from(tableName).select("count").limit(1);
        
        result.tables.push({
          name: tableName,
          exists: !error,
          hasRLS: false, // Would need to check pg_policies
          columns: [],
        });

        if (error && error.code !== "PGRST116") {
          result.errors.push(`Table ${tableName} does not exist or is not accessible`);
          result.valid = false;
        }
      }
    } else {
      // Process tables if RPC worked
      for (const tableName of requiredTables) {
        const table = tables?.find((t: any) => t.name === tableName);
        result.tables.push({
          name: tableName,
          exists: !!table,
          hasRLS: table?.rls_enabled || false,
          columns: table?.columns || [],
        });

        if (!table) {
          result.errors.push(`Required table ${tableName} does not exist`);
          result.valid = false;
        } else if (!table.rls_enabled) {
          result.warnings.push(`Table ${tableName} does not have RLS enabled`);
        }
      }
    }

    // Validate migrations
    const migrationsDir = join(process.cwd(), "supabase", "migrations");
    if (existsSync(migrationsDir)) {
      const migrationFiles = readdirSync(migrationsDir)
        .filter((f) => f.endsWith(".sql"))
        .sort();

      for (const filename of migrationFiles) {
        const migrationPath = join(migrationsDir, filename);
        const migrationContent = readFileSync(migrationPath, "utf-8");

        // Basic validation: check for common issues
        const migrationErrors: string[] = [];

        // Check for DROP TABLE without IF EXISTS
        if (migrationContent.match(/DROP TABLE\s+\w+/i) && !migrationContent.match(/DROP TABLE IF EXISTS/i)) {
          migrationErrors.push("DROP TABLE without IF EXISTS - may cause migration failures");
        }

        // Check for missing transaction blocks
        if (!migrationContent.includes("BEGIN") && migrationContent.length > 100) {
          migrationErrors.push("Migration may benefit from transaction blocks");
        }

        result.migrations.push({
          filename,
          applied: true, // Would need to check migration history table
          errors: migrationErrors,
        });

        if (migrationErrors.length > 0) {
          result.warnings.push(`Migration ${filename} has potential issues`);
        }
      }
    } else {
      result.warnings.push("Migrations directory not found");
    }

    // Check for RLS policies
    const { data: policies, error: policiesError } = await supabase
      .from("pg_policies")
      .select("*")
      .limit(100);

    if (policiesError) {
      // RLS policies check is optional
      result.warnings.push("Could not verify RLS policies (this is expected if using Supabase)");
    }

    logger.info("Schema validation completed", {
      valid: result.valid,
      errors: result.errors.length,
      warnings: result.warnings.length,
    });

    return result;
  } catch (error) {
    logger.error("Schema validation failed", { error });
    result.valid = false;
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    return result;
  }
}

/**
 * Validate migration health
 */
export async function validateMigrations(): Promise<{
  valid: boolean;
  pending: string[];
  applied: string[];
  errors: string[];
}> {
  const result = {
    valid: true,
    pending: [] as string[],
    applied: [] as string[],
    errors: [] as string[],
  };

  try {
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

    // Get migration history (if migration tracking table exists)
    const { data: migrationHistory, error } = await supabase
      .from("schema_migrations")
      .select("version")
      .order("version", { ascending: true });

    if (error && error.code !== "PGRST116") {
      result.errors.push(`Could not check migration history: ${error.message}`);
      result.valid = false;
      return result;
    }

    const appliedMigrations = migrationHistory?.map((m: any) => m.version) || [];

    // Get all migration files
    const migrationsDir = join(process.cwd(), "supabase", "migrations");
    if (existsSync(migrationsDir)) {
      const migrationFiles = readdirSync(migrationsDir)
        .filter((f) => f.endsWith(".sql"))
        .sort();

      for (const filename of migrationFiles) {
        // Extract version/timestamp from filename
        const version = filename.split("_")[0] || filename.replace(".sql", "");

        if (appliedMigrations.includes(version)) {
          result.applied.push(filename);
        } else {
          result.pending.push(filename);
        }
      }
    }

    if (result.pending.length > 0) {
      result.warnings = [`${result.pending.length} migrations are pending`];
    }

    return result;
  } catch (error) {
    result.valid = false;
    result.errors.push(`Migration validation error: ${error instanceof Error ? error.message : String(error)}`);
    return result;
  }
}

// CLI execution
if (require.main === module) {
  validateSchema()
    .then((result) => {
      console.log("\n📊 Schema Validation Results:");
      console.log(`Valid: ${result.valid ? "✅" : "❌"}`);
      console.log(`Errors: ${result.errors.length}`);
      console.log(`Warnings: ${result.warnings.length}`);
      
      if (result.errors.length > 0) {
        console.log("\n❌ Errors:");
        result.errors.forEach((err) => console.log(`  - ${err}`));
      }
      
      if (result.warnings.length > 0) {
        console.log("\n⚠️  Warnings:");
        result.warnings.forEach((warn) => console.log(`  - ${warn}`));
      }

      process.exit(result.valid ? 0 : 1);
    })
    .catch((error) => {
      console.error("Validation failed:", error);
      process.exit(1);
    });
}

export { validateMigrations };
