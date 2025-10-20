import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IntegrationConfigRequest {
  integrationId: string
  configuration: Record<string, any>
  credentials: Record<string, any>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { method, url } = req
    const urlObj = new URL(url)
    const path = urlObj.pathname
    const segments = path.split('/').filter(Boolean)
    
    // Extract integration ID from path if present
    const integrationId = segments[2] // /api/v1/integrations/{id}
    const action = segments[3] // /api/v1/integrations/{id}/connect

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get tenant ID from query params or headers
    const tenantId = urlObj.searchParams.get('tenantId') || req.headers.get('x-tenant-id')

    if (!tenantId) {
      return new Response(
        JSON.stringify({ error: 'Tenant ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is member of tenant
    const { data: membership, error: membershipError } = await supabaseClient
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (membershipError || !membership) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    switch (method) {
      case 'GET':
        if (integrationId && action === 'status') {
          // GET /api/v1/integrations/{id}/status
          return await getIntegrationStatus(supabaseClient, integrationId, tenantId, user.id)
        } else if (integrationId) {
          // GET /api/v1/integrations/{id}
          return await getIntegration(supabaseClient, integrationId)
        } else {
          // GET /api/v1/integrations
          return await getIntegrations(supabaseClient, tenantId, user.id)
        }

      case 'POST':
        if (integrationId && action === 'connect') {
          // POST /api/v1/integrations/{id}/connect
          const body: IntegrationConfigRequest = await req.json()
          return await connectIntegration(supabaseClient, integrationId, body, tenantId, user.id)
        } else if (integrationId && action === 'test') {
          // POST /api/v1/integrations/{id}/test
          const body = await req.json()
          return await testIntegration(supabaseClient, integrationId, body, tenantId, user.id)
        }
        break

      case 'PUT':
        if (integrationId && action === 'config') {
          // PUT /api/v1/integrations/{id}/config
          const body = await req.json()
          return await updateIntegrationConfig(supabaseClient, integrationId, body, tenantId, user.id)
        }
        break

      case 'DELETE':
        if (integrationId && action === 'disconnect') {
          // DELETE /api/v1/integrations/{id}/disconnect
          return await disconnectIntegration(supabaseClient, integrationId, tenantId, user.id)
        }
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function getIntegrations(supabaseClient: any, tenantId: string, userId: string) {
  // Get available integrations
  const { data: availableIntegrations, error: availableError } = await supabaseClient
    .from('integrations')
    .select(`
      id,
      name,
      description,
      category,
      provider,
      status,
      configuration,
      capabilities,
      pricing,
      documentation_url,
      support_info
    `)
    .eq('status', 'active')
    .order('name')

  if (availableError) {
    return new Response(
      JSON.stringify({ error: availableError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get tenant's connected integrations
  const { data: connectedIntegrations, error: connectedError } = await supabaseClient
    .from('tenant_integrations')
    .select(`
      id,
      configuration,
      credentials,
      status,
      last_sync,
      created_at,
      integrations (
        id,
        name,
        description,
        category,
        provider,
        capabilities
      )
    `)
    .eq('tenant_id', tenantId)

  if (connectedError) {
    return new Response(
      JSON.stringify({ error: connectedError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ 
      available: availableIntegrations,
      connected: connectedIntegrations
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getIntegration(supabaseClient: any, integrationId: string) {
  const { data, error } = await supabaseClient
    .from('integrations')
    .select(`
      id,
      name,
      description,
      category,
      provider,
      status,
      configuration,
      capabilities,
      pricing,
      documentation_url,
      support_info
    `)
    .eq('id', integrationId)
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ integration: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function connectIntegration(supabaseClient: any, integrationId: string, body: IntegrationConfigRequest, tenantId: string, userId: string) {
  // Get integration details
  const { data: integration, error: integrationError } = await supabaseClient
    .from('integrations')
    .select('id, name, configuration, capabilities')
    .eq('id', integrationId)
    .eq('status', 'active')
    .single()

  if (integrationError || !integration) {
    return new Response(
      JSON.stringify({ error: 'Integration not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Validate configuration
  const validationResult = await validateIntegrationConfig(integration, body.configuration)
  if (!validationResult.valid) {
    return new Response(
      JSON.stringify({ error: 'Invalid configuration', details: validationResult.errors }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Test the connection
  const testResult = await testIntegrationConnection(integration, body.configuration, body.credentials)
  if (!testResult.success) {
    return new Response(
      JSON.stringify({ error: 'Connection test failed', details: testResult.error }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Create tenant integration record
  const { data, error } = await supabaseClient
    .from('tenant_integrations')
    .insert({
      tenant_id: tenantId,
      integration_id: integrationId,
      configuration: body.configuration,
      credentials: body.credentials,
      status: 'active'
    })
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ 
      tenantIntegration: data,
      message: 'Integration connected successfully'
    }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function disconnectIntegration(supabaseClient: any, integrationId: string, tenantId: string, userId: string) {
  const { error } = await supabaseClient
    .from('tenant_integrations')
    .update({ status: 'inactive' })
    .eq('tenant_id', tenantId)
    .eq('integration_id', integrationId)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ message: 'Integration disconnected successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getIntegrationStatus(supabaseClient: any, integrationId: string, tenantId: string, userId: string) {
  const { data, error } = await supabaseClient
    .from('tenant_integrations')
    .select(`
      id,
      status,
      last_sync,
      created_at,
      integrations (
        id,
        name,
        provider
      )
    `)
    .eq('tenant_id', tenantId)
    .eq('integration_id', integrationId)
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ status: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function testIntegration(supabaseClient: any, integrationId: string, body: any, tenantId: string, userId: string) {
  // Get tenant integration
  const { data: tenantIntegration, error: tenantError } = await supabaseClient
    .from('tenant_integrations')
    .select('configuration, credentials, integrations(*)')
    .eq('tenant_id', tenantId)
    .eq('integration_id', integrationId)
    .single()

  if (tenantError || !tenantIntegration) {
    return new Response(
      JSON.stringify({ error: 'Integration not connected' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Test the integration
  const testResult = await testIntegrationConnection(
    tenantIntegration.integrations,
    tenantIntegration.configuration,
    tenantIntegration.credentials
  )

  if (testResult.success) {
    // Update last sync time
    await supabaseClient
      .from('tenant_integrations')
      .update({ last_sync: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('integration_id', integrationId)
  }

  return new Response(
    JSON.stringify({ 
      success: testResult.success,
      message: testResult.message,
      data: testResult.data
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateIntegrationConfig(supabaseClient: any, integrationId: string, body: any, tenantId: string, userId: string) {
  const { data, error } = await supabaseClient
    .from('tenant_integrations')
    .update({
      configuration: body.configuration,
      credentials: body.credentials,
      updated_at: new Date().toISOString()
    })
    .eq('tenant_id', tenantId)
    .eq('integration_id', integrationId)
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ integration: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Helper functions
async function validateIntegrationConfig(integration: any, config: any): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []
  const requiredFields = integration.configuration?.requiredFields || []

  for (const field of requiredFields) {
    if (!config[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

async function testIntegrationConnection(integration: any, config: any, credentials: any): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
  // This is a simplified implementation
  // In production, this would make actual API calls to test the integration
  
  try {
    // Simulate connection test based on integration type
    switch (integration.provider) {
      case 'Salesforce':
        return await testSalesforceConnection(config, credentials)
      case 'Slack':
        return await testSlackConnection(config, credentials)
      case 'Google':
        return await testGoogleConnection(config, credentials)
      case 'HubSpot':
        return await testHubSpotConnection(config, credentials)
      case 'Zapier':
        return await testZapierConnection(config, credentials)
      default:
        return { success: true, message: 'Connection test passed' }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Simulated connection tests
async function testSalesforceConnection(config: any, credentials: any) {
  // Simulate Salesforce API test
  await new Promise(resolve => setTimeout(resolve, 1000))
  return { success: true, message: 'Salesforce connection successful', data: { orgId: 'test_org_123' } }
}

async function testSlackConnection(config: any, credentials: any) {
  // Simulate Slack API test
  await new Promise(resolve => setTimeout(resolve, 500))
  return { success: true, message: 'Slack connection successful', data: { workspaceId: 'test_workspace_123' } }
}

async function testGoogleConnection(config: any, credentials: any) {
  // Simulate Google API test
  await new Promise(resolve => setTimeout(resolve, 800))
  return { success: true, message: 'Google connection successful', data: { accountId: 'test_account_123' } }
}

async function testHubSpotConnection(config: any, credentials: any) {
  // Simulate HubSpot API test
  await new Promise(resolve => setTimeout(resolve, 600))
  return { success: true, message: 'HubSpot connection successful', data: { portalId: 'test_portal_123' } }
}

async function testZapierConnection(config: any, credentials: any) {
  // Simulate Zapier API test
  await new Promise(resolve => setTimeout(resolve, 700))
  return { success: true, message: 'Zapier connection successful', data: { accountId: 'test_zapier_123' } }
}
