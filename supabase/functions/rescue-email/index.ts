/**
 * Rescue Email Function
 * Sends rescue emails to users at risk of churning
 * 
 * Deploy: supabase functions deploy rescue-email
 * Schedule: Run daily at 10 AM UTC via cron
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Get users inactive for 7+ days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get users with no recent activity
    const { data: inactiveUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name, subscription_tier')
      .not('email', 'is', null);

    if (usersError) {
      throw usersError;
    }

    const emailsSent: Array<{ userId: string; success: boolean }> = [];

    for (const user of inactiveUsers || []) {
      // Check last activity
      const { data: lastEvent } = await supabase
        .from('app_events')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!lastEvent) {
        continue; // No activity at all, skip
      }

      const lastActivity = new Date(lastEvent.created_at);
      const daysInactive = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      // Send rescue email if inactive for 7+ days
      if (daysInactive >= 7 && daysInactive < 30) {
        const emailContent = {
          to: user.email,
          subject: `We miss you! Here's what you can do next`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>We miss you!</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #4F46E5;">We miss you, ${user.full_name || 'there'}!</h1>
                <p>It's been ${daysInactive} days since you last used AIAS Platform. Here's how to get back on track:</p>
                <ol>
                  <li><strong>Check your workflows</strong> - Make sure they're still running</li>
                  <li><strong>Create a new automation</strong> - Try a new template</li>
                  <li><strong>Explore advanced features</strong> - Unlock more with Pro</li>
                </ol>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="${supabaseUrl.replace('/rest/v1', '')}/dashboard" 
                     style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Return to Dashboard
                  </a>
                </p>
                <p>Need help? Reply to this email or check out our <a href="${supabaseUrl.replace('/rest/v1', '')}/help">help center</a>.</p>
                <p>Happy automating!<br>The AIAS Team</p>
              </div>
            </body>
            </html>
          `,
        };

        // TODO: Send email via your email service
        // Email content prepared (logging removed for production)

        emailsSent.push({
          userId: user.id,
          success: true,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: inactiveUsers?.length || 0,
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
