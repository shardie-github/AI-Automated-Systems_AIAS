import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Requires Node.js runtime for fs operations

export async function GET() {
  try {
    // Try to read from generated JSON file first
    const jsonPath = join(process.cwd(), 'app', 'admin', 'reliability.json');
    
    if (existsSync(jsonPath)) {
      const dashboard = JSON.parse(readFileSync(jsonPath, 'utf-8'));
      return NextResponse.json(dashboard);
    }

    // Fallback: generate on-the-fly from database
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: latestReport } = await supabase
      .from('orchestrator_reports')
      .select('report')
      .order('cycle', { ascending: false })
      .limit(1)
      .single();

    if (latestReport?.report) {
      return NextResponse.json(latestReport.report.modules.dashboardGeneration.data.dashboard);
    }

    // Default empty dashboard
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      uptime: { current: 100, target: 99.9, status: 'healthy', trend: 'stable' },
      performance: { latency_p95: 0, error_rate: 0, throughput: 0 },
      dependencies: { outdated: 0, vulnerabilities: 0, critical_vulnerabilities: 0 },
      cost: { current_monthly: 0, projected_monthly: 0, budget: 75, status: 'within_budget' },
      security: { secrets_exposed: 0, rls_enabled: false, tls_enforced: false, compliance_score: 0 },
      trends: { last_7_days: { uptime: [], latency: [], cost: [] } },
      recommendations: []
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
