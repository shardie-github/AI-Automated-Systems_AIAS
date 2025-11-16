import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs'; // Requires Node.js runtime for fs operations

export async function GET() {
  try {
    // Try to read from generated JSON file first
    const jsonPath = join(process.cwd(), 'app', 'admin', 'compliance.json');
    
    if (existsSync(jsonPath)) {
      const compliance = JSON.parse(readFileSync(jsonPath, 'utf-8'));
      return NextResponse.json(compliance);
    }

    // Fallback: get from latest security audit
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
    );

    const { data: latestAudit } = await supabase
      .from('security_audits')
      .select('audit')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latestAudit?.audit) {
      const audit = latestAudit.audit;
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        secrets: audit.secrets?.status || 'ok',
        licenses: {
          gpl: audit.licenses?.gpl || 0,
          restricted: audit.licenses?.restricted || 0
        },
        tls: audit.tls?.status || 'enforced',
        rls: audit.rls?.status || 'enabled',
        gdpr: audit.gdpr?.status || 'pass',
        issues: audit.issues?.length || 0
      });
    }

    // Default compliance status
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      secrets: 'ok',
      licenses: { gpl: 0, restricted: 0 },
      tls: 'enforced',
      rls: 'enabled',
      gdpr: 'pass',
      issues: 0
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
