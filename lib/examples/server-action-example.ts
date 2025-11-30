/**
 * EXAMPLE: Proper Server Action Pattern
 * 
 * This file demonstrates the strict production build safety rules:
 * 1. "use server" directive at the top
 * 2. Structured error responses (never throw raw errors)
 * 3. Type-safe environment variable access
 * 4. Proper error handling
 */

"use server";

import type { Database } from '@/types/supabase';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Server Action Response Type
 * All Server Actions should return this structured format
 */
export type ServerActionResponse<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
};

/**
 * Example: Create User Server Action
 * 
 * ✅ Follows all strict rules:
 * - "use server" at top
 * - Returns structured response
 * - Type-safe env var access
 * - Proper error handling
 * - No implicit any
 */
export async function createUser(
  formData: FormData
): Promise<ServerActionResponse<Database['public']['Tables']['users']['Row']>> {
  try {
    // Type-safe environment variable access
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: 'API_KEY environment variable is not configured',
      };
    }

    // Type-safe Supabase client
    const supabase = await createServerSupabaseClient();

    // Get form data with validation
    const email = formData.get('email');
    const name = formData.get('name');

    if (!email || typeof email !== 'string') {
      return {
        success: false,
        error: 'Email is required',
      };
    }

    if (!name || typeof name !== 'string') {
      return {
        success: false,
        error: 'Name is required',
      };
    }

    // Supabase query with null safety
    const { data, error } = await supabase
      .from('users')
      .insert({ email, name })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'Failed to create user',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    // Never throw - always return structured response
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Example: Fetch Users Server Action
 * 
 * ✅ Demonstrates:
 * - Null safety for Supabase arrays
 * - Proper type usage
 */
export async function getUsers(): Promise<
  ServerActionResponse<Database['public']['Tables']['users']['Row'][]>
> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.from('users').select('*');

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // CRITICAL: Supabase returns T[] | null, must handle null
    const users = data || [];

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
