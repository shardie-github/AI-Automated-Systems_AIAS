import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const leadGenRequestSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long (max 100 characters)"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
});

// Initialize Supabase client - Load from environment variables dynamically
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing required environment variables: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY\n' +
    'Please set these variables in Supabase Dashboard → Settings → API'
  );
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Distributed rate limit check
async function checkRateLimit(identifier: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
    p_identifier: identifier,
    p_endpoint: 'lead-gen-api',
    p_max_requests: 3,
    p_window_seconds: 3600
  });

  if (error) {
    console.error('Rate limit check error:', error);
    return true;
  }

  return data === true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input with Zod
    const validation = leadGenRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { name, email } = validation.data;

    // Distributed rate limiting by email
    const isAllowed = await checkRateLimit(email);
    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again in 1 hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store lead in database
    const leadData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      source: 'lead-gen-form',
      status: 'new',
      created_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabaseAdmin
      .from('leads')
      .insert(leadData);

    if (insertError) {
      console.error('Failed to store lead:', insertError);
      // Continue execution even if storage fails
    }

    // Generate PDF with 10-page master system prompts
    let pdfBuffer: Uint8Array | null = null;
    let pdfUrl: string | undefined;
    try {
      const pdfModule = await import('https://esm.sh/@/lib/pdf/generator.ts');
      const buffer = await pdfModule.generateSystemPromptsPDF(email, name);
      pdfBuffer = new Uint8Array(buffer);
      
      // Store PDF in storage bucket
      const fileName = `${email.replace(/[^a-zA-Z0-9]/g, '_')}-system-prompts-${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('pdfs')
        .upload(fileName, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: false,
        });
      
      if (!uploadError && uploadData) {
        const { data: urlData } = supabaseAdmin.storage
          .from('pdfs')
          .getPublicUrl(fileName);
        pdfUrl = urlData?.publicUrl;
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      // Continue execution even if PDF generation fails
    }
    
    // Send PDF via email
    try {
      const resendKey = Deno.env.get('RESEND_API_KEY');
      const sendgridKey = Deno.env.get('SENDGRID_API_KEY');
      const mailgunKey = Deno.env.get('MAILGUN_API_KEY');
      const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');

      if (resendKey || sendgridKey || (mailgunKey && mailgunDomain)) {
        const emailModule = await import('https://esm.sh/@/lib/email/sender.ts');
        const templateModule = await import('https://esm.sh/@/lib/email/templates.ts');
        
        const template = templateModule.getLeadGenPDFTemplate({
          name,
          pdfUrl,
        });
        
        await emailModule.sendEmailFromTemplate(template, email, {
          attachments: pdfBuffer ? [{
            filename: 'system-prompts-guide.pdf',
            content: Buffer.from(pdfBuffer),
            contentType: 'application/pdf',
          }] : undefined,
        });
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      // Continue execution even if email fails
    }
    
    // Add to CRM/mailing list
    try {
      const crmProvider = Deno.env.get('CRM_PROVIDER') as 'hubspot' | 'salesforce' | undefined;
      if (crmProvider) {
        const crmModule = await import('https://esm.sh/@/lib/integrations/crm.ts');
        const crmConfig: Record<string, string> = {};
        
        if (crmProvider === 'hubspot') {
          crmConfig.apiKey = Deno.env.get('HUBSPOT_API_KEY') || '';
        } else if (crmProvider === 'salesforce') {
          crmConfig.clientId = Deno.env.get('SALESFORCE_CLIENT_ID') || '';
          crmConfig.clientSecret = Deno.env.get('SALESFORCE_CLIENT_SECRET') || '';
          crmConfig.username = Deno.env.get('SALESFORCE_USERNAME') || '';
          crmConfig.password = Deno.env.get('SALESFORCE_PASSWORD') || '';
          crmConfig.securityToken = Deno.env.get('SALESFORCE_SECURITY_TOKEN') || '';
          crmConfig.instanceUrl = Deno.env.get('SALESFORCE_INSTANCE_URL') || '';
        }
        
        const crm = crmModule.createCRMClient(crmProvider, crmConfig);
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ') || '';
        
        await crm.createLead({
          firstName,
          lastName,
          email,
          source: 'lead-gen-form',
          status: 'new',
        });
      }
    } catch (error) {
      console.error('Failed to add to CRM:', error);
      // Continue execution even if CRM integration fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Thank you! Check your email for your free guide.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in lead-gen-api:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
