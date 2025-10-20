import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AgentRequest {
  name: string
  description?: string
  capabilities: string[]
  model: 'gpt-4' | 'claude-3' | 'custom' | 'multi-model'
  trainingData: string[]
  personality: {
    tone: 'professional' | 'casual' | 'friendly' | 'technical' | 'creative'
    expertise: string[]
    responseStyle: string
    language: string
    culturalContext: string
  }
  pricing: {
    type: 'per_use' | 'subscription' | 'one_time' | 'free'
    amount: number
    currency: string
    freeTier?: {
      requests: number
      period: string
    }
  }
}

interface AgentInteractionRequest {
  inputText: string
  context?: Record<string, any>
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
    
    // Extract agent ID from path if present
    const agentId = segments[2] // /api/v1/agents/{id}
    const action = segments[3] // /api/v1/agents/{id}/interact

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
        if (agentId && action === 'interactions') {
          // GET /api/v1/agents/{id}/interactions
          return await getAgentInteractions(supabaseClient, agentId, tenantId, user.id)
        } else if (agentId) {
          // GET /api/v1/agents/{id}
          return await getAgent(supabaseClient, agentId, tenantId, user.id)
        } else {
          // GET /api/v1/agents
          return await getAgents(supabaseClient, tenantId, user.id)
        }

      case 'POST':
        if (agentId && action === 'interact') {
          // POST /api/v1/agents/{id}/interact
          const body: AgentInteractionRequest = await req.json()
          return await interactWithAgent(supabaseClient, agentId, body, tenantId, user.id)
        } else if (agentId && action === 'train') {
          // POST /api/v1/agents/{id}/train
          const body = await req.json()
          return await trainAgent(supabaseClient, agentId, body, tenantId, user.id)
        } else {
          // POST /api/v1/agents
          const body: AgentRequest = await req.json()
          return await createAgent(supabaseClient, body, tenantId, user.id)
        }

      case 'PUT':
        if (agentId) {
          // PUT /api/v1/agents/{id}
          const body: Partial<AgentRequest> = await req.json()
          return await updateAgent(supabaseClient, agentId, body, tenantId, user.id)
        }
        break

      case 'DELETE':
        if (agentId) {
          // DELETE /api/v1/agents/{id}
          return await deleteAgent(supabaseClient, agentId, tenantId, user.id)
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

async function getAgents(supabaseClient: any, tenantId: string, userId: string) {
  const { data, error } = await supabaseClient
    .from('ai_agents')
    .select(`
      id,
      name,
      description,
      capabilities,
      model,
      training_data,
      personality,
      pricing,
      status,
      metrics,
      created_at,
      updated_at
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ agents: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getAgent(supabaseClient: any, agentId: string, tenantId: string, userId: string) {
  const { data, error } = await supabaseClient
    .from('ai_agents')
    .select(`
      id,
      name,
      description,
      capabilities,
      model,
      training_data,
      personality,
      pricing,
      status,
      metrics,
      created_at,
      updated_at
    `)
    .eq('id', agentId)
    .eq('tenant_id', tenantId)
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ agent: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createAgent(supabaseClient: any, body: AgentRequest, tenantId: string, userId: string) {
  const { data, error } = await supabaseClient
    .from('ai_agents')
    .insert({
      tenant_id: tenantId,
      name: body.name,
      description: body.description,
      capabilities: body.capabilities,
      model: body.model,
      training_data: body.trainingData,
      personality: body.personality,
      pricing: body.pricing,
      status: 'draft'
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
    JSON.stringify({ agent: data }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateAgent(supabaseClient: any, agentId: string, body: Partial<AgentRequest>, tenantId: string, userId: string) {
  const { data, error } = await supabaseClient
    .from('ai_agents')
    .update({
      name: body.name,
      description: body.description,
      capabilities: body.capabilities,
      model: body.model,
      training_data: body.trainingData,
      personality: body.personality,
      pricing: body.pricing,
      updated_at: new Date().toISOString()
    })
    .eq('id', agentId)
    .eq('tenant_id', tenantId)
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ agent: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function deleteAgent(supabaseClient: any, agentId: string, tenantId: string, userId: string) {
  const { error } = await supabaseClient
    .from('ai_agents')
    .update({ status: 'inactive' })
    .eq('id', agentId)
    .eq('tenant_id', tenantId)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ message: 'Agent deleted successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function interactWithAgent(supabaseClient: any, agentId: string, body: AgentInteractionRequest, tenantId: string, userId: string) {
  // Get agent details
  const { data: agent, error: agentError } = await supabaseClient
    .from('ai_agents')
    .select('id, name, model, personality, status, metrics')
    .eq('id', agentId)
    .eq('tenant_id', tenantId)
    .single()

  if (agentError || !agent) {
    return new Response(
      JSON.stringify({ error: 'Agent not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (agent.status !== 'active') {
    return new Response(
      JSON.stringify({ error: 'Agent is not active' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Record interaction start
  const startTime = Date.now()
  const { data: interaction, error: interactionError } = await supabaseClient
    .from('agent_interactions')
    .insert({
      agent_id: agentId,
      user_id: userId,
      tenant_id: tenantId,
      input_text: body.inputText,
      status: 'processing'
    })
    .select()
    .single()

  if (interactionError) {
    return new Response(
      JSON.stringify({ error: interactionError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Process the interaction (simplified AI processing)
    const outputText = await processAgentInteraction(agent, body.inputText, body.context || {})
    const processingTime = (Date.now() - startTime) / 1000
    const cost = calculateInteractionCost(agent, processingTime)

    // Update interaction with results
    await supabaseClient
      .from('agent_interactions')
      .update({
        output_text: outputText,
        processing_time: processingTime,
        cost: cost,
        success: true,
        status: 'completed'
      })
      .eq('id', interaction.id)

    // Update agent metrics
    await updateAgentMetrics(supabaseClient, agentId, true, processingTime, cost)

    return new Response(
      JSON.stringify({ 
        interactionId: interaction.id,
        output: outputText,
        processingTime,
        cost
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    // Update interaction with error
    await supabaseClient
      .from('agent_interactions')
      .update({
        error_message: error.message,
        success: false,
        status: 'failed'
      })
      .eq('id', interaction.id)

    // Update agent metrics
    await updateAgentMetrics(supabaseClient, agentId, false, 0, 0)

    return new Response(
      JSON.stringify({ error: 'Agent interaction failed', interactionId: interaction.id }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function getAgentInteractions(supabaseClient: any, agentId: string, tenantId: string, userId: string) {
  const { data, error } = await supabaseClient
    .from('agent_interactions')
    .select(`
      id,
      input_text,
      output_text,
      processing_time,
      cost,
      success,
      error_message,
      created_at
    `)
    .eq('agent_id', agentId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ interactions: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function trainAgent(supabaseClient: any, agentId: string, body: any, tenantId: string, userId: string) {
  // Update agent status to training
  const { error: updateError } = await supabaseClient
    .from('ai_agents')
    .update({ 
      status: 'training',
      training_data: body.trainingData || []
    })
    .eq('id', agentId)
    .eq('tenant_id', tenantId)

  if (updateError) {
    return new Response(
      JSON.stringify({ error: updateError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Simulate training process (in production, this would be handled by a background job)
  setTimeout(async () => {
    await supabaseClient
      .from('ai_agents')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId)
  }, 5000) // Simulate 5 second training

  return new Response(
    JSON.stringify({ message: 'Agent training started' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Simplified AI processing function
async function processAgentInteraction(agent: any, inputText: string, context: any): Promise<string> {
  // This is a simplified implementation
  // In production, this would integrate with actual AI services like OpenAI, Anthropic, etc.
  
  const personality = agent.personality || {}
  const tone = personality.tone || 'professional'
  const expertise = personality.expertise || []
  
  // Simulate AI processing based on agent personality
  let response = `Based on your input: "${inputText}"\n\n`
  
  if (tone === 'professional') {
    response += "I understand your request and will provide a professional response. "
  } else if (tone === 'casual') {
    response += "Got it! Let me help you with that. "
  } else if (tone === 'friendly') {
    response += "I'd be happy to help! "
  }
  
  if (expertise.length > 0) {
    response += `Drawing from my expertise in ${expertise.join(', ')}, `
  }
  
  response += "here's what I can tell you about this topic. This is a simulated response from the AI agent."
  
  return response
}

function calculateInteractionCost(agent: any, processingTime: number): number {
  // Simplified cost calculation
  const baseCost = 0.001 // $0.001 per interaction
  const timeCost = processingTime * 0.0001 // $0.0001 per second
  return baseCost + timeCost
}

async function updateAgentMetrics(supabaseClient: any, agentId: string, success: boolean, processingTime: number, cost: number) {
  const { data: currentMetrics } = await supabaseClient
    .from('ai_agents')
    .select('metrics')
    .eq('id', agentId)
    .single()

  const metrics = currentMetrics?.metrics || {
    totalInteractions: 0,
    successRate: 0,
    averageResponseTime: 0,
    userRating: 0,
    revenue: 0
  }

  const newTotalInteractions = metrics.totalInteractions + 1
  const newSuccessCount = success ? (metrics.successRate * metrics.totalInteractions / 100) + 1 : (metrics.successRate * metrics.totalInteractions / 100)
  const newSuccessRate = (newSuccessCount / newTotalInteractions) * 100
  const newAverageResponseTime = ((metrics.averageResponseTime * metrics.totalInteractions) + processingTime) / newTotalInteractions
  const newRevenue = metrics.revenue + cost

  await supabaseClient
    .from('ai_agents')
    .update({
      metrics: {
        totalInteractions: newTotalInteractions,
        successRate: newSuccessRate,
        averageResponseTime: newAverageResponseTime,
        userRating: metrics.userRating, // This would be updated separately
        revenue: newRevenue
      }
    })
    .eq('id', agentId)
}
