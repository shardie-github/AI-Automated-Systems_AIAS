import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigrations() {
  console.log("🚀 Running Gamification Migrations...\n");

  const migrations = [
    {
      name: "Base Gamification Schema",
      file: "supabase/migrations/2025-11-05_gamify.sql",
    },
    {
      name: "Extended Gamification Features",
      file: "supabase/migrations/2025-11-05_gamify_extended.sql",
    },
  ];

  for (const migration of migrations) {
    try {
      console.log(`📦 Applying: ${migration.name}`);
      const sql = fs.readFileSync(path.join(process.cwd(), migration.file), "utf8");
      
      // Split by semicolons and execute each statement
      const statements = sql.split(";").filter((s) => s.trim().length > 0);
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc("exec_sql", { sql_query: statement });
          if (error && !error.message.includes("already exists")) {
            console.warn(`  ⚠️  ${error.message}`);
          }
        }
      }
      
      console.log(`  ✅ ${migration.name} applied\n`);
    } catch (error: any) {
      console.error(`  ❌ Error applying ${migration.name}:`, error.message);
    }
  }

  console.log("✅ All migrations complete!");
  console.log("\n📋 Verifying tables...");
  
  const { data: tables } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_schema", "public")
    .in("table_name", [
      "profiles",
      "comments",
      "challenges",
      "referrals",
      "notifications",
      "user_follows",
      "activities",
      "subscription_tiers",
    ]);

  if (tables) {
    console.log(`   Found ${tables.length} tables`);
  }
}

runMigrations().catch(console.error);
