/**
 * Startup Validation
 * 
 * Validates environment variables, database connectivity, and system health at startup
 */

import { validateEnvOnStartup } from "@/lib/env-validation";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { initializeOpenTelemetry } from "./opentelemetry";

interface StartupValidationResult {
  success: boolean;
  checks: {
    environment: boolean;
    database: boolean;
    auth: boolean;
    storage: boolean;
    observability: boolean;
  };
  errors: string[];
  warnings: string[];
}

/**
 * Validate environment variables at startup
 */
function validateEnvironment(): { success: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    validateEnvOnStartup();
    return { success: true, errors: [] };
  } catch (error) {
    errors.push(`Environment validation failed: ${error instanceof Error ? error.message : String(error)}`);
    return { success: false, errors };
  }
}

/**
 * Validate database connectivity
 */
async function validateDatabase(): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  try {
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
    const { error } = await supabase.from("app_events").select("count").limit(1);

    if (error) {
      errors.push(`Database connectivity check failed: ${error.message}`);
      return { success: false, errors };
    }

    return { success: true, errors: [] };
  } catch (error) {
    errors.push(`Database validation error: ${error instanceof Error ? error.message : String(error)}`);
    return { success: false, errors };
  }
}

/**
 * Validate authentication service
 */
async function validateAuth(): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  try {
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
    const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

    if (error) {
      errors.push(`Auth service check failed: ${error.message}`);
      return { success: false, errors };
    }

    return { success: true, errors: [] };
  } catch (error) {
    errors.push(`Auth validation error: ${error instanceof Error ? error.message : String(error)}`);
    return { success: false, errors };
  }
}

/**
 * Validate storage service
 */
async function validateStorage(): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
  const warnings: string[] = [];

  try {
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
    const { error } = await supabase.storage.listBuckets();

    if (error) {
      warnings.push(`Storage service check failed (non-critical): ${error.message}`);
      return { success: true, errors: [], warnings }; // Storage is optional
    }

    return { success: true, errors: [], warnings: [] };
  } catch (error) {
    warnings.push(`Storage validation warning: ${error instanceof Error ? error.message : String(error)}`);
    return { success: true, errors: [], warnings }; // Storage is optional
  }
}

/**
 * Initialize observability
 */
function validateObservability(): { success: boolean; errors: string[]; warnings: string[] } {
  const warnings: string[] = [];

  try {
    const otel = initializeOpenTelemetry();

    if (!otel) {
      warnings.push("OpenTelemetry not initialized (ENABLE_OTEL=false or OTEL_EXPORTER_OTLP_ENDPOINT not set)");
      return { success: true, errors: [], warnings }; // Observability is optional
    }

    return { success: true, errors: [], warnings: [] };
  } catch (error) {
    warnings.push(`Observability initialization warning: ${error instanceof Error ? error.message : String(error)}`);
    return { success: true, errors: [], warnings }; // Observability is optional
  }
}

/**
 * Run all startup validations
 */
export async function validateStartup(): Promise<StartupValidationResult> {
  const result: StartupValidationResult = {
    success: true,
    checks: {
      environment: false,
      database: false,
      auth: false,
      storage: false,
      observability: false,
    },
    errors: [],
    warnings: [],
  };

  logger.info("Starting startup validation...");

  // 1. Validate environment
  const envCheck = validateEnvironment();
  result.checks.environment = envCheck.success;
  result.errors.push(...envCheck.errors);
  if (!envCheck.success) {
    result.success = false;
  }

  // 2. Validate database (only if environment is valid)
  if (envCheck.success) {
    const dbCheck = await validateDatabase();
    result.checks.database = dbCheck.success;
    result.errors.push(...dbCheck.errors);
    if (!dbCheck.success) {
      result.success = false;
    }
  }

  // 3. Validate auth (only if database is valid)
  if (result.checks.database) {
    const authCheck = await validateAuth();
    result.checks.auth = authCheck.success;
    result.errors.push(...authCheck.errors);
    if (!authCheck.success) {
      result.success = false;
    }
  }

  // 4. Validate storage (optional)
  const storageCheck = await validateStorage();
  result.checks.storage = storageCheck.success;
  result.errors.push(...storageCheck.errors);
  result.warnings.push(...storageCheck.warnings);

  // 5. Initialize observability (optional)
  const obsCheck = validateObservability();
  result.checks.observability = obsCheck.success;
  result.errors.push(...obsCheck.errors);
  result.warnings.push(...obsCheck.warnings);

  // Log results
  if (result.success) {
    logger.info("Startup validation passed", {
      checks: result.checks,
      warnings: result.warnings.length,
    });
  } else {
    const errorObj = new Error("Startup validation failed");
    logger.error("Startup validation failed", errorObj, {
      checks: result.checks,
      errors: result.errors,
      warnings: result.warnings,
    });
  }

  return result;
}

/**
 * Validate startup and exit if critical checks fail
 */
export async function validateStartupOrExit(): Promise<void> {
  const result = await validateStartup();

  if (!result.success) {
    console.error("\n❌ Startup validation failed:");
    result.errors.forEach((error) => console.error(`  - ${error}`));

    if (result.warnings.length > 0) {
      console.warn("\n⚠️  Warnings:");
      result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
    }

    console.error("\nPlease fix the errors above and restart the application.");
    process.exit(1);
  }

  if (result.warnings.length > 0) {
    console.warn("\n⚠️  Startup warnings:");
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  console.log("\n✅ Startup validation passed");
}
