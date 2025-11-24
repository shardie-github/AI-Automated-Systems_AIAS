/**
 * Supabase Database Helpers
 * Provides Prisma-like convenience functions for Supabase
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

type SupabaseClient = ReturnType<typeof createClient>;

/**
 * Get Supabase client with service role key (server-side only)
 */
export function getSupabaseClient(): SupabaseClient {
  return createClient(env.supabase.url, env.supabase.serviceRoleKey);
}

/**
 * Upsert helper (similar to Prisma's upsert)
 */
export async function upsert<T>(
  table: string,
  values: Partial<T>,
  onConflict: string = "id"
): Promise<T | null> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from(table)
    .upsert(values, {
      onConflict,
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }
  
  return data as T;
}

/**
 * Find unique helper (similar to Prisma's findUnique)
 */
export async function findUnique<T>(
  table: string,
  where: Record<string, any>
): Promise<T | null> {
  const client = getSupabaseClient();
  
  const key = Object.keys(where)[0];
  const value = where[key];
  
  const { data, error } = await client
    .from(table)
    .select("*")
    .eq(key, value)
    .single();
  
  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    throw new Error(`Supabase findUnique failed: ${error.message}`);
  }
  
  return data as T;
}

/**
 * Find many helper (similar to Prisma's findMany)
 */
export async function findMany<T>(
  table: string,
  where?: Record<string, any>,
  options?: {
    limit?: number;
    offset?: number;
    orderBy?: { column: string; ascending?: boolean };
  }
): Promise<T[]> {
  const client = getSupabaseClient();
  
  let query = client.from(table).select("*");
  
  if (where) {
    for (const [key, value] of Object.entries(where)) {
      query = query.eq(key, value);
    }
  }
  
  if (options?.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? true,
    });
  }
  
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Supabase findMany failed: ${error.message}`);
  }
  
  return (data || []) as T[];
}

/**
 * Create helper (similar to Prisma's create)
 */
export async function create<T>(
  table: string,
  data: Partial<T>
): Promise<T> {
  const client = getSupabaseClient();
  
  const { data: result, error } = await client
    .from(table)
    .insert(data)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Supabase create failed: ${error.message}`);
  }
  
  return result as T;
}

/**
 * Update helper (similar to Prisma's update)
 */
export async function update<T>(
  table: string,
  where: Record<string, any>,
  data: Partial<T>
): Promise<T | null> {
  const client = getSupabaseClient();
  
  const key = Object.keys(where)[0];
  const value = where[key];
  
  const { data: result, error } = await client
    .from(table)
    .update(data)
    .eq(key, value)
    .select()
    .single();
  
  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Supabase update failed: ${error.message}`);
  }
  
  return result as T;
}

/**
 * Delete helper (similar to Prisma's delete)
 */
export async function deleteRecord<T>(
  table: string,
  where: Record<string, any>
): Promise<T | null> {
  const client = getSupabaseClient();
  
  const key = Object.keys(where)[0];
  const value = where[key];
  
  const { data: result, error } = await client
    .from(table)
    .delete()
    .eq(key, value)
    .select()
    .single();
  
  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Supabase delete failed: ${error.message}`);
  }
  
  return result as T;
}

/**
 * Transaction helper (Supabase doesn't support transactions, use RPC functions)
 * For complex operations requiring transactions, create a PostgreSQL function
 */
export async function transaction<T>(
  callback: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  // Supabase doesn't have native transactions, but we can use RPC functions
  // For now, just execute the callback
  // TODO: Implement proper transaction handling via RPC functions
  const client = getSupabaseClient();
  return callback(client);
}

/**
 * Count helper
 */
export async function count(
  table: string,
  where?: Record<string, any>
): Promise<number> {
  const client = getSupabaseClient();
  
  let query = client.from(table).select("*", { count: "exact", head: true });
  
  if (where) {
    for (const [key, value] of Object.entries(where)) {
      query = query.eq(key, value);
    }
  }
  
  const { count, error } = await query;
  
  if (error) {
    throw new Error(`Supabase count failed: ${error.message}`);
  }
  
  return count ?? 0;
}
