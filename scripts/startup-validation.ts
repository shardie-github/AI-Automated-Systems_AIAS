/**
 * Startup Validation Script
 * 
 * Run this script to validate system startup before deployment
 */

import { validateStartupOrExit } from "@/lib/observability/startup-validation";

// Run validation
validateStartupOrExit().catch((error) => {
  console.error("Startup validation failed:", error);
  process.exit(1);
});
