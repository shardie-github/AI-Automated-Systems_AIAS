#!/usr/bin/env node
/**
 * Generate VAPID keys for Web Push Notifications
 * Run: npm run generate:vapid-keys
 */

import * as crypto from "crypto";

function generateVAPIDKeys() {
  const curve = crypto.createECDH("prime256v1");
  curve.generateKeys();

  const publicKey = curve.getPublicKey("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const privateKey = curve.getPrivateKey("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  // Convert to URL-safe base64
  const publicKeyBase64 = Buffer.from(curve.getPublicKey()).toString("base64url");
  const privateKeyBase64 = Buffer.from(curve.getPrivateKey()).toString("base64url");

  return {
    publicKey: publicKeyBase64,
    privateKey: privateKeyBase64,
  };
}

const keys = generateVAPIDKeys();

console.log("🔐 VAPID Keys Generated!\n");
console.log("Add these to your .env.local file:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}\n`);
console.log("⚠️  Keep VAPID_PRIVATE_KEY secret! Never commit it to version control.\n");
console.log("📋 Next steps:");
console.log("   1. Add NEXT_PUBLIC_VAPID_PUBLIC_KEY to your .env.local");
console.log("   2. Add VAPID_PRIVATE_KEY to your server environment variables");
console.log("   3. Update your service worker registration to use these keys");

export { generateVAPIDKeys };
