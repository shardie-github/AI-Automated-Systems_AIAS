import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MarketplaceItemRequest {
  type: 'template' | 'agent' | 'integration' | 'app'
  name: string
  description: string
  category: string
  price: number
  currency: string
  tags: string[]
  previewUrl?: string
  documentationUrl?: string
  requirements: string[]
  compatibility: string[]
}

interface PurchaseRequest {
  itemId: string
  paymentMethod: string
  billingInfo: {
    name: string
    email: string
    address: string
  }
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
    
    // Extract item ID from path if present
    const itemId = segments[2] // /api/v1/marketplace/{id}
    const action = segments[3] // /api/v1/marketplace/{id}/purchase

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

    switch (method) {
      case 'GET':
        if (itemId && action === 'reviews') {
          // GET /api/v1/marketplace/{id}/reviews
          return await getItemReviews(supabaseClient, itemId)
        } else if (itemId) {
          // GET /api/v1/marketplace/{id}
          return await getMarketplaceItem(supabaseClient, itemId)
        } else {
          // GET /api/v1/marketplace
          return await getMarketplaceItems(supabaseClient, urlObj.searchParams)
        }

      case 'POST':
        if (itemId && action === 'purchase') {
          // POST /api/v1/marketplace/{id}/purchase
          const body: PurchaseRequest = await req.json()
          return await purchaseItem(supabaseClient, itemId, body, user.id, tenantId)
        } else if (itemId && action === 'review') {
          // POST /api/v1/marketplace/{id}/review
          const body = await req.json()
          return await addItemReview(supabaseClient, itemId, body, user.id)
        } else {
          // POST /api/v1/marketplace
          const body: MarketplaceItemRequest = await req.json()
          return await createMarketplaceItem(supabaseClient, body, user.id)
        }

      case 'PUT':
        if (itemId) {
          // PUT /api/v1/marketplace/{id}
          const body: Partial<MarketplaceItemRequest> = await req.json()
          return await updateMarketplaceItem(supabaseClient, itemId, body, user.id)
        }
        break

      case 'DELETE':
        if (itemId) {
          // DELETE /api/v1/marketplace/{id}
          return await deleteMarketplaceItem(supabaseClient, itemId, user.id)
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

async function getMarketplaceItems(supabaseClient: any, searchParams: URLSearchParams) {
  const type = searchParams.get('type')
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabaseClient
    .from('marketplace_items')
    .select(`
      id,
      type,
      name,
      description,
      category,
      price,
      currency,
      downloads,
      rating,
      reviews,
      tags,
      preview_url,
      documentation_url,
      status,
      featured,
      created_at,
      updated_at,
      author_id
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) {
    query = query.eq('type', type)
  }

  if (category) {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`)
  }

  if (featured === 'true') {
    query = query.eq('featured', true)
  }

  const { data, error } = await query

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ items: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getMarketplaceItem(supabaseClient: any, itemId: string) {
  const { data, error } = await supabaseClient
    .from('marketplace_items')
    .select(`
      id,
      type,
      name,
      description,
      category,
      price,
      currency,
      downloads,
      rating,
      reviews,
      tags,
      preview_url,
      documentation_url,
      requirements,
      compatibility,
      status,
      featured,
      created_at,
      updated_at,
      author_id
    `)
    .eq('id', itemId)
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ item: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createMarketplaceItem(supabaseClient: any, body: MarketplaceItemRequest, userId: string) {
  const { data, error } = await supabaseClient
    .from('marketplace_items')
    .insert({
      type: body.type,
      name: body.name,
      description: body.description,
      category: body.category,
      price: body.price,
      currency: body.currency,
      tags: body.tags,
      preview_url: body.previewUrl,
      documentation_url: body.documentationUrl,
      requirements: body.requirements,
      compatibility: body.compatibility,
      author_id: userId,
      status: 'pending'
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
    JSON.stringify({ item: data }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateMarketplaceItem(supabaseClient: any, itemId: string, body: Partial<MarketplaceItemRequest>, userId: string) {
  const { data, error } = await supabaseClient
    .from('marketplace_items')
    .update({
      name: body.name,
      description: body.description,
      category: body.category,
      price: body.price,
      currency: body.currency,
      tags: body.tags,
      preview_url: body.previewUrl,
      documentation_url: body.documentationUrl,
      requirements: body.requirements,
      compatibility: body.compatibility,
      updated_at: new Date().toISOString()
    })
    .eq('id', itemId)
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
    JSON.stringify({ item: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function deleteMarketplaceItem(supabaseClient: any, itemId: string, userId: string) {
  const { error } = await supabaseClient
    .from('marketplace_items')
    .update({ status: 'archived' })
    .eq('id', itemId)
    .eq('author_id', userId)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ message: 'Item deleted successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function purchaseItem(supabaseClient: any, itemId: string, body: PurchaseRequest, userId: string, tenantId?: string) {
  // Get item details
  const { data: item, error: itemError } = await supabaseClient
    .from('marketplace_items')
    .select('id, name, price, currency, author_id, type')
    .eq('id', itemId)
    .eq('status', 'active')
    .single()

  if (itemError || !item) {
    return new Response(
      JSON.stringify({ error: 'Item not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Simulate payment processing (in production, integrate with Stripe/PayPal)
  const paymentResult = await processPayment({
    amount: item.price,
    currency: item.currency,
    paymentMethod: body.paymentMethod,
    billingInfo: body.billingInfo
  })

  if (!paymentResult.success) {
    return new Response(
      JSON.stringify({ error: 'Payment failed', details: paymentResult.error }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Record the purchase
  const { data: purchase, error: purchaseError } = await supabaseClient
    .from('purchases')
    .insert({
      item_id: itemId,
      buyer_id: userId,
      tenant_id: tenantId,
      amount: item.price,
      currency: item.currency,
      payment_method: body.paymentMethod,
      payment_id: paymentResult.paymentId,
      status: 'completed'
    })
    .select()
    .single()

  if (purchaseError) {
    return new Response(
      JSON.stringify({ error: purchaseError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Update item download count
  await supabaseClient
    .from('marketplace_items')
    .update({ downloads: supabaseClient.raw('downloads + 1') })
    .eq('id', itemId)

  // Record revenue for the author
  await supabaseClient
    .from('revenue_streams')
    .insert({
      tenant_id: item.author_id, // Author's tenant
      type: 'commission',
      name: `Marketplace sale: ${item.name}`,
      description: `Commission from marketplace item sale`,
      amount: item.price * 0.1, // 10% commission
      currency: item.currency,
      item_id: itemId,
      item_type: 'marketplace_item',
      metadata: {
        buyer_id: userId,
        purchase_id: purchase.id
      }
    })

  return new Response(
    JSON.stringify({ 
      purchaseId: purchase.id,
      paymentId: paymentResult.paymentId,
      message: 'Purchase completed successfully'
    }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getItemReviews(supabaseClient: any, itemId: string) {
  const { data, error } = await supabaseClient
    .from('marketplace_reviews')
    .select(`
      id,
      rating,
      review_text,
      created_at,
      auth.users (
        id,
        email,
        user_metadata
      )
    `)
    .eq('item_id', itemId)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ reviews: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function addItemReview(supabaseClient: any, itemId: string, body: any, userId: string) {
  const { data, error } = await supabaseClient
    .from('marketplace_reviews')
    .insert({
      item_id: itemId,
      user_id: userId,
      rating: body.rating,
      review_text: body.reviewText
    })
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Update item rating
  await updateItemRating(supabaseClient, itemId)

  return new Response(
    JSON.stringify({ review: data }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateItemRating(supabaseClient: any, itemId: string) {
  // Calculate average rating
  const { data: reviews } = await supabaseClient
    .from('marketplace_reviews')
    .select('rating')
    .eq('item_id', itemId)

  if (reviews && reviews.length > 0) {
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    
    await supabaseClient
      .from('marketplace_items')
      .update({
        rating: averageRating,
        reviews: reviews.length
      })
      .eq('id', itemId)
  }
}

// Simulated payment processing
async function processPayment(paymentData: any): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  // In production, this would integrate with actual payment processors
  // For now, simulate a successful payment
  
  if (paymentData.amount <= 0) {
    return { success: false, error: 'Invalid amount' }
  }

  if (!paymentData.paymentMethod) {
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
