# Strict Production Build Safety Rules

This document outlines the critical rules for ensuring Next.js + Supabase + Vercel builds succeed in production.

## 🚨 Critical Rules Summary

### 1. Environment Variables
- ✅ **ALWAYS** treat `process.env` as `string | undefined`
- ✅ **ALWAYS** validate before use: `if (!process.env.VAR) { throw new Error(...) }`
- ✅ **NEVER** destructure directly: `const { VAR } = process.env` ❌
- ✅ Supabase clients throw **HARD ERRORS** immediately if env vars are missing at runtime

### 2. Server Actions
- ✅ **ALWAYS** start with `"use server"` at the top
- ✅ **ALWAYS** return structured responses: `{ success: boolean, error?: string, data?: T }`
- ✅ **NEVER** throw raw errors - return error in response object

### 3. Client Components
- ✅ **ALWAYS** start with `"use client"` at the top
- ✅ **NEVER** import server-only modules (fs, path, headers, cookies)
- ✅ **ALWAYS** use `<Image />` instead of `<img>`
- ✅ **ALWAYS** use `<Link>` instead of `<a>` for internal navigation

### 4. Server Components
- ✅ **ALWAYS** export `dynamic = 'force-dynamic'` when using cookies/headers
- ✅ **ALWAYS** await `cookies()` and `headers()` (Next.js 15)
- ✅ **ALWAYS** handle Supabase null responses: `(data || []).map(...)`

### 5. TypeScript
- ✅ **NEVER** use `any` type
- ✅ **ALWAYS** use Database types from Supabase
- ✅ **ALWAYS** handle null/undefined explicitly

### 6. Linting
- ✅ **NO** unused imports
- ✅ **NO** unused variables (prefix with `_` if intentionally unused)

## Quick Reference Examples

### Environment Variable Access
```typescript
// ❌ BAD
const { API_URL } = process.env;
const url = process.env.API_URL; // Might be undefined

// ✅ GOOD
const apiUrl = process.env.API_URL;
if (!apiUrl) {
  throw new Error('API_URL is required');
}
```

### Server Action
```typescript
"use server"

export async function createUser(formData: FormData) {
  try {
    // ... logic
    return { success: true, data: user };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

### Supabase Data Handling
```typescript
// ❌ BAD
const { data } = await supabase.from('users').select('*');
data.map(user => user.name); // Error: data might be null

// ✅ GOOD
const { data } = await supabase.from('users').select('*');
(data || []).map(user => user.name);
```

### Server Component with Headers
```typescript
export const dynamic = 'force-dynamic';

export default async function Page() {
  const headersList = await headers(); // Must await
  // ...
}
```

### Client Component
```typescript
"use client"

import Image from 'next/image';
import Link from 'next/link';

export function MyComponent() {
  return (
    <>
      <Image src="/logo.png" width={100} height={100} alt="Logo" />
      <Link href="/about">About</Link>
    </>
  );
}
```

## File Locations

- **Rules**: `.cursor/rules` - Cursor agent prompt
- **Examples**: `lib/examples/` - Reference implementations
- **Supabase Client**: `lib/supabase/client.ts` - Browser client
- **Supabase Server**: `lib/supabase/server.ts` - Server client
- **Prisma Client**: `lib/prisma.ts` - Database client singleton

## Build Verification

Before committing, always run:
```bash
npm run type-check  # TypeScript validation
npm run lint        # ESLint validation
npm run build       # Full build test
```

## Common Build Failures & Fixes

| Error | Fix |
|-------|-----|
| `process.env.VAR is possibly undefined` | Add validation: `if (!process.env.VAR) throw new Error(...)` |
| `Dynamic server usage` | Add `export const dynamic = 'force-dynamic'` |
| `Unused variable` | Remove or prefix with `_` |
| `Implicit any` | Add explicit type annotation |
| `Supabase data is null` | Use `(data || []).map(...)` |
| `Missing "use server"` | Add directive at top of Server Action file |
| `Missing "use client"` | Add directive at top of Client Component file |

## Additional Resources

- See `lib/examples/` for complete working examples
- See `.cursor/rules` for full agent prompt
- See `next.config.mjs` for build configuration
- See `vercel.json` for deployment configuration
