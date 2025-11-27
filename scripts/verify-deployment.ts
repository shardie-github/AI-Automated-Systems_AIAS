#!/usr/bin/env tsx
/**
 * Post-Deployment Verification Script
 * 
 * Verifies that a Vercel deployment is healthy and functioning correctly.
 * Checks for common issues like missing routes, JSON parsing errors, etc.
 */

interface VerificationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  checks: Array<{ name: string; passed: boolean; message?: string }>;
}

/**
 * Check if a URL is accessible
 */
async function checkUrl(url: string, timeout: number = 10000): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Vercel-Deployment-Verifier/1.0',
      },
    });

    clearTimeout(timeoutId);
    return { success: response.ok, status: response.status };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Verify deployment URL
 */
async function verifyDeployment(deploymentUrl: string): Promise<VerificationResult> {
  const result: VerificationResult = {
    success: true,
    errors: [],
    warnings: [],
    checks: [],
  };

  if (!deploymentUrl) {
    result.success = false;
    result.errors.push('Deployment URL not provided');
    return result;
  }

  // Ensure URL has protocol
  const url = deploymentUrl.startsWith('http') ? deploymentUrl : `https://${deploymentUrl}`;

  console.log(`\n🔍 Verifying deployment: ${url}\n`);

  // Check 1: Root URL is accessible
  const rootCheck = await checkUrl(url);
  result.checks.push({
    name: 'Root URL accessible',
    passed: rootCheck.success,
    message: rootCheck.success 
      ? `Status: ${rootCheck.status}` 
      : `Error: ${rootCheck.error}`,
  });
  if (!rootCheck.success) {
    result.success = false;
    result.errors.push(`Root URL not accessible: ${rootCheck.error}`);
  }

  // Check 2: Health check endpoint
  const healthUrl = `${url}/api/healthz`;
  const healthCheck = await checkUrl(healthUrl);
  result.checks.push({
    name: 'Health check endpoint',
    passed: healthCheck.success,
    message: healthCheck.success 
      ? `Status: ${healthCheck.status}` 
      : `Error: ${healthCheck.error}`,
  ,
  });
  if (!healthCheck.success) {
    result.warnings.push(`Health check endpoint not accessible: ${healthCheck.error}`);
  }

  // Check 3: API routes (if applicable)
  const apiRoutes = ['/api/healthz', '/api/health'];
  for (const route of apiRoutes) {
    const routeUrl = `${url}${route}`;
    const routeCheck = await checkUrl(routeUrl);
    if (routeCheck.success) {
      result.checks.push({
        name: `API route: ${route}`,
        passed: true,
        message: `Status: ${routeCheck.status}`,
      });
      break; // Found at least one working API route
    }
  }

  // Check 4: Static assets (favicon)
  const faviconUrl = `${url}/favicon.ico`;
  const faviconCheck = await checkUrl(faviconUrl);
  result.checks.push({
    name: 'Static assets',
    passed: faviconCheck.success,
    message: faviconCheck.success ? 'Favicon accessible' : 'Favicon not found (may be optional)',
  });

  // Check 5: JSON responses are valid (if health endpoint exists)
  if (healthCheck.success) {
    try {
      const response = await fetch(healthUrl);
      const text = await response.text();
      JSON.parse(text);
      result.checks.push({
        name: 'JSON parsing',
        passed: true,
        message: 'Health endpoint returns valid JSON',
      });
    } catch (error: any) {
      result.warnings.push(`Health endpoint JSON invalid: ${error.message}`);
      result.checks.push({
        name: 'JSON parsing',
        passed: false,
        message: `Invalid JSON: ${error.message}`,
      });
    }
  }

  return result;
}

/**
 * Main function
 */
async function main() {
  const deploymentUrl = process.env.DEPLOYMENT_URL || process.env.VERCEL_URL || process.env.PREVIEW_URL || process.env.PRODUCTION_URL;

  if (!deploymentUrl) {
    console.error('❌ No deployment URL provided');
    console.error('Set DEPLOYMENT_URL, VERCEL_URL, PREVIEW_URL, or PRODUCTION_URL environment variable');
    process.exit(1);
  }

  console.log('\n🚀 Vercel Deployment Verification\n');
  console.log('='.repeat(60));

  const result = await verifyDeployment(deploymentUrl);

  console.log('\n📊 Verification Results:');
  console.log('='.repeat(60));

  result.checks.forEach(check => {
    const icon = check.passed ? '✅' : '❌';
    console.log(`${icon} ${check.name}: ${check.message || (check.passed ? 'Passed' : 'Failed')}`);
  });

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => console.log(`   - ${error}`));
  }

  console.log('='.repeat(60));

  if (result.success) {
    console.log('\n✅ Deployment verification passed!\n');
    process.exit(0);
  } else {
    console.error('\n❌ Deployment verification failed\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error during verification:', error);
  process.exit(1);
});
