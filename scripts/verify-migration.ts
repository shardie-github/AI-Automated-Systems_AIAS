#!/usr/bin/env tsx
/**
 * Verify Living System Migration
 * 
 * Verifies that all migration objects (tables, views, functions) exist.
 * 
 * Usage:
 *   tsx scripts/verify-migration.ts
 */

import { createClient } from "@supabase/supabase-js";

async function verifyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing required environment variables");
    process.exit(1);
  }

  console.log("🔍 Verifying Living System Migration...\n");

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const checks = [
    {
      name: "activity_log table",
      test: async () => {
        const { data, error } = await supabase
          .from("activity_log")
          .select("id")
          .limit(1);
        return !error;
      },
    },
    {
      name: "positioning_feedback table",
      test: async () => {
        const { data, error } = await supabase
          .from("positioning_feedback")
          .select("id")
          .limit(1);
        return !error;
      },
    },
    {
      name: "kpi_new_users_week view",
      test: async () => {
        const { data, error } = await supabase
          .from("kpi_new_users_week")
          .select("*")
          .single();
        return !error;
      },
    },
    {
      name: "kpi_avg_post_views view",
      test: async () => {
        const { data, error } = await supabase
          .from("kpi_avg_post_views")
          .select("*")
          .single();
        return !error;
      },
    },
    {
      name: "kpi_actions_last_hour view",
      test: async () => {
        const { data, error } = await supabase
          .from("kpi_actions_last_hour")
          .select("*")
          .single();
        return !error;
      },
    },
  ];

  let allPassed = true;

  for (const check of checks) {
    try {
      const passed = await check.test();
      if (passed) {
        console.log(`✅ ${check.name}`);
      } else {
        console.log(`❌ ${check.name} - Failed`);
        allPassed = false;
      }
    } catch (error: any) {
      console.log(`❌ ${check.name} - Error: ${error.message}`);
      allPassed = false;
    }
  }

  console.log("\n" + "=".repeat(50));
  if (allPassed) {
    console.log("✅ All migration objects verified successfully!");
    console.log("\n🎉 Your Living System is ready to use!");
  } else {
    console.log("❌ Some migration objects are missing.");
    console.log("   Please apply the migration first:");
    console.log("   tsx scripts/apply-living-system-migration.ts");
  }
  console.log("=".repeat(50) + "\n");

  process.exit(allPassed ? 0 : 1);
}

verifyMigration();
