/**
 * EXAMPLE: Proper Middleware Pattern
 * 
 * This file demonstrates the strict production build safety rules:
 * 1. Edge runtime compatible (no Node.js APIs)
 * 2. Proper Supabase SSR cookie handling
 * 3. Type-safe environment variable access
 * 4. Returns specific response instance
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware runs on Edge Runtime
 * 
 * ✅ Follows all strict rules:
 * - No Node.js APIs (fs, path, etc.)
 * - Type-safe env var access
 * - Creates and returns specific response instance
 * - Handles cookies on response object
 */
export async function middleware(request: NextRequest) {
  // Type-safe environment variable access
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // In middleware, we can't throw - return error response
    return NextResponse.json(
      { error: 'Supabase configuration missing' },
      { status: 500 }
    );
  }

  // CRITICAL: Create response instance first
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client with cookie handling on the response
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // CRITICAL: Set cookies on the specific response instance
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Example: Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Example: Protect routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // CRITICAL: Return the specific response instance with cookies
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
