/**
 * Email Cadence Scheduler Function
 * Runs daily to send lifecycle emails based on user trial dates and activity
 * 
 * Deploy: supabase functions deploy email-cadence-scheduler
 * Schedule: Run daily at 9 AM UTC via cron
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  plan_name?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  workflow_count?: number;
  integration_count?: number;
  automation_count?: number;
  time_saved_hours?: number;
  industry?: string;
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

    // Get all trial users
    const { data: trialUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .in('plan_name', ['trial', 'free'])
      .not('trial_start_date', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    const today = new Date();
    const emailsSent: Array<{ userId: string; type: string; success: boolean }> = [];

    for (const user of trialUsers || []) {
      if (!user.trial_start_date) continue;

      const trialStart = new Date(user.trial_start_date);
      const trialEnd = user.trial_end_date ? new Date(user.trial_end_date) : null;
      
      const daysSinceStart = Math.floor((today.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = trialEnd 
        ? Math.max(0, Math.ceil((trialEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      // Determine which email to send
      let emailType: string | null = null;
      
      if (daysSinceStart === 0) {
        emailType = 'trial_welcome';
      } else if (daysSinceStart === 7) {
        emailType = 'trial_day7';
      } else if (daysRemaining === 5 || daysRemaining === 3 || daysRemaining === 1) {
        emailType = 'trial_ending';
      }

      if (emailType) {
        // Call email API to send email
        // In production, this would call your email service
        const emailResult = await fetch(`${supabaseUrl}/functions/v1/send-lifecycle-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            userId: user.id,
            emailType,
            userData: {
              id: user.id,
              email: user.email,
              firstName: user.first_name,
              lastName: user.last_name,
              planName: user.plan_name,
              trialStartDate: user.trial_start_date,
              trialEndDate: user.trial_end_date,
              workflowCount: user.workflow_count || 0,
              integrationCount: user.integration_count || 0,
            },
          }),
        });

        emailsSent.push({
          userId: user.id,
          type: emailType,
          success: emailResult.ok,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: trialUsers?.length || 0,
        emailsSent: emailsSent.length,
        details: emailsSent,
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
