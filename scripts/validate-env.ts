#!/usr/bin/env node
/**
 * Environment Variable Validation Script
 * Validates all required environment variables are set
 * 
 * Usage: npm run validate:env
 * Or: npx tsx scripts/validate-env.ts
 */

import { env, validateEnv } from '../lib/env';

interface ValidationResult {
  category: string;
  variables: Array<{
    name: string;
    required: boolean;
    set: boolean;
    value?: string;
  }>;
}

function validateAllEnvVars(): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Supabase
  results.push({
    category: 'Supabase',
    variables: [
      {
        name: 'NEXT_PUBLIC_SUPABASE_URL',
        required: true,
        set: !!env.supabase.url,
        value: env.supabase.url ? '***set***' : undefined,
      },
      {
        name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        required: true,
        set: !!env.supabase.anonKey,
        value: env.supabase.anonKey ? '***set***' : undefined,
      },
      {
        name: 'SUPABASE_SERVICE_ROLE_KEY',
        required: true,
        set: !!env.supabase.serviceRoleKey,
        value: env.supabase.serviceRoleKey ? '***set***' : undefined,
      },
    ],
  });

  // Email
  results.push({
    category: 'Email',
    variables: [
      {
        name: 'RESEND_API_KEY',
        required: !env.sendgrid.apiKey && !env.smtp.host,
        set: !!env.resend.apiKey,
        value: env.resend.apiKey ? '***set***' : undefined,
      },
      {
        name: 'SENDGRID_API_KEY',
        required: !env.resend.apiKey && !env.smtp.host,
        set: !!env.sendgrid.apiKey,
        value: env.sendgrid.apiKey ? '***set***' : undefined,
      },
      {
        name: 'SMTP_HOST',
        required: !env.resend.apiKey && !env.sendgrid.apiKey,
        set: !!env.smtp.host,
        value: env.smtp.host ? '***set***' : undefined,
      },
    ],
  });

  // Application
  results.push({
    category: 'Application',
    variables: [
      {
        name: 'NEXT_PUBLIC_SITE_URL',
        required: false,
        set: !!env.app.siteUrl,
        value: env.app.siteUrl || 'default',
      },
      {
        name: 'NEXTAUTH_SECRET',
        required: false,
        set: !!env.app.nextAuthSecret,
        value: env.app.nextAuthSecret ? '***set***' : undefined,
      },
    ],
  });

  // Deployment
  results.push({
    category: 'Deployment',
    variables: [
      {
        name: 'VERCEL_TOKEN',
        required: false,
        set: !!env.vercel.token,
        value: env.vercel.token ? '***set***' : undefined,
      },
      {
        name: 'SUPABASE_ACCESS_TOKEN',
        required: false,
        set: !!env.supabaseCli.accessToken,
        value: env.supabaseCli.accessToken ? '***set***' : undefined,
      },
      {
        name: 'SUPABASE_PROJECT_REF',
        required: false,
        set: !!env.supabaseCli.projectRef,
        value: env.supabaseCli.projectRef || undefined,
      },
    ],
  });

  return results;
}

function printValidationResults(results: ValidationResult[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  let allValid = true;

  console.log('\n🔍 Environment Variable Validation\n');
  console.log('=' .repeat(60));

  for (const result of results) {
    console.log(`\n📦 ${result.category}`);
    console.log('-'.repeat(60));

    for (const variable of result.variables) {
      const status = variable.set ? '✅' : variable.required ? '❌' : '⚠️ ';
      const required = variable.required ? '(required)' : '(optional)';
      
      console.log(`${status} ${variable.name} ${required}`);
      
      if (variable.value && variable.set) {
        console.log(`   Value: ${variable.value}`);
      }

      if (variable.required && !variable.set) {
        errors.push(`Missing required variable: ${variable.name}`);
        allValid = false;
      }
    }
  }

  console.log('\n' + '='.repeat(60));

  if (allValid) {
    console.log('\n✅ All required environment variables are set!\n');
  } else {
    console.log('\n❌ Missing required environment variables:\n');
    errors.forEach(error => console.log(`   - ${error}`));
    console.log('\n💡 Set these in:');
    console.log('   - GitHub: Repository → Settings → Secrets and variables → Actions');
    console.log('   - Vercel: Dashboard → Settings → Environment Variables');
    console.log('   - Supabase: Dashboard → Settings → API');
    console.log('   - Local: .env.local file\n');
  }

  return { valid: allValid, errors };
}

// Run validation
if (require.main === module) {
  const validation = validateEnv();
  const detailedResults = validateAllEnvVars();
  const detailedValidation = printValidationResults(detailedResults);

  if (!validation.valid || !detailedValidation.valid) {
    process.exit(1);
  }
}

export { validateAllEnvVars, printValidationResults };
