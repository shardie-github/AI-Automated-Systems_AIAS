/**
 * Daily Cleanup Function
 * Runs daily to clean up old data and maintain database hygiene
 * 
 * Deploy: supabase functions deploy daily-cleanup
 * Schedule: Run daily at 2 AM UTC via cron
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CleanupResult {
  table: string;
  deleted: number;
  archived: number;
  error?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: CleanupResult[] = [];
    const now = new Date();

    // 1. Clean up old workflow executions (>90 days)
    try {
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: executions, error: execError } = await supabase
        .from('workflow_executions')
        .delete()
        .lt('started_at', ninetyDaysAgo.toISOString())
        .select('id');

      results.push({
        table: 'workflow_executions',
        deleted: executions?.length || 0,
        archived: 0,
        error: execError?.message,
      });
    } catch (error) {
      results.push({
        table: 'workflow_executions',
        deleted: 0,
        archived: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // 2. Archive old telemetry data (>30 days) - aggregate and delete raw data
    try {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // For now, just delete old telemetry (in future, aggregate first)
      const { data: telemetry, error: telemetryError } = await supabase
        .from('app_events')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())
        .select('id');

      results.push({
        table: 'app_events',
        deleted: telemetry?.length || 0,
        archived: 0,
        error: telemetryError?.message,
      });
    } catch (error) {
      results.push({
        table: 'app_events',
        deleted: 0,
        archived: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // 3. Soft-delete inactive workflows (>1 year old, never executed)
    try {
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      // Find workflows that haven't been executed in over a year
      const { data: inactiveWorkflows, error: workflowError } = await supabase
        .from('workflows')
        .update({ enabled: false, status: 'archived' })
        .lt('updated_at', oneYearAgo.toISOString())
        .eq('enabled', true)
        .select('id');

      results.push({
        table: 'workflows',
        deleted: 0,
        archived: inactiveWorkflows?.length || 0,
        error: workflowError?.message,
      });
    } catch (error) {
      results.push({
        table: 'workflows',
        deleted: 0,
        archived: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // 4. Clean up orphaned records
    try {
      // Delete workflow executions without workflows
      const { data: orphanedExecutions, error: orphanError } = await supabase
        .rpc('cleanup_orphaned_executions');

      results.push({
        table: 'orphaned_executions',
        deleted: orphanedExecutions || 0,
        archived: 0,
        error: orphanError?.message,
      });
    } catch (error) {
      // Function might not exist yet, that's OK
      results.push({
        table: 'orphaned_executions',
        deleted: 0,
        archived: 0,
        error: 'Cleanup function not available',
      });
    }

    const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0);
    const totalArchived = results.reduce((sum, r) => sum + r.archived, 0);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: now.toISOString(),
        summary: {
          totalDeleted,
          totalArchived,
        },
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
