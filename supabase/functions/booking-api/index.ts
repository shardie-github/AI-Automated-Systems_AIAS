import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const bookingRequestSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long (max 100 characters)"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional().or(z.literal('')),
  company: z.string().max(200, "Company name too long (max 200 characters)").optional(),
  meetingType: z.enum(['video', 'phone', 'chat'], { errorMap: () => ({ message: "Invalid meeting type" }) }),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  notes: z.string().max(2000, "Notes too long (max 2000 characters)").optional(),
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
    p_endpoint: 'booking-api',
    p_max_requests: 5,
    p_window_seconds: 300
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
    const validation = bookingRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { name, email, phone, company, meetingType, date, time, notes } = validation.data;

    // Distributed rate limiting by email
    const isAllowed = await checkRateLimit(email);
    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: 'Too many booking requests. Please try again in 5 minutes.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store booking request in database for processing
    const bookingData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || null,
      company: company || null,
      meeting_type: meetingType,
      requested_date: date,
      requested_time: time,
      notes: notes?.substring(0, 200) || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Store in database (bookings table)
    const { error: insertError } = await supabaseAdmin
      .from('bookings')
      .insert(bookingData);

    if (insertError) {
      console.error('Failed to store booking:', insertError);
      // Continue execution even if storage fails
    }

    // Integrate with booking system (Calendly, Cal.com, or custom)
    let meetingLink: string | undefined;
    try {
      const calendlyApiKey = Deno.env.get('CALENDLY_API_KEY');
      const calendlyEventTypeUri = Deno.env.get('CALENDLY_EVENT_TYPE_URI');
      const calComApiKey = Deno.env.get('CAL_COM_API_KEY');
      const calComEventTypeId = Deno.env.get('CAL_COM_EVENT_TYPE_ID');

      if (calendlyApiKey && calendlyEventTypeUri) {
        // Create Calendly event
        const startDateTime = new Date(`${bookingData.requested_date}T${bookingData.requested_time}`);
        const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);
        
        const calendlyResponse = await fetch('https://api.calendly.com/scheduled_events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${calendlyApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: calendlyEventTypeUri,
            invitees: [{ email: bookingData.email, name: bookingData.name }],
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            location: bookingData.meeting_type === 'video' 
              ? { type: 'zoom', location: 'Zoom Meeting' }
              : bookingData.meeting_type === 'phone'
              ? { type: 'phone', location: bookingData.phone || 'Phone Call' }
              : { type: 'calendly', location: 'Calendly Chat' },
            notes: bookingData.notes || '',
          }),
        });
        
        if (calendlyResponse.ok) {
          const event = await calendlyResponse.json();
          meetingLink = event.location?.location || event.uri;
        }
      } else if (calComApiKey && calComEventTypeId) {
        // Create Cal.com booking
        const startDateTime = new Date(`${bookingData.requested_date}T${bookingData.requested_time}`);
        const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);
        
        const calComResponse = await fetch('https://api.cal.com/v1/bookings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${calComApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventTypeId: parseInt(calComEventTypeId),
            start: startDateTime.toISOString(),
            end: endDateTime.toISOString(),
            responses: {
              name: bookingData.name,
              email: bookingData.email,
              phone: bookingData.phone || '',
              company: bookingData.company || '',
              notes: bookingData.notes || '',
            },
          }),
        });
        
        if (calComResponse.ok) {
          const event = await calComResponse.json();
          meetingLink = event.location;
        }
      }
    } catch (error) {
      console.error('Failed to create calendar event:', error);
    }
    
    // Send confirmation email
    try {
      const resendKey = Deno.env.get('RESEND_API_KEY');
      const sendgridKey = Deno.env.get('SENDGRID_API_KEY');
      const mailgunKey = Deno.env.get('MAILGUN_API_KEY');
      const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');

      if (resendKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'AIAS Platform <noreply@aias-platform.com>',
            to: bookingData.email,
            subject: `Booking Confirmed: ${bookingData.meeting_type} Meeting on ${bookingData.requested_date}`,
            html: `
              <h1>Booking Confirmed!</h1>
              <p>Hi ${bookingData.name},</p>
              <p>Your meeting has been confirmed:</p>
              <ul>
                <li>Date: ${bookingData.requested_date}</li>
                <li>Time: ${bookingData.requested_time}</li>
                <li>Type: ${bookingData.meeting_type}</li>
                ${meetingLink ? `<li>Meeting Link: <a href="${meetingLink}">${meetingLink}</a></li>` : ''}
              </ul>
            `,
            text: `Booking Confirmed! Hi ${bookingData.name}, Your meeting on ${bookingData.requested_date} at ${bookingData.requested_time} has been confirmed.${meetingLink ? ` Join: ${meetingLink}` : ''}`,
          }),
        });
      } else if (sendgridKey) {
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendgridKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: { email: 'noreply@aias-platform.com', name: 'AIAS Platform' },
            personalizations: [{
              to: [{ email: bookingData.email }],
              subject: `Booking Confirmed: ${bookingData.meeting_type} Meeting`,
            }],
            content: [{
              type: 'text/html',
              value: `<h1>Booking Confirmed!</h1><p>Hi ${bookingData.name}, your meeting on ${bookingData.requested_date} at ${bookingData.requested_time} has been confirmed.</p>`,
            }],
          }),
        });
      }
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }
    
    // Store in CRM
    try {
      const crmProvider = Deno.env.get('CRM_PROVIDER');
      const hubspotKey = Deno.env.get('HUBSPOT_API_KEY');
      
      if (crmProvider === 'hubspot' && hubspotKey) {
        const [firstName, ...lastNameParts] = bookingData.name.split(' ');
        const lastName = lastNameParts.join(' ') || '';
        
        await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hubspotKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              firstname: firstName,
              lastname: lastName,
              email: bookingData.email,
              phone: bookingData.phone || '',
              company: bookingData.company || '',
              notes: bookingData.notes || '',
              hs_lead_status: 'BOOKING_REQUESTED',
            },
          }),
        });
      }
    } catch (error) {
      console.error('Failed to store in CRM:', error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Booking request received. You will receive a confirmation email shortly.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in booking-api:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
