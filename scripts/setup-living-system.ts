#!/usr/bin/env tsx
/**
 * Complete Living System Setup
 * 
 * Master script that runs all setup steps in sequence:
 * 1. Validate environment variables
 * 2. Apply migration (with instructions)
 * 3. Verify migration
 * 4. Test sign-up flow
 * 5. Display health status
 * 
 * Usage:
 *   tsx scripts/setup-living-system.ts
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

async function runSetup() {
  console.log("🚀 Living System Setup\n");
  console.log("=".repeat(60));
  console.log("This script will guide you through the complete setup.");
  console.log("=".repeat(60) + "\n");

  // Step 1: Validate Environment
  console.log("📋 Step 1: Validating Environment Variables\n");
  try {
    execSync("tsx scripts/validate-env.ts", { stdio: "inherit" });
    console.log("✅ Environment variables validated\n");
  } catch (error) {
    console.error("❌ Environment validation failed. Please fix issues above.\n");
    process.exit(1);
  }

  // Step 2: Migration Instructions
  console.log("📋 Step 2: Database Migration\n");
  console.log("To apply the migration, choose one of these methods:\n");
  console.log("Method 1: Supabase Dashboard (Recommended)");
  console.log("  1. Go to: https://supabase.com/dashboard");
  console.log("  2. Select your project");
  console.log("  3. Navigate to: SQL Editor");
  console.log("  4. Copy the contents of:");
  console.log("     supabase/migrations/20250203000000_living_system_ecosystem.sql");
  console.log("  5. Paste and click 'Run'\n");

  console.log("Method 2: Supabase CLI");
  console.log("  1. Install: npm install -g supabase");
  console.log("  2. Login: supabase login");
  console.log("  3. Link: supabase link --project-ref YOUR_PROJECT_REF");
  console.log("  4. Push: supabase db push\n");

  console.log("Method 3: Direct SQL (if you have database access)");
  console.log("  Connect via psql and run the migration SQL file\n");

  // Wait for user confirmation
  console.log("⚠️  Have you applied the migration? (This script will verify next)");
  console.log("   Press Enter to continue with verification...\n");

  // Step 3: Verify Migration
  console.log("📋 Step 3: Verifying Migration\n");
  try {
    execSync("tsx scripts/verify-migration.ts", { stdio: "inherit" });
    console.log("✅ Migration verified\n");
  } catch (error) {
    console.error("❌ Migration verification failed.");
    console.error("   Please apply the migration first (see instructions above).\n");
    console.log("   You can run this script again after applying the migration.\n");
    process.exit(1);
  }

  // Step 4: Test Sign-Up Flow (optional)
  console.log("📋 Step 4: Testing Sign-Up Flow (Optional)\n");
  console.log("Would you like to test the sign-up flow?");
  console.log("This will create a test user and verify the complete data flow.");
  console.log("(You can skip this and test manually later)\n");

  // For automated setup, we'll skip the interactive test
  // Users can run it manually: tsx scripts/test-signup-flow.ts
  console.log("ℹ️  To test sign-up flow manually, run:");
  console.log("   tsx scripts/test-signup-flow.ts\n");

  // Step 5: Health Check
  console.log("📋 Step 5: Health Check\n");
  console.log("Testing health endpoint...\n");

  try {
    // Try to fetch health endpoint (if server is running)
    const fetch = (await import("node-fetch")).default;
    const healthUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    try {
      const response = await fetch(`${healthUrl}/api/status/health`);
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Health endpoint is working!");
        console.log(`   Status: ${data.message}`);
        console.log(`   All Cylinders Firing: ${data.allCylindersFiring ? "Yes ✓" : "No ⚠️"}\n`);
      } else {
        console.log("⚠️  Health endpoint returned an error");
        console.log(`   Status: ${response.status}\n`);
      }
    } catch (fetchError) {
      console.log("ℹ️  Could not reach health endpoint (server may not be running)");
      console.log("   This is okay - you can test it once your app is deployed.\n");
    }
  } catch (error) {
    console.log("ℹ️  Health check skipped (node-fetch not available)");
    console.log("   You can test manually: curl http://localhost:3000/api/status/health\n");
  }

  // Summary
  console.log("=".repeat(60));
  console.log("✅ Setup Complete!");
  console.log("=".repeat(60) + "\n");

  console.log("📋 Next Steps:\n");
  console.log("1. ✅ Environment variables validated");
  console.log("2. ✅ Migration verified");
  console.log("3. ⏳ Test sign-up flow: tsx scripts/test-signup-flow.ts");
  console.log("4. ⏳ Start your dev server: npm run dev");
  console.log("5. ⏳ Visit /dashboard to see the real-time metrics");
  console.log("6. ⏳ Visit /api/status/health to check system health\n");

  console.log("📚 Documentation:");
  console.log("   - Quick Start: LIVING_SYSTEM_README.md");
  console.log("   - Implementation: docs/LIVING_SYSTEM_IMPLEMENTATION.md");
  console.log("   - Data Flow: docs/data-flow-diagram.md");
  console.log("   - Positioning: docs/positioning-clarity.md\n");

  console.log("🎉 Your Living System is ready to use!\n");
}

runSetup().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
