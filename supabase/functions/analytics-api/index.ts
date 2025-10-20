import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsQuery {
  period: '7_days' | '30_days' | '90_days' | '1_year' | 'custom'
  startDate?: string
  endDate?: string
  metricType?: string
  tenantId?: string
  groupBy?: 'hour' | 'day' | 'week' | 'month'
}

interface RevenueAnalytics {
  totalRevenue: number
  monthlyRecurringRevenue: number
  annualRecurringRevenue: number
  revenueGrowth: number
  revenueByType: Record<string, number>
  revenueByPeriod: Array<{ period: string; amount: number }>
  topRevenueSources: Array<{ source: string; amount: number; percentage: number }>
}

interface UsageAnalytics {
  totalUsage: number
  usageByMetric: Record<string, number>
  usageGrowth: number
  usageByPeriod: Array<{ period: string; usage: number }>
  topUsedFeatures: Array<{ feature: string; usage: number; percentage: number }>
  usageEfficiency: number
}

interface PerformanceAnalytics {
  averageResponseTime: number
  successRate: number
  errorRate: number
  uptime: number
  performanceByService: Array<{ service: string; responseTime: number; successRate: number }>
  performanceTrends: Array<{ period: string; responseTime: number; successRate: number }>
}

interface BusinessIntelligence {
  customerAcquisitionCost: number
  customerLifetimeValue: number
  churnRate: number
  retentionRate: number
  conversionRate: number
  averageRevenuePerUser: number
  marketShare: number
  competitiveAnalysis: any
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
    
    // Extract resource from path
    const resource = segments[2] // /api/v1/analytics/{resource}
    const action = segments[3] // /api/v1/analytics/{resource}/{action}

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

    // Parse query parameters
    const query: AnalyticsQuery = {
      period: (urlObj.searchParams.get('period') as any) || '30_days',
      startDate: urlObj.searchParams.get('startDate') || undefined,
      endDate: urlObj.searchParams.get('endDate') || undefined,
      metricType: urlObj.searchParams.get('metricType') || undefined,
      groupBy: (urlObj.searchParams.get('groupBy') as any) || 'day'
    }

    switch (method) {
      case 'GET':
        if (resource === 'revenue') {
          // GET /api/v1/analytics/revenue
          return await getRevenueAnalytics(supabaseClient, tenantId, query)
        } else if (resource === 'usage') {
          // GET /api/v1/analytics/usage
          return await getUsageAnalytics(supabaseClient, tenantId, query)
        } else if (resource === 'performance') {
          // GET /api/v1/analytics/performance
          return await getPerformanceAnalytics(supabaseClient, tenantId, query)
        } else if (resource === 'business') {
          // GET /api/v1/analytics/business
          return await getBusinessIntelligence(supabaseClient, tenantId, query)
        } else if (resource === 'dashboard') {
          // GET /api/v1/analytics/dashboard
          return await getAnalyticsDashboard(supabaseClient, tenantId, query)
        } else if (resource === 'reports') {
          // GET /api/v1/analytics/reports
          return await getAnalyticsReports(supabaseClient, tenantId, query)
        } else if (resource === 'export') {
          // GET /api/v1/analytics/export
          return await exportAnalytics(supabaseClient, tenantId, query, urlObj.searchParams.get('format') || 'json')
        }
        break

      case 'POST':
        if (resource === 'reports' && action === 'generate') {
          // POST /api/v1/analytics/reports/generate
          const body = await req.json()
          return await generateCustomReport(supabaseClient, tenantId, body, user.id)
        } else if (resource === 'alerts' && action === 'create') {
          // POST /api/v1/analytics/alerts/create
          const body = await req.json()
          return await createAnalyticsAlert(supabaseClient, tenantId, body, user.id)
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

async function getRevenueAnalytics(supabaseClient: any, tenantId: string, query: AnalyticsQuery): Promise<Response> {
  const dateRange = getDateRange(query)
  
  // Get revenue data
  const { data: revenueData, error: revenueError } = await supabaseClient
    .from('revenue_streams')
    .select('type, amount, currency, created_at, metadata')
    .eq('tenant_id', tenantId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end)

  if (revenueError) {
    return new Response(
      JSON.stringify({ error: revenueError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get previous period for comparison
  const previousDateRange = getPreviousPeriodDateRange(query)
  const { data: previousRevenueData } = await supabaseClient
    .from('revenue_streams')
    .select('type, amount, currency, created_at')
    .eq('tenant_id', tenantId)
    .gte('created_at', previousDateRange.start)
    .lte('created_at', previousDateRange.end)

  const analytics: RevenueAnalytics = {
    totalRevenue: calculateTotalRevenue(revenueData || []),
    monthlyRecurringRevenue: calculateMRR(revenueData || []),
    annualRecurringRevenue: calculateARR(revenueData || []),
    revenueGrowth: calculateRevenueGrowth(revenueData || [], previousRevenueData || []),
    revenueByType: groupRevenueByType(revenueData || []),
    revenueByPeriod: groupRevenueByPeriod(revenueData || [], query.groupBy || 'day'),
    topRevenueSources: getTopRevenueSources(revenueData || [])
  }

  return new Response(
    JSON.stringify(analytics),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getUsageAnalytics(supabaseClient: any, tenantId: string, query: AnalyticsQuery): Promise<Response> {
  const dateRange = getDateRange(query)
  
  // Get usage data
  const { data: usageData, error: usageError } = await supabaseClient
    .from('tenant_usage')
    .select('metric_type, usage_count, period_start, period_end')
    .eq('tenant_id', tenantId)
    .gte('period_start', dateRange.start)
    .lte('period_end', dateRange.end)

  if (usageError) {
    return new Response(
      JSON.stringify({ error: usageError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get previous period for comparison
  const previousDateRange = getPreviousPeriodDateRange(query)
  const { data: previousUsageData } = await supabaseClient
    .from('tenant_usage')
    .select('metric_type, usage_count, period_start, period_end')
    .eq('tenant_id', tenantId)
    .gte('period_start', previousDateRange.start)
    .lte('period_end', previousDateRange.end)

  const analytics: UsageAnalytics = {
    totalUsage: calculateTotalUsage(usageData || []),
    usageByMetric: groupUsageByMetric(usageData || []),
    usageGrowth: calculateUsageGrowth(usageData || [], previousUsageData || []),
    usageByPeriod: groupUsageByPeriod(usageData || [], query.groupBy || 'day'),
    topUsedFeatures: getTopUsedFeatures(usageData || []),
    usageEfficiency: calculateUsageEfficiency(usageData || [])
  }

  return new Response(
    JSON.stringify(analytics),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getPerformanceAnalytics(supabaseClient: any, tenantId: string, query: AnalyticsQuery): Promise<Response> {
  const dateRange = getDateRange(query)
  
  // Get API usage data for performance metrics
  const { data: apiUsageData, error: apiError } = await supabaseClient
    .from('api_usage')
    .select('endpoint, method, status_code, response_time, created_at')
    .eq('tenant_id', tenantId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end)

  if (apiError) {
    return new Response(
      JSON.stringify({ error: apiError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get agent interaction data
  const { data: agentData } = await supabaseClient
    .from('agent_interactions')
    .select('processing_time, success, created_at')
    .eq('tenant_id', tenantId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end)

  const analytics: PerformanceAnalytics = {
    averageResponseTime: calculateAverageResponseTime(apiUsageData || []),
    successRate: calculateSuccessRate(apiUsageData || []),
    errorRate: calculateErrorRate(apiUsageData || []),
    uptime: calculateUptime(apiUsageData || []),
    performanceByService: getPerformanceByService(apiUsageData || []),
    performanceTrends: getPerformanceTrends(apiUsageData || [], query.groupBy || 'day')
  }

  return new Response(
    JSON.stringify(analytics),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getBusinessIntelligence(supabaseClient: any, tenantId: string, query: AnalyticsQuery): Promise<Response> {
  const dateRange = getDateRange(query)
  
  // Get tenant data
  const { data: tenant } = await supabaseClient
    .from('tenants')
    .select('created_at, subscription_plans(*)')
    .eq('id', tenantId)
    .single()

  // Get revenue data
  const { data: revenueData } = await supabaseClient
    .from('revenue_streams')
    .select('type, amount, created_at')
    .eq('tenant_id', tenantId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end)

  // Get usage data
  const { data: usageData } = await supabaseClient
    .from('tenant_usage')
    .select('metric_type, usage_count, period_start')
    .eq('tenant_id', tenantId)
    .gte('period_start', dateRange.start)

  // Get marketplace data
  const { data: marketplaceData } = await supabaseClient
    .from('purchases')
    .select('amount, created_at')
    .eq('tenant_id', tenantId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end)

  const analytics: BusinessIntelligence = {
    customerAcquisitionCost: calculateCAC(revenueData || [], tenant),
    customerLifetimeValue: calculateCLV(revenueData || [], tenant),
    churnRate: calculateChurnRate(tenant),
    retentionRate: calculateRetentionRate(tenant),
    conversionRate: calculateConversionRate(usageData || [], marketplaceData || []),
    averageRevenuePerUser: calculateARPU(revenueData || [], tenant),
    marketShare: calculateMarketShare(tenant),
    competitiveAnalysis: await getCompetitiveAnalysis(supabaseClient, tenant)
  }

  return new Response(
    JSON.stringify(analytics),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getAnalyticsDashboard(supabaseClient: any, tenantId: string, query: AnalyticsQuery): Promise<Response> {
  // Get all analytics data for dashboard
  const [revenueAnalytics, usageAnalytics, performanceAnalytics, businessIntelligence] = await Promise.all([
    getRevenueAnalytics(supabaseClient, tenantId, query),
    getUsageAnalytics(supabaseClient, tenantId, query),
    getPerformanceAnalytics(supabaseClient, tenantId, query),
    getBusinessIntelligence(supabaseClient, tenantId, query)
  ])

  const revenue = await revenueAnalytics.json()
  const usage = await usageAnalytics.json()
  const performance = await performanceAnalytics.json()
  const business = await businessIntelligence.json()

  // Get real-time metrics
  const { data: realTimeMetrics } = await supabaseClient
    .from('tenant_usage')
    .select('metric_type, usage_count')
    .eq('tenant_id', tenantId)
    .gte('period_start', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  const dashboard = {
    overview: {
      totalRevenue: revenue.totalRevenue,
      totalUsage: usage.totalUsage,
      averageResponseTime: performance.averageResponseTime,
      successRate: performance.successRate,
      customerLifetimeValue: business.customerLifetimeValue,
      churnRate: business.churnRate
    },
    revenue: revenue,
    usage: usage,
    performance: performance,
    business: business,
    realTime: {
      activeUsers: realTimeMetrics?.reduce((sum, item) => sum + item.usage_count, 0) || 0,
      lastUpdated: new Date().toISOString()
    },
    alerts: await getActiveAlerts(supabaseClient, tenantId),
    recommendations: await getRecommendations(supabaseClient, tenantId, revenue, usage, performance, business)
  }

  return new Response(
    JSON.stringify(dashboard),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getAnalyticsReports(supabaseClient: any, tenantId: string, query: AnalyticsQuery): Promise<Response> {
  const { data: reports, error } = await supabaseClient
    .from('analytics_reports')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ reports: reports || [] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function exportAnalytics(supabaseClient: any, tenantId: string, query: AnalyticsQuery, format: string): Promise<Response> {
  const analytics = await getAnalyticsDashboard(supabaseClient, tenantId, query)
  const data = await analytics.json()

  if (format === 'csv') {
    const csv = convertToCSV(data)
    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${tenantId}-${Date.now()}.csv"`
      }
    })
  } else if (format === 'pdf') {
    // In production, this would generate a PDF report
    const pdfData = await generatePDFReport(data)
    return new Response(pdfData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="analytics-${tenantId}-${Date.now()}.pdf"`
      }
    })
  }

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function generateCustomReport(supabaseClient: any, tenantId: string, body: any, userId: string): Promise<Response> {
  const { data: report, error } = await supabaseClient
    .from('analytics_reports')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      name: body.name,
      description: body.description,
      query: body.query,
      parameters: body.parameters,
      status: 'generating'
    })
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Generate report in background
  setTimeout(async () => {
    const reportData = await executeCustomQuery(supabaseClient, tenantId, body.query, body.parameters)
    await supabaseClient
      .from('analytics_reports')
      .update({
        data: reportData,
        status: 'completed',
        generated_at: new Date().toISOString()
      })
      .eq('id', report.id)
  }, 1000)

  return new Response(
    JSON.stringify({ reportId: report.id, message: 'Report generation started' }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createAnalyticsAlert(supabaseClient: any, tenantId: string, body: any, userId: string): Promise<Response> {
  const { data: alert, error } = await supabaseClient
    .from('analytics_alerts')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      name: body.name,
      description: body.description,
      metric: body.metric,
      condition: body.condition,
      threshold: body.threshold,
      frequency: body.frequency,
      channels: body.channels,
      active: true
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
    JSON.stringify({ alertId: alert.id, message: 'Alert created successfully' }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Helper functions
function getDateRange(query: AnalyticsQuery): { start: string; end: string } {
  const now = new Date()
  const end = query.endDate ? new Date(query.endDate) : now
  let start: Date

  if (query.startDate) {
    start = new Date(query.startDate)
  } else {
    start = new Date()
    switch (query.period) {
      case '7_days':
        start.setDate(start.getDate() - 7)
        break
      case '30_days':
        start.setDate(start.getDate() - 30)
        break
      case '90_days':
        start.setDate(start.getDate() - 90)
        break
      case '1_year':
        start.setFullYear(start.getFullYear() - 1)
        break
      default:
        start.setDate(start.getDate() - 30)
    }
  }

  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

function getPreviousPeriodDateRange(query: AnalyticsQuery): { start: string; end: string } {
  const currentRange = getDateRange(query)
  const duration = new Date(currentRange.end).getTime() - new Date(currentRange.start).getTime()
  const previousEnd = new Date(currentRange.start)
  const previousStart = new Date(previousEnd.getTime() - duration)

  return {
    start: previousStart.toISOString(),
    end: previousEnd.toISOString()
  }
}

function calculateTotalRevenue(revenueData: any[]): number {
  return revenueData.reduce((sum, item) => sum + parseFloat(item.amount), 0)
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

function calculateARR(revenueData: any[]): number {
  const monthlyRevenue = revenueData
    .filter(item => item.type === 'subscription' && item.period === 'monthly')
    .reduce((sum, item) => sum + parseFloat(item.amount), 0)
  
  const yearlyRevenue = revenueData
    .filter(item => item.type === 'subscription' && item.period === 'yearly')
    .reduce((sum, item) => sum + parseFloat(item.amount), 0)
  
  return (monthlyRevenue * 12) + yearlyRevenue
}

function calculateRevenueGrowth(current: any[], previous: any[]): number {
  const currentTotal = calculateTotalRevenue(current)
  const previousTotal = calculateTotalRevenue(previous)
  
  if (previousTotal === 0) return 0
  return ((currentTotal - previousTotal) / previousTotal) * 100
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

function groupRevenueByPeriod(revenueData: any[], groupBy: string): Array<{ period: string; amount: number }> {
  const grouped: Record<string, number> = {}
  
  revenueData.forEach(item => {
    const date = new Date(item.created_at)
    let period: string
    
    switch (groupBy) {
      case 'hour':
        period = date.toISOString().slice(0, 13) + ':00:00'
        break
      case 'day':
        period = date.toISOString().slice(0, 10)
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        period = weekStart.toISOString().slice(0, 10)
        break
      case 'month':
        period = date.toISOString().slice(0, 7)
        break
      default:
        period = date.toISOString().slice(0, 10)
    }
    
    if (!grouped[period]) {
      grouped[period] = 0
    }
    grouped[period] += parseFloat(item.amount)
  })
  
  return Object.entries(grouped).map(([period, amount]) => ({ period, amount }))
}

function getTopRevenueSources(revenueData: any[]): Array<{ source: string; amount: number; percentage: number }> {
  const total = calculateTotalRevenue(revenueData)
  const grouped = groupRevenueByType(revenueData)
  
  return Object.entries(grouped)
    .map(([source, amount]) => ({
      source,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
}

function calculateTotalUsage(usageData: any[]): number {
  return usageData.reduce((sum, item) => sum + item.usage_count, 0)
}

function groupUsageByMetric(usageData: any[]): Record<string, number> {
  const grouped: Record<string, number> = {}
  
  usageData.forEach(item => {
    if (!grouped[item.metric_type]) {
      grouped[item.metric_type] = 0
    }
    grouped[item.metric_type] += item.usage_count
  })
  
  return grouped
}

function calculateUsageGrowth(current: any[], previous: any[]): number {
  const currentTotal = calculateTotalUsage(current)
  const previousTotal = calculateTotalUsage(previous)
  
  if (previousTotal === 0) return 0
  return ((currentTotal - previousTotal) / previousTotal) * 100
}

function groupUsageByPeriod(usageData: any[], groupBy: string): Array<{ period: string; usage: number }> {
  const grouped: Record<string, number> = {}
  
  usageData.forEach(item => {
    const date = new Date(item.period_start)
    let period: string
    
    switch (groupBy) {
      case 'hour':
        period = date.toISOString().slice(0, 13) + ':00:00'
        break
      case 'day':
        period = date.toISOString().slice(0, 10)
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        period = weekStart.toISOString().slice(0, 10)
        break
      case 'month':
        period = date.toISOString().slice(0, 7)
        break
      default:
        period = date.toISOString().slice(0, 10)
    }
    
    if (!grouped[period]) {
      grouped[period] = 0
    }
    grouped[period] += item.usage_count
  })
  
  return Object.entries(grouped).map(([period, usage]) => ({ period, usage }))
}

function getTopUsedFeatures(usageData: any[]): Array<{ feature: string; usage: number; percentage: number }> {
  const total = calculateTotalUsage(usageData)
  const grouped = groupUsageByMetric(usageData)
  
  return Object.entries(grouped)
    .map(([feature, usage]) => ({
      feature,
      usage,
      percentage: total > 0 ? (usage / total) * 100 : 0
    }))
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 5)
}

function calculateUsageEfficiency(usageData: any[]): number {
  // Simplified efficiency calculation
  const totalUsage = calculateTotalUsage(usageData)
  const uniqueFeatures = new Set(usageData.map(item => item.metric_type)).size
  
  return uniqueFeatures > 0 ? totalUsage / uniqueFeatures : 0
}

function calculateAverageResponseTime(apiData: any[]): number {
  if (apiData.length === 0) return 0
  
  const totalTime = apiData.reduce((sum, item) => sum + (item.response_time || 0), 0)
  return totalTime / apiData.length
}

function calculateSuccessRate(apiData: any[]): number {
  if (apiData.length === 0) return 0
  
  const successCount = apiData.filter(item => item.status_code >= 200 && item.status_code < 300).length
  return (successCount / apiData.length) * 100
}

function calculateErrorRate(apiData: any[]): number {
  if (apiData.length === 0) return 0
  
  const errorCount = apiData.filter(item => item.status_code >= 400).length
  return (errorCount / apiData.length) * 100
}

function calculateUptime(apiData: any[]): number {
  if (apiData.length === 0) return 100
  
  const successCount = apiData.filter(item => item.status_code >= 200 && item.status_code < 300).length
  return (successCount / apiData.length) * 100
}

function getPerformanceByService(apiData: any[]): Array<{ service: string; responseTime: number; successRate: number }> {
  const serviceMap: Record<string, { totalTime: number; count: number; successCount: number }> = {}
  
  apiData.forEach(item => {
    const service = item.endpoint.split('/')[1] || 'unknown'
    
    if (!serviceMap[service]) {
      serviceMap[service] = { totalTime: 0, count: 0, successCount: 0 }
    }
    
    serviceMap[service].totalTime += item.response_time || 0
    serviceMap[service].count += 1
    
    if (item.status_code >= 200 && item.status_code < 300) {
      serviceMap[service].successCount += 1
    }
  })
  
  return Object.entries(serviceMap).map(([service, data]) => ({
    service,
    responseTime: data.count > 0 ? data.totalTime / data.count : 0,
    successRate: data.count > 0 ? (data.successCount / data.count) * 100 : 0
  }))
}

function getPerformanceTrends(apiData: any[], groupBy: string): Array<{ period: string; responseTime: number; successRate: number }> {
  const grouped: Record<string, { totalTime: number; count: number; successCount: number }> = {}
  
  apiData.forEach(item => {
    const date = new Date(item.created_at)
    let period: string
    
    switch (groupBy) {
      case 'hour':
        period = date.toISOString().slice(0, 13) + ':00:00'
        break
      case 'day':
        period = date.toISOString().slice(0, 10)
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        period = weekStart.toISOString().slice(0, 10)
        break
      case 'month':
        period = date.toISOString().slice(0, 7)
        break
      default:
        period = date.toISOString().slice(0, 10)
    }
    
    if (!grouped[period]) {
      grouped[period] = { totalTime: 0, count: 0, successCount: 0 }
    }
    
    grouped[period].totalTime += item.response_time || 0
    grouped[period].count += 1
    
    if (item.status_code >= 200 && item.status_code < 300) {
      grouped[period].successCount += 1
    }
  })
  
  return Object.entries(grouped).map(([period, data]) => ({
    period,
    responseTime: data.count > 0 ? data.totalTime / data.count : 0,
    successRate: data.count > 0 ? (data.successCount / data.count) * 100 : 0
  }))
}

function calculateCAC(revenueData: any[], tenant: any): number {
  // Simplified CAC calculation
  const marketingSpend = 1000 // This would come from marketing data
  const newCustomers = 1 // This would be calculated from actual data
  return newCustomers > 0 ? marketingSpend / newCustomers : 0
}

function calculateCLV(revenueData: any[], tenant: any): number {
  const totalRevenue = calculateTotalRevenue(revenueData)
  const customerCount = 1 // This would be calculated from actual data
  return customerCount > 0 ? totalRevenue / customerCount : 0
}

function calculateChurnRate(tenant: any): number {
  // Simplified churn rate calculation
  return 5.0 // 5% churn rate
}

function calculateRetentionRate(tenant: any): number {
  // Simplified retention rate calculation
  return 95.0 // 95% retention rate
}

function calculateConversionRate(usageData: any[], marketplaceData: any[]): number {
  const totalUsage = calculateTotalUsage(usageData)
  const totalPurchases = marketplaceData.length
  
  return totalUsage > 0 ? (totalPurchases / totalUsage) * 100 : 0
}

function calculateARPU(revenueData: any[], tenant: any): number {
  const totalRevenue = calculateTotalRevenue(revenueData)
  const userCount = 1 // This would be calculated from actual data
  return userCount > 0 ? totalRevenue / userCount : 0
}

function calculateMarketShare(tenant: any): number {
  // Simplified market share calculation
  return 0.5 // 0.5% market share
}

async function getCompetitiveAnalysis(supabaseClient: any, tenant: any): Promise<any> {
  // This would integrate with external competitive analysis services
  return {
    competitors: ['Competitor A', 'Competitor B', 'Competitor C'],
    marketPosition: 'Challenger',
    strengths: ['Feature A', 'Feature B'],
    weaknesses: ['Weakness A', 'Weakness B'],
    opportunities: ['Opportunity A', 'Opportunity B']
  }
}

async function getActiveAlerts(supabaseClient: any, tenantId: string): Promise<any[]> {
  const { data: alerts } = await supabaseClient
    .from('analytics_alerts')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(5)

  return alerts || []
}

async function getRecommendations(supabaseClient: any, tenantId: string, revenue: any, usage: any, performance: any, business: any): Promise<any[]> {
  const recommendations = []
  
  if (revenue.revenueGrowth < 0) {
    recommendations.push({
      type: 'revenue',
      priority: 'high',
      title: 'Revenue Decline Detected',
      description: 'Your revenue has decreased compared to the previous period. Consider reviewing your pricing strategy.',
      action: 'Review pricing and marketing strategies'
    })
  }
  
  if (performance.successRate < 95) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      title: 'Low Success Rate',
      description: 'Your API success rate is below 95%. Consider investigating error causes.',
      action: 'Review error logs and improve error handling'
    })
  }
  
  if (business.churnRate > 10) {
    recommendations.push({
      type: 'retention',
      priority: 'high',
      title: 'High Churn Rate',
      description: 'Your churn rate is above 10%. Focus on customer retention strategies.',
      action: 'Implement customer success programs'
    })
  }
  
  return recommendations
}

function convertToCSV(data: any): string {
  // Simplified CSV conversion
  const headers = ['Metric', 'Value']
  const rows = [
    ['Total Revenue', data.overview?.totalRevenue || 0],
    ['Total Usage', data.overview?.totalUsage || 0],
    ['Success Rate', data.overview?.successRate || 0],
    ['Customer Lifetime Value', data.overview?.customerLifetimeValue || 0]
  ]
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

async function generatePDFReport(data: any): Promise<Uint8Array> {
  // In production, this would generate an actual PDF
  // For now, return a simple text representation
  const text = `Analytics Report\n\nTotal Revenue: ${data.overview?.totalRevenue || 0}\nTotal Usage: ${data.overview?.totalUsage || 0}\n`
  return new TextEncoder().encode(text)
}

async function executeCustomQuery(supabaseClient: any, tenantId: string, query: string, parameters: any): Promise<any> {
  // In production, this would execute the custom query safely
  // For now, return mock data
  return { result: 'Custom query executed', parameters }
}