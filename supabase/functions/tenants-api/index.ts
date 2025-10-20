import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TenantRequest {
  name: string
  subdomain: string
  planId: string
}

interface TenantMemberRequest {
  userId: string
  role: string
  permissions?: Record<string, any>
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
    
    // Extract tenant ID from path if present
    const tenantId = segments[2] // /api/v1/tenants/{id}
    const action = segments[3] // /api/v1/tenants/{id}/members

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    switch (method) {
      case 'GET':
        if (tenantId && action === 'members') {
          // GET /api/v1/tenants/{id}/members
          return await getTenantMembers(supabaseClient, tenantId, user.id)
        } else if (tenantId) {
          // GET /api/v1/tenants/{id}
          return await getTenant(supabaseClient, tenantId, user.id)
        } else {
          // GET /api/v1/tenants
          return await getTenants(supabaseClient, user.id)
        }

      case 'POST':
        if (tenantId && action === 'members') {
          // POST /api/v1/tenants/{id}/members
          const body: TenantMemberRequest = await req.json()
          return await addTenantMember(supabaseClient, tenantId, body, user.id)
        } else {
          // POST /api/v1/tenants
          const body: TenantRequest = await req.json()
          return await createTenant(supabaseClient, body, user.id)
        }

      case 'PUT':
        if (tenantId) {
          // PUT /api/v1/tenants/{id}
          const body: Partial<TenantRequest> = await req.json()
          return await updateTenant(supabaseClient, tenantId, body, user.id)
        }
        break

      case 'DELETE':
        if (tenantId && action === 'members') {
          // DELETE /api/v1/tenants/{id}/members/{userId}
          const userId = segments[4]
          return await removeTenantMember(supabaseClient, tenantId, userId, user.id)
        } else if (tenantId) {
          // DELETE /api/v1/tenants/{id}
          return await deleteTenant(supabaseClient, tenantId, user.id)
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

async function getTenants(supabaseClient: any, userId: string) {
  const { data, error } = await supabaseClient
    .from('tenant_members')
    .select(`
      tenant_id,
      role,
      tenants (
        id,
        name,
        subdomain,
        status,
        settings,
        limits,
        created_at,
        updated_at,
        subscription_plans (
          id,
          name,
          description,
          price_monthly,
          price_yearly,
          features,
          limits,
          tier
        )
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ tenants: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getTenant(supabaseClient: any, tenantId: string, userId: string) {
  // Check if user is member of tenant
  const { data: membership, error: membershipError } = await supabaseClient
    .from('tenant_members')
    .select('role')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (membershipError || !membership) {
    return new Response(
      JSON.stringify({ error: 'Access denied' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data, error } = await supabaseClient
    .from('tenants')
    .select(`
      id,
      name,
      subdomain,
      status,
      settings,
      limits,
      created_at,
      updated_at,
      subscription_plans (
        id,
        name,
        description,
        price_monthly,
        price_yearly,
        features,
        limits,
        tier
      )
    `)
    .eq('id', tenantId)
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ tenant: data, userRole: membership.role }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createTenant(supabaseClient: any, body: TenantRequest, userId: string) {
  const { data, error } = await supabaseClient.rpc('create_tenant', {
    p_name: body.name,
    p_subdomain: body.subdomain,
    p_plan_id: body.planId
  })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ tenantId: data }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateTenant(supabaseClient: any, tenantId: string, body: Partial<TenantRequest>, userId: string) {
  // Check if user is admin of tenant
  const { data: membership, error: membershipError } = await supabaseClient
    .from('tenant_members')
    .select('role')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (membershipError || !membership || membership.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Access denied' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data, error } = await supabaseClient
    .from('tenants')
    .update({
      name: body.name,
      subdomain: body.subdomain,
      updated_at: new Date().toISOString()
    })
    .eq('id', tenantId)
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ tenant: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function deleteTenant(supabaseClient: any, tenantId: string, userId: string) {
  // Check if user is admin of tenant
  const { data: membership, error: membershipError } = await supabaseClient
    .from('tenant_members')
    .select('role')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (membershipError || !membership || membership.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Access denied' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { error } = await supabaseClient
    .from('tenants')
    .update({ status: 'cancelled' })
    .eq('id', tenantId)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ message: 'Tenant deleted successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getTenantMembers(supabaseClient: any, tenantId: string, userId: string) {
  // Check if user is member of tenant
  const { data: membership, error: membershipError } = await supabaseClient
    .from('tenant_members')
    .select('role')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (membershipError || !membership) {
    return new Response(
      JSON.stringify({ error: 'Access denied' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data, error } = await supabaseClient
    .from('tenant_members')
    .select(`
      id,
      role,
      permissions,
      status,
      joined_at,
      last_active,
      auth.users (
        id,
        email,
        user_metadata
      )
    `)
    .eq('tenant_id', tenantId)
    .eq('status', 'active')

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ members: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function addTenantMember(supabaseClient: any, tenantId: string, body: TenantMemberRequest, userId: string) {
  // Check if user is admin of tenant
  const { data: membership, error: membershipError } = await supabaseClient
    .from('tenant_members')
    .select('role')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (membershipError || !membership || membership.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Access denied' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data, error } = await supabaseClient.rpc('add_tenant_member', {
    p_tenant_id: tenantId,
    p_user_id: body.userId,
    p_role: body.role,
    p_permissions: body.permissions || {}
  })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ memberId: data }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function removeTenantMember(supabaseClient: any, tenantId: string, memberUserId: string, userId: string) {
  // Check if user is admin of tenant
  const { data: membership, error: membershipError } = await supabaseClient
    .from('tenant_members')
    .select('role')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (membershipError || !membership || membership.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Access denied' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { error } = await supabaseClient.rpc('remove_tenant_member', {
    p_tenant_id: tenantId,
    p_user_id: memberUserId
  })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ message: 'Member removed successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
