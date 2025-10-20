import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubscriptionRequest {
  planId: string
  billingCycle: 'monthly' | 'yearly'
  paymentMethodId?: string
  couponCode?: string
}

interface UsageRequest {
  metricType: string
  usageCount: number
  period?: string
}

interface InvoiceRequest {
  tenantId: string
  periodStart: string
  periodEnd: string
  includeUsage?: boolean
}

interface PaymentRequest {
  amount: number
  currency: string
  paymentMethodId: string
  description?: string
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
    
    // Extract resource ID from path if present
    const resourceId = segments[2] // /api/v1/billing/{id}
    const action = segments[3] // /api/v1/billing/{id}/invoices

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
        if (resourceId === 'subscription') {
          // GET /api/v1/billing/subscription
          return await getSubscription(supabaseClient, tenantId)
        } else if (resourceId === 'usage') {
          // GET /api/v1/billing/usage
          return await getUsage(supabaseClient, tenantId, urlObj.searchParams)
        } else if (resourceId === 'invoices') {
          // GET /api/v1/billing/invoices
          return await getInvoices(supabaseClient, tenantId, urlObj.searchParams)
        } else if (resourceId === 'plans') {
          // GET /api/v1/billing/plans
          return await getSubscriptionPlans(supabaseClient)
        } else if (resourceId === 'analytics') {
          // GET /api/v1/billing/analytics
          return await getBillingAnalytics(supabaseClient, tenantId, urlObj.searchParams)
        } else if (resourceId && action === 'pay') {
          // GET /api/v1/billing/{invoiceId}/pay
          return await getPaymentLink(supabaseClient, resourceId, tenantId)
        }
        break

      case 'POST':
        if (resourceId === 'subscription') {
          // POST /api/v1/billing/subscription
          const body: SubscriptionRequest = await req.json()
          return await createSubscription(supabaseClient, body, tenantId, user.id)
        } else if (resourceId === 'usage') {
          // POST /api/v1/billing/usage
          const body: UsageRequest = await req.json()
          return await trackUsage(supabaseClient, body, tenantId)
        } else if (resourceId === 'invoices') {
          // POST /api/v1/billing/invoices
          const body: InvoiceRequest = await req.json()
          return await generateInvoice(supabaseClient, body, tenantId)
        } else if (resourceId === 'payment') {
          // POST /api/v1/billing/payment
          const body: PaymentRequest = await req.json()
          return await processPayment(supabaseClient, body, tenantId, user.id)
        } else if (resourceId && action === 'upgrade') {
          // POST /api/v1/billing/{subscriptionId}/upgrade
          const body = await req.json()
          return await upgradeSubscription(supabaseClient, resourceId, body, tenantId, user.id)
        } else if (resourceId && action === 'cancel') {
          // POST /api/v1/billing/{subscriptionId}/cancel
          return await cancelSubscription(supabaseClient, resourceId, tenantId, user.id)
        }
        break

      case 'PUT':
        if (resourceId === 'subscription') {
          // PUT /api/v1/billing/subscription
          const body = await req.json()
          return await updateSubscription(supabaseClient, body, tenantId, user.id)
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

async function getSubscription(supabaseClient: any, tenantId: string) {
  const { data, error } = await supabaseClient
    .from('tenants')
    .select(`
      id,
      status,
      subscription_plans (
        id,
        name,
        description,
        price_monthly,
        price_yearly,
        features,
        limits,
        tier
      ),
      settings,
      limits,
      created_at
    `)
    .eq('id', tenantId)
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get subscription history
  const { data: subscriptionHistory } = await supabaseClient
    .from('subscription_history')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(10)

  return new Response(
    JSON.stringify({ 
      subscription: data,
      history: subscriptionHistory || []
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getUsage(supabaseClient: any, tenantId: string, searchParams: URLSearchParams) {
  const period = searchParams.get('period') || 'current'
  const metricType = searchParams.get('metricType')

  let query = supabaseClient
    .from('tenant_usage')
    .select('*')
    .eq('tenant_id', tenantId)

  if (metricType) {
    query = query.eq('metric_type', metricType)
  }

  if (period === 'current') {
    const currentMonth = new Date()
    currentMonth.setDate(1)
    query = query.gte('period_start', currentMonth.toISOString())
  } else if (period === 'last_30_days') {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    query = query.gte('period_start', thirtyDaysAgo.toISOString())
  }

  const { data, error } = await query.order('period_start', { ascending: false })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get tenant limits for comparison
  const { data: tenant } = await supabaseClient
    .from('tenants')
    .select('limits')
    .eq('id', tenantId)
    .single()

  return new Response(
    JSON.stringify({ 
      usage: data,
      limits: tenant?.limits || {},
      period
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getInvoices(supabaseClient: any, tenantId: string, searchParams: URLSearchParams) {
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')
  const status = searchParams.get('status')

  let query = supabaseClient
    .from('invoices')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ invoices: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getSubscriptionPlans(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('subscription_plans')
    .select('*')
    .eq('active', true)
    .order('price_monthly', { ascending: true })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ plans: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getBillingAnalytics(supabaseClient: any, tenantId: string, searchParams: URLSearchParams) {
  const period = searchParams.get('period') || '30_days'
  const startDate = new Date()
  
  if (period === '30_days') {
    startDate.setDate(startDate.getDate() - 30)
  } else if (period === '90_days') {
    startDate.setDate(startDate.getDate() - 90)
  } else if (period === '1_year') {
    startDate.setFullYear(startDate.getFullYear() - 1)
  }

  // Get revenue data
  const { data: revenueData } = await supabaseClient
    .from('revenue_streams')
    .select('type, amount, currency, created_at')
    .eq('tenant_id', tenantId)
    .gte('created_at', startDate.toISOString())

  // Get usage data
  const { data: usageData } = await supabaseClient
    .from('tenant_usage')
    .select('metric_type, usage_count, period_start')
    .eq('tenant_id', tenantId)
    .gte('period_start', startDate.toISOString())

  // Calculate analytics
  const totalRevenue = revenueData?.reduce((sum, item) => sum + parseFloat(item.amount), 0) || 0
  const monthlyRecurringRevenue = calculateMRR(revenueData || [])
  const usageByMetric = calculateUsageByMetric(usageData || [])

  return new Response(
    JSON.stringify({
      period,
      totalRevenue,
      monthlyRecurringRevenue,
      revenueBreakdown: groupRevenueByType(revenueData || []),
      usageBreakdown: usageByMetric,
      growthMetrics: calculateGrowthMetrics(revenueData || [], usageData || [])
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createSubscription(supabaseClient: any, body: SubscriptionRequest, tenantId: string, userId: string) {
  // Get plan details
  const { data: plan, error: planError } = await supabaseClient
    .from('subscription_plans')
    .select('*')
    .eq('id', body.planId)
    .single()

  if (planError || !plan) {
    return new Response(
      JSON.stringify({ error: 'Plan not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Calculate pricing
  const price = body.billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly
  const billingPeriod = body.billingCycle === 'yearly' ? 'yearly' : 'monthly'

  // Apply coupon if provided
  let finalPrice = price
  let discountAmount = 0
  if (body.couponCode) {
    const { data: coupon } = await supabaseClient
      .from('coupons')
      .select('*')
      .eq('code', body.couponCode)
      .eq('active', true)
      .single()

    if (coupon) {
      if (coupon.type === 'percentage') {
        discountAmount = (price * coupon.value) / 100
      } else {
        discountAmount = coupon.value
      }
      finalPrice = Math.max(0, price - discountAmount)
    }
  }

  // Process payment
  const paymentResult = await processPaymentInternal({
    amount: finalPrice,
    currency: 'USD',
    paymentMethodId: body.paymentMethodId,
    description: `Subscription to ${plan.name} (${billingPeriod})`
  })

  if (!paymentResult.success) {
    return new Response(
      JSON.stringify({ error: 'Payment failed', details: paymentResult.error }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Update tenant subscription
  const { error: updateError } = await supabaseClient
    .from('tenants')
    .update({
      plan_id: body.planId,
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', tenantId)

  if (updateError) {
    return new Response(
      JSON.stringify({ error: updateError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Record subscription history
  await supabaseClient
    .from('subscription_history')
    .insert({
      tenant_id: tenantId,
      plan_id: body.planId,
      billing_cycle: billingPeriod,
      amount: finalPrice,
      discount_amount: discountAmount,
      payment_id: paymentResult.paymentId,
      status: 'active'
    })

  // Record revenue
  await supabaseClient
    .from('revenue_streams')
    .insert({
      tenant_id: tenantId,
      type: 'subscription',
      name: `Subscription: ${plan.name}`,
      description: `${billingPeriod} subscription`,
      amount: finalPrice,
      currency: 'USD',
      period: billingPeriod,
      metadata: {
        plan_id: body.planId,
        payment_id: paymentResult.paymentId,
        discount_amount: discountAmount
      }
    })

  return new Response(
    JSON.stringify({ 
      subscriptionId: paymentResult.paymentId,
      message: 'Subscription created successfully',
      nextBillingDate: calculateNextBillingDate(billingPeriod)
    }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function trackUsage(supabaseClient: any, body: UsageRequest, tenantId: string) {
  // Check if user has permission to track usage
  const { data: tenant } = await supabaseClient
    .from('tenants')
    .select('limits')
    .eq('id', tenantId)
    .single()

  if (!tenant) {
    return new Response(
      JSON.stringify({ error: 'Tenant not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check limits
  const limitValue = tenant.limits?.[body.metricType]
  if (limitValue && limitValue !== -1) {
    const { data: currentUsage } = await supabaseClient
      .from('tenant_usage')
      .select('usage_count')
      .eq('tenant_id', tenantId)
      .eq('metric_type', body.metricType)
      .gte('period_start', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .single()

    const totalUsage = (currentUsage?.usage_count || 0) + body.usageCount
    if (totalUsage > limitValue) {
      return new Response(
        JSON.stringify({ 
          error: 'Usage limit exceeded',
          currentUsage: totalUsage,
          limit: limitValue,
          metricType: body.metricType
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  // Track usage
  const { error } = await supabaseClient.rpc('track_usage', {
    p_tenant_id: tenantId,
    p_metric_type: body.metricType,
    p_increment: body.usageCount
  })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ message: 'Usage tracked successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function generateInvoice(supabaseClient: any, body: InvoiceRequest, tenantId: string) {
  // Get tenant details
  const { data: tenant } = await supabaseClient
    .from('tenants')
    .select('name, subscription_plans(*)')
    .eq('id', tenantId)
    .single()

  if (!tenant) {
    return new Response(
      JSON.stringify({ error: 'Tenant not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Calculate invoice amount
  const plan = tenant.subscription_plans
  const baseAmount = plan.price_monthly || 0

  // Get usage-based charges if requested
  let usageCharges = 0
  if (body.includeUsage) {
    const { data: usageData } = await supabaseClient
      .from('tenant_usage')
      .select('metric_type, usage_count')
      .eq('tenant_id', tenantId)
      .gte('period_start', body.periodStart)
      .lte('period_end', body.periodEnd)

    // Calculate overage charges (simplified)
    usageCharges = calculateUsageCharges(usageData || [], plan.limits)
  }

  const totalAmount = baseAmount + usageCharges

  // Create invoice
  const { data: invoice, error } = await supabaseClient
    .from('invoices')
    .insert({
      tenant_id: tenantId,
      invoice_number: `INV-${Date.now()}`,
      amount: totalAmount,
      currency: 'USD',
      status: 'pending',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      period_start: body.periodStart,
      period_end: body.periodEnd,
      line_items: [
        {
          description: `${plan.name} subscription`,
          amount: baseAmount,
          quantity: 1
        },
        ...(usageCharges > 0 ? [{
          description: 'Usage overage charges',
          amount: usageCharges,
          quantity: 1
        }] : [])
      ]
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
    JSON.stringify({ invoice }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function processPayment(supabaseClient: any, body: PaymentRequest, tenantId: string, userId: string) {
  const paymentResult = await processPaymentInternal(body)

  if (!paymentResult.success) {
    return new Response(
      JSON.stringify({ error: 'Payment failed', details: paymentResult.error }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Record payment
  await supabaseClient
    .from('payments')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      amount: body.amount,
      currency: body.currency,
      payment_method_id: body.paymentMethodId,
      payment_id: paymentResult.paymentId,
      status: 'completed',
      description: body.description
    })

  return new Response(
    JSON.stringify({ 
      paymentId: paymentResult.paymentId,
      message: 'Payment processed successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function upgradeSubscription(supabaseClient: any, subscriptionId: string, body: any, tenantId: string, userId: string) {
  // Get new plan details
  const { data: newPlan, error: planError } = await supabaseClient
    .from('subscription_plans')
    .select('*')
    .eq('id', body.planId)
    .single()

  if (planError || !newPlan) {
    return new Response(
      JSON.stringify({ error: 'Plan not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Calculate prorated amount
  const proratedAmount = calculateProratedAmount(tenantId, newPlan, body.billingCycle)

  // Process payment for upgrade
  const paymentResult = await processPaymentInternal({
    amount: proratedAmount,
    currency: 'USD',
    paymentMethodId: body.paymentMethodId,
    description: `Upgrade to ${newPlan.name}`
  })

  if (!paymentResult.success) {
    return new Response(
      JSON.stringify({ error: 'Payment failed', details: paymentResult.error }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Update subscription
  await supabaseClient
    .from('tenants')
    .update({
      plan_id: body.planId,
      updated_at: new Date().toISOString()
    })
    .eq('id', tenantId)

  // Record upgrade
  await supabaseClient
    .from('subscription_history')
    .insert({
      tenant_id: tenantId,
      plan_id: body.planId,
      billing_cycle: body.billingCycle,
      amount: proratedAmount,
      payment_id: paymentResult.paymentId,
      status: 'upgraded',
      previous_plan_id: body.previousPlanId
    })

  return new Response(
    JSON.stringify({ 
      message: 'Subscription upgraded successfully',
      paymentId: paymentResult.paymentId
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function cancelSubscription(supabaseClient: any, subscriptionId: string, tenantId: string, userId: string) {
  // Update tenant status
  await supabaseClient
    .from('tenants')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', tenantId)

  // Record cancellation
  await supabaseClient
    .from('subscription_history')
    .insert({
      tenant_id: tenantId,
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })

  return new Response(
    JSON.stringify({ message: 'Subscription cancelled successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateSubscription(supabaseClient: any, body: any, tenantId: string, userId: string) {
  // Update subscription settings
  const { error } = await supabaseClient
    .from('tenants')
    .update({
      settings: body.settings,
      updated_at: new Date().toISOString()
    })
    .eq('id', tenantId)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ message: 'Subscription updated successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getPaymentLink(supabaseClient: any, invoiceId: string, tenantId: string) {
  const { data: invoice, error } = await supabaseClient
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('tenant_id', tenantId)
    .single()

  if (error || !invoice) {
    return new Response(
      JSON.stringify({ error: 'Invoice not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Generate payment link (simplified)
  const paymentLink = `https://payments.example.com/pay/${invoiceId}`

  return new Response(
    JSON.stringify({ paymentLink }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Helper functions
async function processPaymentInternal(paymentData: any): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  // In production, this would integrate with actual payment processors like Stripe
  // For now, simulate payment processing
  
  if (paymentData.amount <= 0) {
    return { success: false, error: 'Invalid amount' }
  }

  if (!paymentData.paymentMethodId) {
    return { success: false, error: 'Payment method required' }
  }

  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Simulate 95% success rate
  if (Math.random() < 0.95) {
    return {
      success: true,
      paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  } else {
    return {
      success: false,
      error: 'Payment declined by bank'
    }
  }
}

function calculateMRR(revenueData: any[]): number {
  const monthlyRevenue = revenueData
    .filter(item => item.type === 'subscription' && item.period === 'monthly')
    .reduce((sum, item) => sum + parseFloat(item.amount), 0)
  
  const yearlyRevenue = revenueData
    .filter(item => item.type === 'subscription' && item.period === 'yearly')
    .reduce((sum, item) => sum + parseFloat(item.amount), 0)
  
  return monthlyRevenue + (yearlyRevenue / 12)
}

function calculateUsageByMetric(usageData: any[]): Record<string, number> {
  const usageByMetric: Record<string, number> = {}
  
  usageData.forEach(item => {
    if (!usageByMetric[item.metric_type]) {
      usageByMetric[item.metric_type] = 0
    }
    usageByMetric[item.metric_type] += item.usage_count
  })
  
  return usageByMetric
}

function groupRevenueByType(revenueData: any[]): Record<string, number> {
  const grouped: Record<string, number> = {}
  
  revenueData.forEach(item => {
    if (!grouped[item.type]) {
      grouped[item.type] = 0
    }
    grouped[item.type] += parseFloat(item.amount)
  })
  
  return grouped
}

function calculateGrowthMetrics(revenueData: any[], usageData: any[]): any {
  // Simplified growth calculation
  const currentPeriod = revenueData.length
  const previousPeriod = Math.max(0, currentPeriod - 1)
  
  return {
    revenueGrowth: previousPeriod > 0 ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 : 0,
    usageGrowth: previousPeriod > 0 ? ((usageData.length - previousPeriod) / previousPeriod) * 100 : 0
  }
}

function calculateUsageCharges(usageData: any[], limits: any): number {
  let totalCharges = 0
  
  usageData.forEach(item => {
    const limit = limits[item.metric_type]
    if (limit && limit !== -1 && item.usage_count > limit) {
      const overage = item.usage_count - limit
      const overageRate = 0.01 // $0.01 per overage unit
      totalCharges += overage * overageRate
    }
  })
  
  return totalCharges
}

function calculateProratedAmount(tenantId: string, newPlan: any, billingCycle: string): number {
  // Simplified prorated calculation
  const price = billingCycle === 'yearly' ? newPlan.price_yearly : newPlan.price_monthly
  return price * 0.5 // 50% prorated for demo
}

function calculateNextBillingDate(billingCycle: string): string {
  const nextDate = new Date()
  if (billingCycle === 'yearly') {
    nextDate.setFullYear(nextDate.getFullYear() + 1)
  } else {
    nextDate.setMonth(nextDate.getMonth() + 1)
  }
  return nextDate.toISOString()
}