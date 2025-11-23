/**
 * ROI Tracking API Endpoint
 */

import { NextResponse } from 'next/server';
import { createGETHandler } from '@/lib/api/route-handler';
import { roiTrackingService } from '@/lib/lead-generation/roi-tracking';

export const GET = createGETHandler(
  async (context) => {
    const searchParams = context.request.nextUrl.searchParams;
    const startDate = new Date(searchParams.get('startDate') || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(searchParams.get('endDate') || Date.now());
    const tenantId = context.tenantId || undefined;
    
    const roi = await roiTrackingService.calculateROI(startDate, endDate, tenantId);
    
    return NextResponse.json(roi);
  },
  {
    requireAuth: true,
    cacheable: true,
    cacheTTL: 300, // 5 minutes
  }
);
