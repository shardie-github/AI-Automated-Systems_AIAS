import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WorkflowRequest {
  name: string
  description?: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  price: number
  nodes: any[]
  connections: any[]
  tags?: string[]
}

interface WorkflowExecutionRequest {
  workflowId: string
  triggerData: Record<string, any>
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
    
    // Extract workflow ID from path if present
    const workflowId = segments[2] // /api/v1/workflows/{id}
    const action = segments[3] // /api/v1/workflows/{id}/execute

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
        if (workflowId && action === 'executions') {
          // GET /api/v1/workflows/{id}/executions
          return await getWorkflowExecutions(supabaseClient, workflowId, tenantId, user.id)
        } else if (workflowId) {
          // GET /api/v1/workflows/{id}
          return await getWorkflow(supabaseClient, workflowId, tenantId, user.id)
        } else {
          // GET /api/v1/workflows
          return await getWorkflows(supabaseClient, tenantId, user.id)
        }

      case 'POST':
        if (workflowId && action === 'execute') {
          // POST /api/v1/workflows/{id}/execute
          const body: WorkflowExecutionRequest = await req.json()
          return await executeWorkflow(supabaseClient, workflowId, body, tenantId, user.id)
        } else {
          // POST /api/v1/workflows
          const body: WorkflowRequest = await req.json()
          return await createWorkflow(supabaseClient, body, tenantId, user.id)
        }

      case 'PUT':
        if (workflowId) {
          // PUT /api/v1/workflows/{id}
          const body: Partial<WorkflowRequest> = await req.json()
          return await updateWorkflow(supabaseClient, workflowId, body, tenantId, user.id)
        }
        break

      case 'DELETE':
        if (workflowId) {
          // DELETE /api/v1/workflows/{id}
          return await deleteWorkflow(supabaseClient, workflowId, tenantId, user.id)
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

async function getWorkflows(supabaseClient: any, tenantId: string, userId: string) {
  const { data, error } = await supabaseClient
    .from('workflow_templates')
    .select(`
      id,
      name,
      description,
      category,
      difficulty,
      price,
      nodes,
      connections,
      tags,
      status,
      downloads,
      rating,
      created_at,
      updated_at,
      author_id
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
    JSON.stringify({ workflows: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getWorkflow(supabaseClient: any, workflowId: string, tenantId: string, userId: string) {
  const { data, error } = await supabaseClient
    .from('workflow_templates')
    .select(`
      id,
      name,
      description,
      category,
      difficulty,
      price,
      nodes,
      connections,
      tags,
      status,
      downloads,
      rating,
      created_at,
      updated_at,
      author_id
    `)
    .eq('id', workflowId)
    .eq('tenant_id', tenantId)
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ workflow: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createWorkflow(supabaseClient: any, body: WorkflowRequest, tenantId: string, userId: string) {
  const { data, error } = await supabaseClient
    .from('workflow_templates')
    .insert({
      tenant_id: tenantId,
      name: body.name,
      description: body.description,
      category: body.category,
      difficulty: body.difficulty,
      price: body.price,
      nodes: body.nodes,
      connections: body.connections,
      tags: body.tags || [],
      author_id: userId,
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
    JSON.stringify({ workflow: data }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateWorkflow(supabaseClient: any, workflowId: string, body: Partial<WorkflowRequest>, tenantId: string, userId: string) {
  const { data, error } = await supabaseClient
    .from('workflow_templates')
    .update({
      name: body.name,
      description: body.description,
      category: body.category,
      difficulty: body.difficulty,
      price: body.price,
      nodes: body.nodes,
      connections: body.connections,
      tags: body.tags,
      updated_at: new Date().toISOString()
    })
    .eq('id', workflowId)
    .eq('tenant_id', tenantId)
    .eq('author_id', userId)
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ workflow: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function deleteWorkflow(supabaseClient: any, workflowId: string, tenantId: string, userId: string) {
  const { error } = await supabaseClient
    .from('workflow_templates')
    .update({ status: 'archived' })
    .eq('id', workflowId)
    .eq('tenant_id', tenantId)
    .eq('author_id', userId)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ message: 'Workflow deleted successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function executeWorkflow(supabaseClient: any, workflowId: string, body: WorkflowExecutionRequest, tenantId: string, userId: string) {
  // Check if workflow exists and user has access
  const { data: workflow, error: workflowError } = await supabaseClient
    .from('workflow_templates')
    .select('id, name, nodes, connections, status')
    .eq('id', workflowId)
    .eq('tenant_id', tenantId)
    .single()

  if (workflowError || !workflow) {
    return new Response(
      JSON.stringify({ error: 'Workflow not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (workflow.status !== 'published') {
    return new Response(
      JSON.stringify({ error: 'Workflow is not published' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Create workflow execution record
  const { data: execution, error: executionError } = await supabaseClient
    .from('workflow_executions')
    .insert({
      workflow_id: workflowId,
      tenant_id: tenantId,
      status: 'running',
      trigger_data: body.triggerData,
      context: body.context || {},
      start_time: new Date().toISOString()
    })
    .select()
    .single()

  if (executionError) {
    return new Response(
      JSON.stringify({ error: executionError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Start workflow execution (this would be handled by a background job in production)
  try {
    await executeWorkflowSteps(supabaseClient, execution.id, workflow, body.triggerData, body.context || {})
  } catch (error) {
    // Update execution status to failed
    await supabaseClient
      .from('workflow_executions')
      .update({
        status: 'failed',
        error_message: error.message,
        end_time: new Date().toISOString()
      })
      .eq('id', execution.id)

    return new Response(
      JSON.stringify({ error: 'Workflow execution failed', executionId: execution.id }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ executionId: execution.id, status: 'running' }),
    { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getWorkflowExecutions(supabaseClient: any, workflowId: string, tenantId: string, userId: string) {
  const { data, error } = await supabaseClient
    .from('workflow_executions')
    .select(`
      id,
      status,
      trigger_data,
      context,
      start_time,
      end_time,
      error_message,
      created_at
    `)
    .eq('workflow_id', workflowId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ executions: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Simplified workflow execution engine
async function executeWorkflowSteps(supabaseClient: any, executionId: string, workflow: any, triggerData: any, context: any) {
  const nodes = workflow.nodes || []
  const connections = workflow.connections || []
  
  // Find start node (trigger node)
  const startNode = nodes.find((node: any) => node.type === 'trigger')
  if (!startNode) {
    throw new Error('No trigger node found')
  }

  // Execute nodes in order (simplified implementation)
  let currentNode = startNode
  const executionContext = { ...context, triggerData }
  
  while (currentNode) {
    // Execute current node
    const result = await executeNode(currentNode, executionContext)
    
    // Update execution context
    executionContext[currentNode.id] = result
    
    // Find next node
    const nextConnection = connections.find((conn: any) => conn.from === currentNode.id)
    if (nextConnection) {
      currentNode = nodes.find((node: any) => node.id === nextConnection.to)
    } else {
      currentNode = null
    }
  }

  // Update execution status to completed
  await supabaseClient
    .from('workflow_executions')
    .update({
      status: 'completed',
      end_time: new Date().toISOString()
    })
    .eq('id', executionId)
}

// Simplified node execution
async function executeNode(node: any, context: any) {
  switch (node.type) {
    case 'trigger':
      return context.triggerData
    case 'action':
      // Simulate action execution
      return { success: true, data: `Action ${node.config?.action} executed` }
    case 'condition':
      // Simulate condition evaluation
      return { condition: true, result: 'Condition met' }
    case 'ai_processing':
      // Simulate AI processing
      return { aiResult: 'AI processing completed', confidence: 0.95 }
    default:
      return { success: true, data: 'Node executed' }
  }
}
