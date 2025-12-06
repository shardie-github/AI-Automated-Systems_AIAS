/**
 * Welcome Email Function
 * Sends welcome email to new users
 * 
 * Deploy: supabase functions deploy welcome-email
 * Trigger: Called after user signup
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
    const { userId, email, firstName } = await req.json();

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: 'userId and email are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if welcome email already sent
    const { data: existing } = await supabase
      .from('app_events')
      .select('id')
      .eq('user_id', userId)
      .eq('event_type', 'welcome_email_sent')
      .limit(1)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, message: 'Welcome email already sent' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Send welcome email (placeholder - implement with your email service)
    const emailContent = {
      to: email,
      subject: `Welcome to AIAS Platform, ${firstName || 'there'}! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to AIAS Platform</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4F46E5;">Welcome to AIAS Platform!</h1>
            <p>Hi ${firstName || 'there'},</p>
            <p>We're excited to have you on board! Get started with your first automation in just 5 minutes:</p>
            <ol>
              <li><strong>Connect an integration</strong> - Link Shopify, Wave Accounting, or another tool you use daily</li>
              <li><strong>Choose a template</strong> - Pick from our pre-built workflow templates</li>
              <li><strong>Test your workflow</strong> - See your automation in action!</li>
            </ol>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${supabaseUrl.replace('/rest/v1', '')}/onboarding" 
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Get Started Now
              </a>
            </p>
            <p>Need help? Check out our <a href="${supabaseUrl.replace('/rest/v1', '')}/help">documentation</a> or reply to this email.</p>
            <p>Happy automating!<br>The AIAS Team</p>
          </div>
        </body>
        </html>
      `,
    };

    // TODO: Send email via your email service (Resend, SendGrid, etc.)
    // For now, just log it
    console.log('Welcome email would be sent:', emailContent);

    // Track that welcome email was sent
    await supabase.from('app_events').insert({
      user_id: userId,
      event_type: 'welcome_email_sent',
      meta: {
        email,
        sent_at: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Welcome email sent',
        email,
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
