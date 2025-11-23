/**
 * A/B Test Results API Endpoint
 */

import { NextResponse } from 'next/server';
import { createGETHandler } from '@/lib/api/route-handler';
import { abTestingService } from '@/lib/lead-generation/ab-testing';

export const GET = createGETHandler(
  async (context) => {
    const searchParams = context.request.nextUrl.searchParams;
    const testId = searchParams.get('testId');
    
    if (!testId) {
      return NextResponse.json(
        { error: 'testId is required' },
        { status: 400 }
      );
    }
    
    const tenantId = context.tenantId || undefined;
    const results = await abTestingService.getTestResults(testId, tenantId);
    
    if (!results) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(results);
  },
  {
    requireAuth: true,
    cacheable: true,
    cacheTTL: 60, // 1 minute
  }
);
