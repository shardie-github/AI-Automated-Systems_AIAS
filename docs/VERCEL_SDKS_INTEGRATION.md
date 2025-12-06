# Vercel Next.js SDKs Integration Guide

This document outlines the integrated Vercel Next.js SDKs and how to use them for maximum synergy.

## Installed SDKs

### ✅ @vercel/analytics
**Status:** Already installed and integrated  
**Location:** `app/layout.tsx`  
**Purpose:** Web analytics and user behavior tracking

### ✅ @vercel/speed-insights
**Status:** Installed and integrated  
**Location:** `app/layout.tsx`  
**Purpose:** Real-time performance monitoring and Core Web Vitals tracking  
**Benefits:** Complements Analytics by providing performance insights

### ✅ @vercel/kv
**Status:** Installed and integrated  
**Location:** `lib/performance/rate-limiter.ts`  
**Purpose:** Key-value storage for rate limiting and caching  
**Setup Required:**
- Create a Vercel KV database in Vercel dashboard
- Add `KV_REST_API_URL` and `KV_REST_API_TOKEN` to environment variables

### ✅ @vercel/blob
**Status:** Installed with utility functions  
**Location:** `lib/storage/vercel-blob.ts`  
**Purpose:** File storage for uploads, images, and assets  
**Setup Required:**
- Create a Vercel Blob store in Vercel dashboard
- Add `BLOB_READ_WRITE_TOKEN` to environment variables

### ✅ @vercel/edge-config
**Status:** Installed with utility functions  
**Location:** `lib/config/edge-config.ts`  
**Purpose:** Globally distributed configuration and feature flags  
**Setup Required:**
- Create an Edge Config in Vercel dashboard
- Add `EDGE_CONFIG` to environment variables

## Usage Examples

### Speed Insights

Speed Insights is automatically integrated in the root layout. No additional code needed.

```tsx
// Already in app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next";

// In your component
<SpeedInsights />
```

### Vercel KV (Rate Limiting)

The rate limiter automatically uses Vercel KV when configured:

```typescript
import { rateLimiter } from '@/lib/performance/rate-limiter';

// The rate limiter will automatically use Vercel KV if configured
const result = await rateLimiter.checkRateLimit(
  '/api/endpoint',
  userIp,
  { windowMs: 60000, maxRequests: 100 }
);
```

### Vercel Blob (File Storage)

Use the utility functions for file uploads:

```typescript
import { uploadToBlob, deleteBlob, listBlobs } from '@/lib/storage/vercel-blob';

// Upload a file
const result = await uploadToBlob(file, 'user-uploads/image.jpg', {
  access: 'public',
  contentType: 'image/jpeg',
});

// List files
const blobs = await listBlobs('user-uploads/', 100);

// Delete a file
await deleteBlob('user-uploads/image.jpg');
```

**Example API Route:**

```typescript
// app/api/upload-blob/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadToBlob } from '@/lib/storage/vercel-blob';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 });
  }

  const result = await uploadToBlob(file, `uploads/${file.name}`, {
    access: 'public',
  });

  return NextResponse.json({ url: result.url });
}
```

### Edge Config (Feature Flags & Configuration)

Use Edge Config for feature flags and dynamic configuration:

```typescript
import { 
  isFeatureEnabled, 
  getFeatureFlag, 
  getConfig,
  getABTestVariant 
} from '@/lib/config/edge-config';

// Check if a feature is enabled
const isNewUIEnabled = await isFeatureEnabled('new_ui');

// Get feature flag with default
const maxUploadSize = await getFeatureFlag('max_upload_size', 10 * 1024 * 1024);

// Get configuration value
const apiEndpoint = await getConfig('api_endpoint', 'https://api.example.com');

// Get A/B test variant
const variant = await getABTestVariant('homepage_redesign', userId);
```

**Example in API Route:**

```typescript
// app/api/feature-check/route.ts
import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/config/edge-config';

export async function GET() {
  const features = {
    newDashboard: await isFeatureEnabled('new_dashboard'),
    betaFeatures: await isFeatureEnabled('beta_features'),
  };
  
  return NextResponse.json(features);
}
```

## Environment Variables

Add these to your `.env.local` and Vercel dashboard:

```bash
# Vercel KV
KV_REST_API_URL=https://your-kv-store.vercel.app
KV_REST_API_TOKEN=your-token

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your-blob-token

# Vercel Edge Config
EDGE_CONFIG=https://edge-config.vercel.app/your-config-id?token=your-token
```

## Synergy Benefits

1. **Analytics + Speed Insights:** Complete visibility into user behavior and performance
2. **KV + Rate Limiting:** Distributed rate limiting that works across serverless functions
3. **Blob + Upload APIs:** Scalable file storage with CDN distribution
4. **Edge Config + Feature Flags:** Instant feature rollouts without redeployments

## Migration Notes

### Rate Limiter
- Previously used manual fetch calls for Vercel KV
- Now uses the official `@vercel/kv` SDK for better type safety and error handling
- Falls back to Redis or in-memory if KV is not configured

### Feature Flags
- The `/api/flags/trust` route now checks Edge Config first
- Falls back to file-based flags for local development
- Provides seamless migration path

## Best Practices

1. **Use Edge Config for frequently changing values** (feature flags, A/B tests)
2. **Use KV for temporary data** (rate limits, sessions, cache)
3. **Use Blob for user-generated content** (uploads, images, documents)
4. **Monitor with Analytics + Speed Insights** for complete observability

## Next Steps

1. Set up Vercel KV in your Vercel dashboard
2. Set up Vercel Blob store for file uploads
3. Create Edge Config for feature flags
4. Update environment variables
5. Test each integration in your environment

## Additional Resources

- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
- [Vercel Speed Insights Docs](https://vercel.com/docs/speed-insights)
- [Vercel KV Docs](https://vercel.com/docs/storage/vercel-kv)
- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Edge Config Docs](https://vercel.com/docs/storage/edge-config)
