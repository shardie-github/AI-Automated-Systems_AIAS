#!/usr/bin/env tsx
/**
 * MASTER OMEGA PRIME — Environment Variable Validation
 * 
 * Validates all required environment variables based on detected features
 */

interface EnvRequirement {
  name: string;
  required: boolean;
  description: string;
  feature: string;
  severity: 'critical' | 'warning' | 'info';
}

const ENV_REQUIREMENTS: EnvRequirement[] = [
  // Core Supabase
  {
    name: 'SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
    feature: 'core',
    severity: 'critical',
  },
  {
    name: 'SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key',
    feature: 'core',
    severity: 'critical',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase service role key',
    feature: 'core',
    severity: 'critical',
  },
  {
    name: 'SUPABASE_PROJECT_REF',
    required: true,
    description: 'Supabase project reference',
    feature: 'core',
    severity: 'critical',
  },
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL connection string',
    feature: 'core',
    severity: 'critical',
  },
  
  // Vercel
  {
    name: 'VERCEL_TOKEN',
    required: false,
    description: 'Vercel deployment token',
    feature: 'vercel',
    severity: 'warning',
  },
  {
    name: 'VERCEL_PROJECT_ID',
    required: false,
    description: 'Vercel project ID',
    feature: 'vercel',
    severity: 'warning',
  },
  
  // Expo
  {
    name: 'APPLE_ID',
    required: false,
    description: 'Apple ID for iOS builds',
    feature: 'expo',
    severity: 'info',
  },
  {
    name: 'APP_STORE_CONNECT_APP_ID',
    required: false,
    description: 'App Store Connect app ID',
    feature: 'expo',
    severity: 'info',
  },
  
  // Shopify
  {
    name: 'SHOPIFY_API_KEY',
    required: false,
    description: 'Shopify API key',
    feature: 'shopify',
    severity: 'warning',
  },
  {
    name: 'SHOPIFY_PASSWORD',
    required: false,
    description: 'Shopify API password',
    feature: 'shopify',
    severity: 'warning',
  },
  {
    name: 'SHOPIFY_STORE',
    required: false,
    description: 'Shopify store domain',
    feature: 'shopify',
    severity: 'warning',
  },
  
  // TikTok
  {
    name: 'TIKTOK_ACCESS_TOKEN',
    required: false,
    description: 'TikTok Business API access token',
    feature: 'tiktok',
    severity: 'warning',
  },
  {
    name: 'TIKTOK_ADVERTISER_ID',
    required: false,
    description: 'TikTok advertiser ID',
    feature: 'tiktok',
    severity: 'warning',
  },
  
  // Meta Ads
  {
    name: 'META_ACCESS_TOKEN',
    required: false,
    description: 'Meta Ads API access token',
    feature: 'meta-ads',
    severity: 'warning',
  },
  {
    name: 'META_AD_ACCOUNT_ID',
    required: false,
    description: 'Meta ad account ID',
    feature: 'meta-ads',
    severity: 'warning',
  },
  
  // Stripe
  {
    name: 'STRIPE_SECRET_KEY',
    required: false,
    description: 'Stripe secret key',
    feature: 'payments',
    severity: 'warning',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: false,
    description: 'Stripe publishable key',
    feature: 'payments',
    severity: 'warning',
  },
  
  // AI Services
  {
    name: 'OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key',
    feature: 'ai',
    severity: 'info',
  },
  
  // GitHub
  {
    name: 'GITHUB_TOKEN',
    required: false,
    description: 'GitHub token for CI/CD',
    feature: 'ci-cd',
    severity: 'warning',
  },
];

interface ValidationResult {
  name: string;
  present: boolean;
  requirement: EnvRequirement;
  value?: string;
}

function validateEnv(): {
  results: ValidationResult[];
  summary: {
    total: number;
    present: number;
    missing: number;
    critical: number;
    warnings: number;
  };
} {
  const results: ValidationResult[] = ENV_REQUIREMENTS.map((req) => {
    const value = process.env[req.name];
    return {
      name: req.name,
      present: !!value,
      requirement: req,
      value: value ? (value.length > 20 ? `${value.substring(0, 20)}...` : value) : undefined,
    };
  });

  const summary = {
    total: results.length,
    present: results.filter((r) => r.present).length,
    missing: results.filter((r) => !r.present).length,
    critical: results.filter((r) => !r.present && r.requirement.severity === 'critical').length,
    warnings: results.filter((r) => !r.present && r.requirement.severity === 'warning').length,
  };

  return { results, summary };
}

function printReport() {
  const { results, summary } = validateEnv();

  console.log('\n🔍 MASTER OMEGA PRIME — Environment Validation Report\n');
  console.log('='.repeat(70));
  console.log(`Total Variables: ${summary.total}`);
  console.log(`✅ Present: ${summary.present}`);
  console.log(`❌ Missing: ${summary.missing}`);
  console.log(`🚨 Critical Missing: ${summary.critical}`);
  console.log(`⚠️  Warnings: ${summary.warnings}`);
  console.log('='.repeat(70));
  console.log();

  // Group by feature
  const byFeature = results.reduce((acc, result) => {
    const feature = result.requirement.feature;
    if (!acc[feature]) acc[feature] = [];
    acc[feature].push(result);
    return acc;
  }, {} as Record<string, ValidationResult[]>);

  Object.entries(byFeature).forEach(([feature, featureResults]) => {
    console.log(`\n📦 ${feature.toUpperCase()}`);
    console.log('-'.repeat(70));
    
    featureResults.forEach((result) => {
      const icon = result.present ? '✅' : result.requirement.severity === 'critical' ? '🚨' : '⚠️';
      const status = result.present ? 'PRESENT' : 'MISSING';
      console.log(
        `${icon} ${result.name.padEnd(35)} ${status.padEnd(10)} ${result.requirement.description}`
      );
    });
  });

  console.log('\n' + '='.repeat(70));
  
  if (summary.critical > 0) {
    console.log('\n🚨 CRITICAL: Missing required environment variables!');
    console.log('   These must be set for the application to function.\n');
    process.exit(1);
  } else if (summary.warnings > 0) {
    console.log('\n⚠️  WARNING: Some optional environment variables are missing.');
    console.log('   Features may not work correctly without these.\n');
    process.exit(0);
  } else {
    console.log('\n✅ All environment variables validated successfully!\n');
    process.exit(0);
  }
}

if (require.main === module) {
  printReport();
}

export { validateEnv, ENV_REQUIREMENTS };
