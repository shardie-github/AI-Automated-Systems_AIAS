/**
 * Cost Analysis API Endpoint
 */

import { NextResponse } from 'next/server';
import { createGETHandler } from '@/lib/api/route-handler';
import { costOptimizationService } from '@/lib/lead-generation/cost-optimization';

export const GET = createGETHandler(
  async (context) => {
    const searchParams = context.request.nextUrl.searchParams;
    const startDate = new Date(searchParams.get('startDate') || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(searchParams.get('endDate') || Date.now());
    const tenantId = context.tenantId || undefined;
    
    const analysis = await costOptimizationService.analyzeCosts(startDate, endDate, tenantId);
    
    return NextResponse.json(analysis);
  },
  {
    requireAuth: true,
    cacheable: true,
    cacheTTL: 300, // 5 minutes
  }
);
