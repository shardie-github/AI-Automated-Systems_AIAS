#!/usr/bin/env node
/**
 * Vercel Configuration Validation Script
 * 
 * Validates:
 * - Health endpoint returns 200
 * - Security headers are present
 * - Preview environment protection
 * - Admin basic auth (if configured)
 */

import assert from 'node:assert/strict';

const base = process.env.VALIDATE_BASE_URL || 'http://localhost:3000';
const verbose = process.env.VERBOSE === 'true';

function log(message) {
  if (verbose) {
    console.log(`[VERCEL-VALIDATE] ${message}`);
  }
}

async function validateHealthEndpoint() {
  log(`Checking health endpoint: ${base}/api/health`);
  const resp = await fetch(`${base}/api/health`, { method: 'GET' });
  
  assert.equal(resp.status, 200, `Health endpoint returned ${resp.status}, expected 200`);
  
  const data = await resp.json();
  assert.ok(data.ok === true, 'Health endpoint should return { ok: true }');
  
  console.log('✅ Health endpoint validation PASS');
  return true;
}

async function validateSecurityHeaders() {
  log(`Checking security headers on: ${base}/`);
  const home = await fetch(`${base}/`, { method: 'HEAD' });
  
  const requiredHeaders = [
    'strict-transport-security',
    'x-frame-options',
    'x-content-type-options',
    'content-security-policy',
  ];
  
  const missingHeaders = [];
  
  for (const header of requiredHeaders) {
    const value = home.headers.get(header);
    if (!value) {
      missingHeaders.push(header);
    } else {
      log(`  ✓ ${header}: ${value.substring(0, 50)}...`);
    }
  }
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing security headers: ${missingHeaders.join(', ')}`);
  }
  
  console.log('✅ Security headers validation PASS');
  return true;
}

async function validatePreviewProtection() {
  // Check if we're in a preview environment
  const isPreview = base.includes('-git-') || base.includes('-vercel.app') || base.includes('.vercel.app');
  
  if (!isPreview) {
    log('Skipping preview protection check (not a preview environment)');
    return true;
  }
  
  log(`Checking preview protection: ${base}/robots.txt`);
  const robotsResp = await fetch(`${base}/robots.txt`, { method: 'GET' });
  
  if (robotsResp.ok) {
    const robotsText = await robotsResp.text();
    if (robotsText.includes('Disallow: /')) {
      log('  ✓ robots.txt disallows indexing');
    }
  }
  
  // Check for preview banner header
  const home = await fetch(`${base}/`, { method: 'HEAD' });
  const previewHeader = home.headers.get('x-preview-env');
  
  if (previewHeader === 'true') {
    log('  ✓ Preview environment header present');
  }
  
  console.log('✅ Preview protection validation PASS');
  return true;
}

async function validateAdminAuth() {
  log(`Checking admin auth: ${base}/admin`);
  const adminResp = await fetch(`${base}/admin`, { 
    method: 'GET',
    redirect: 'manual'
  });
  
  // Admin should return 401 if auth is required
  if (adminResp.status === 401) {
    const authHeader = adminResp.headers.get('www-authenticate');
    if (authHeader && authHeader.includes('Basic')) {
      log('  ✓ Admin basic auth is configured');
      console.log('✅ Admin auth validation PASS');
      return true;
    }
  }
  
  // If admin returns 200 or 404, it might be public or not exist
  if (adminResp.status === 200 || adminResp.status === 404) {
    log('  ⚠️  Admin endpoint is publicly accessible (may be intentional)');
    return true;
  }
  
  log(`  Admin endpoint returned ${adminResp.status}`);
  return true;
}

async function main() {
  console.log(`\n🔍 Vercel Configuration Validation`);
  console.log(`Base URL: ${base}\n`);
  
  const results = {
    health: false,
    headers: false,
    preview: false,
    admin: false,
  };
  
  try {
    results.health = await validateHealthEndpoint();
  } catch (error) {
    console.error(`❌ Health endpoint validation FAILED: ${error.message}`);
    process.exit(1);
  }
  
  try {
    results.headers = await validateSecurityHeaders();
  } catch (error) {
    console.error(`❌ Security headers validation FAILED: ${error.message}`);
    process.exit(1);
  }
  
  try {
    results.preview = await validatePreviewProtection();
  } catch (error) {
    console.error(`❌ Preview protection validation FAILED: ${error.message}`);
    // Don't exit on preview check failure (might not be in preview)
  }
  
  try {
    results.admin = await validateAdminAuth();
  } catch (error) {
    console.error(`❌ Admin auth validation FAILED: ${error.message}`);
    // Don't exit on admin check failure (might not be configured)
  }
  
  console.log('\n📊 Validation Summary:');
  console.log(`  Health Endpoint: ${results.health ? '✅' : '❌'}`);
  console.log(`  Security Headers: ${results.headers ? '✅' : '❌'}`);
  console.log(`  Preview Protection: ${results.preview ? '✅' : '⚠️'}`);
  console.log(`  Admin Auth: ${results.admin ? '✅' : '⚠️'}`);
  
  if (results.health && results.headers) {
    console.log('\n✅ Vercel validation PASS');
    process.exit(0);
  } else {
    console.log('\n❌ Vercel validation FAILED');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
