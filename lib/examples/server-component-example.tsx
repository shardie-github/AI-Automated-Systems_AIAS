/**
 * EXAMPLE: Proper Server Component Pattern
 * 
 * This file demonstrates the strict production build safety rules:
 * 1. No "use client" directive (default is server)
 * 2. Type-safe environment variable access
 * 3. Force dynamic when using cookies/headers
 * 4. Proper Supabase null handling
 */

import { headers } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';
import Link from 'next/link';
import Image from 'next/image';

/**
 * CRITICAL: If using cookies() or headers(), you MUST export dynamic
 * to prevent SSG failures
 */
export const dynamic = 'force-dynamic';

/**
 * Example: Server Component Page
 * 
 * ✅ Follows all strict rules:
 * - No "use client" (server by default)
 * - Force dynamic when using headers
 * - Type-safe env var access
 * - Proper null handling for Supabase data
 * - Uses Image and Link components
 */
export default async function UsersPage() {
  // Next.js 15: headers() must be awaited
  const headersList = await headers();

  // Type-safe environment variable access
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    // In Server Components, check before usage
    throw new Error('API_URL environment variable is required');
  }

  // Type-safe Supabase client
  const supabase = await createServerSupabaseClient();

  // Fetch data with proper null handling
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(10);

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <p className="text-red-600">Error loading users: {error.message}</p>
      </div>
    );
  }

  // CRITICAL: Supabase returns T[] | null, must handle null
  const users = data || [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      {/* ✅ Use Image component */}
      <Image
        src="/users-header.png"
        width={800}
        height={200}
        alt="Users Header"
        className="mb-4"
      />

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="border p-2 rounded">
              <Link
                href={`/users/${user.id}`}
                className="text-blue-500 hover:underline"
              >
                {user.name} ({user.email})
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* ✅ Use Link component, not <a> */}
      <Link
        href="/users/new"
        className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create New User
      </Link>
    </div>
  );
}
