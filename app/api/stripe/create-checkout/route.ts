/**
 * Stripe Checkout Route (App Router)
 * 
 * ⚠️ DEPRECATED: Redirects to new endpoint
 * New App Router version available at: app/api/stripe/create-checkout-app/route.ts
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Redirect to new endpoint for backward compatibility
  const body = await request.json();
  const newUrl = new URL('/api/stripe/create-checkout-app', request.url);
  
  // Forward the request to the new endpoint
  const response = await fetch(newUrl.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
