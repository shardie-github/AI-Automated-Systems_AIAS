import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { logger } from "@/lib/logging/structured-logger";

export const runtime = 'nodejs'; // Requires Node.js runtime for fs operations
export const dynamic = "force-dynamic";

/**
 * GET /api/flags/trust
 * Get trust-related feature flags
 */
export async function GET() {
  try {
    // Try to read from feature flags file
    const flagsPath = join(process.cwd(), "featureflags", "flags.json");
    
    if (existsSync(flagsPath)) {
      const flags = JSON.parse(readFileSync(flagsPath, "utf-8"));
      
      // Extract trust-related flags
      const trustFlags = {
        trust_audit_enabled: flags.trust_audit_enabled ?? true,
        trust_ledger_enabled: flags.trust_ledger_enabled ?? true,
        trust_scoring_enabled: flags.trust_scoring_enabled ?? false,
        trust_badges_enabled: flags.trust_badges_enabled ?? true,
        trust_verification_enabled: flags.trust_verification_enabled ?? false,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(trustFlags);
    }

    // Default trust flags
    return NextResponse.json({
      trust_audit_enabled: true,
      trust_ledger_enabled: true,
      trust_scoring_enabled: false,
      trust_badges_enabled: true,
      trust_verification_enabled: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error in GET /api/flags/trust", { error });
    return NextResponse.json(
      { error: "Failed to retrieve trust flags" },
      { status: 500 }
    );
  }
}
