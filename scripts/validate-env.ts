#!/usr/bin/env tsx
/**
 * Validate Environment Variables
 * 
 * Checks that all required environment variables for the Living System are set.
 * 
 * Usage:
 *   tsx scripts/validate-env.ts
 */

function validateEnv() {
  console.log("🔍 Validating Environment Variables...\n");

  const required = [
    {
      key: "NEXT_PUBLIC_SUPABASE_URL",
      description: "Supabase project URL",
      optional: false,
    },
    {
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      description: "Supabase anonymous key (for client-side)",
      optional: false,
    },
    {
      key: "SUPABASE_SERVICE_ROLE_KEY",
      description: "Supabase service role key (for server-side)",
      optional: false,
    },
  ];

  const optional = [
    {
      key: "NEXT_PUBLIC_SITE_URL",
      description: "Site URL for redirects",
      optional: true,
    },
  ];

  let allValid = true;
  const missing: string[] = [];
  const present: string[] = [];

  // Check required variables
  for (const variable of required) {
    const value = process.env[variable.key];
    if (!value) {
      console.log(`❌ ${variable.key}`);
      console.log(`   ${variable.description} - MISSING`);
      missing.push(variable.key);
      allValid = false;
    } else {
      // Mask sensitive values
      const masked = variable.key.includes("KEY")
        ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}`
        : value;
      console.log(`✅ ${variable.key}`);
      console.log(`   ${variable.description}`);
      console.log(`   Value: ${masked}`);
      present.push(variable.key);
    }
    console.log();
  }

  // Check optional variables
  for (const variable of optional) {
    const value = process.env[variable.key];
    if (value) {
      console.log(`ℹ️  ${variable.key} (optional)`);
      console.log(`   ${variable.description} - Set`);
      present.push(variable.key);
    } else {
      console.log(`⚠️  ${variable.key} (optional)`);
      console.log(`   ${variable.description} - Not set`);
    }
    console.log();
  }

  console.log("=".repeat(50));
  if (allValid) {
    console.log("✅ All required environment variables are set!");
    console.log(`\n📊 Summary:`);
    console.log(`   Required: ${required.length}/${required.length} ✅`);
    console.log(`   Optional: ${optional.filter((v) => process.env[v.key]).length}/${optional.length} set`);
  } else {
    console.log("❌ Some required environment variables are missing!");
    console.log(`\n📊 Summary:`);
    console.log(`   Required: ${present.length}/${required.length} ✅`);
    console.log(`   Missing: ${missing.length}`);
    console.log("\n💡 To set environment variables:");
    console.log("   - Local: Add to .env.local file");
    console.log("   - Vercel: Dashboard → Settings → Environment Variables");
    console.log("   - Supabase: Dashboard → Settings → API");
  }
  console.log("=".repeat(50) + "\n");

  if (!allValid) {
    console.log("📝 Missing variables:");
    missing.forEach((key) => {
      console.log(`   - ${key}`);
    });
    console.log();
  }

  process.exit(allValid ? 0 : 1);
}

validateEnv();
