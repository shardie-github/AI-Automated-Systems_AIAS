/**
 * EXAMPLE: Proper Client Component Pattern
 * 
 * This file demonstrates the strict production build safety rules:
 * 1. "use client" directive at the top
 * 2. No server-only imports
 * 3. Proper Image and Link usage
 * 4. Type-safe props
 */

"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createUser, type ServerActionResponse } from '@/lib/examples/server-action-example';

/**
 * Example: User Form Client Component
 * 
 * ✅ Follows all strict rules:
 * - "use client" at top
 * - Uses Image instead of img
 * - Uses Link instead of <a>
 * - Handles Server Action responses properly
 * - No server-only imports
 */
export function UserForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Call Server Action and handle structured response
    const result: ServerActionResponse = await createUser(formData);

    if (result.success && result.data) {
      setSuccess(true);
    } else {
      setError(result.error || 'Failed to create user');
    }

    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {/* ✅ Use Image component, not <img> */}
      <Image
        src="/logo.png"
        width={100}
        height={100}
        alt="Company Logo"
        className="mb-4"
      />

      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="border rounded p-2"
        />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="border rounded p-2"
        />
      </div>

      {error && (
        <div className="text-red-600" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-600" role="alert">
          User created successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create User'}
      </button>

      {/* ✅ Use Link component, not <a> */}
      <Link href="/users" className="text-blue-500 underline">
        View all users
      </Link>
    </form>
  );
}
