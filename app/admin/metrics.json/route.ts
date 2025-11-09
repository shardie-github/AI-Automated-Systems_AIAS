import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Admin Metrics Endpoint
 * Returns performance metrics placeholders for Vercel Analytics integration
 * 
 * This endpoint is protected by middleware.ts admin authentication
 */
export async function GET() {
  // Placeholder metrics - replace with actual Vercel Analytics data
  const metrics = {
    timestamp: new Date().toISOString(),
    performance: {
      lcp: null, // Largest Contentful Paint - populate from Vercel Analytics
      ttfb: null, // Time to First Byte - populate from Vercel Analytics
      fid: null, // First Input Delay - populate from Vercel Analytics
      cls: null, // Cumulative Layout Shift - populate from Vercel Analytics
      inp: null, // Interaction to Next Paint - populate from Vercel Analytics
    },
    requests: {
      total: null,
      errors: null,
      successRate: null,
    },
    cache: {
      hitRate: null,
      missRate: null,
    },
    note: 'Metrics will be populated from Vercel Analytics API. Configure VERCEL_ANALYTICS_ID to enable.',
  };

  return NextResponse.json(metrics, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Robots-Tag': 'noindex',
    },
  });
}
