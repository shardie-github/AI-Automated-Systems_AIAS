# Data Architecture - Initial Assessment

**Date:** 2025-01-31  
**Phase:** 5 - Data Layer Stabilization

## Current State Summary

### Data Fetching Library
- ✅ **@tanstack/react-query** (v5.17.0) is installed
- ❌ **NOT configured** - No QueryClientProvider in app layout
- ❌ **NOT used** - No useQuery/useMutation hooks found in codebase

### Current Patterns Detected

#### 1. Server Components (Next.js App Router)
- **Pattern:** Direct Supabase calls in async Server Components
- **Example:** `app/dashboard/page.tsx` - Uses `createClient()` directly
- **Status:** ✅ Appropriate for SSR/SSG, but needs coordination with client-side caching

#### 2. Client Components - Manual State Management
- **Pattern:** `useState` + `useEffect` with manual loading/error handling
- **Example:** `hooks/use-user.ts` - Manual Supabase auth state management
- **Issues:**
  - No caching
  - No automatic refetching
  - Manual loading/error state management
  - Potential for duplicate API calls

#### 3. Direct API Calls
- **Pattern:** Direct `fetch()` calls scattered in components
- **Status:** ❌ No centralized data layer

### Architecture Stack

- **Framework:** Next.js 15 (App Router)
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **State Management:** None (manual useState/useEffect)
- **Data Fetching:** Ad-hoc patterns

### Key Issues Identified

1. **No centralized data fetching layer**
   - Data access logic scattered across components
   - No consistent error handling
   - No shared caching strategy

2. **Mixed patterns**
   - Server Components fetching directly (good)
   - Client Components using manual hooks (needs improvement)
   - No clear separation of server vs client state

3. **No query key management**
   - No standardized way to invalidate related queries
   - No namespacing for different data domains

4. **Missing mutation patterns**
   - No standardized create/update/delete hooks
   - No optimistic updates
   - No automatic cache invalidation

5. **Inconsistent loading/error states**
   - Components handle loading/error independently
   - No standardized UX patterns

## Proposed Solution

### Phase 5 Implementation Plan

1. **Set up React Query infrastructure**
   - Configure QueryClientProvider
   - Define default query/mutation options
   - Set up DevTools (development only)

2. **Create centralized data layer**
   - `/lib/data/queryKeys.ts` - Centralized query key factory
   - `/lib/data/api/` - Data access functions (Supabase wrappers)
   - `/lib/hooks/` - Reusable data hooks (useUser, useProjects, etc.)

3. **Separate server vs client state**
   - Server state → React Query
   - UI state → useState or lightweight store (Zustand if needed)

4. **Standardize patterns**
   - Query hooks: `useSomethingQuery()`
   - Mutation hooks: `useCreateX()`, `useUpdateX()`, `useDeleteX()`
   - Consistent return shapes: `{ data, isLoading, isError, error, refetch }`

5. **Cache strategy**
   - Define stale times per data domain
   - Implement invalidation on mutations
   - Use dependent queries where appropriate

6. **Refactor existing code**
   - Convert `use-user.ts` to React Query hook
   - Update components to use new hooks
   - Maintain Server Component patterns where appropriate

## Next Steps

1. ✅ Create initial assessment (this document)
2. ⏳ Set up React Query infrastructure
3. ⏳ Create query keys structure
4. ⏳ Build data access layer
5. ⏳ Create reusable hooks
6. ⏳ Refactor existing hooks
7. ⏳ Document patterns and conventions
