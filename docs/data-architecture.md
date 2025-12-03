# Data Architecture

**Phase 5 - Data Layer Stabilization**

## Overview

This document describes the data fetching and state management architecture for the application. The goal is to provide a **coherent, scalable, documented system** that's easy to reason about and hard to break.

## Architecture Principles

### 1. Separation of Concerns

- **Server State** → React Query (TanStack Query)
  - Data fetched from APIs/DB (users, projects, workflows, etc.)
  - Handles caching, refetching, invalidation automatically
  
- **UI State** → React useState or lightweight store
  - Toggles, modals, local filters, current tab, etc.
  - Only use Zustand/Jotai if truly needed for cross-component state

### 2. Centralized Data Access

All data access functions live in `/lib/data/api/`:
- `user.ts` - User and auth data
- `workflows.ts` - Workflow data
- `settings.ts` - User settings
- `projects.ts` - Project data (when needed)
- etc.

These functions are **pure** - they don't use React hooks, just fetch and return data.

### 3. Standardized Hooks

All data hooks live in `/lib/hooks/`:
- `use-user.ts` - User queries and mutations
- `use-workflows.ts` - Workflow queries and mutations
- `use-settings.ts` - Settings queries and mutations
- etc.

Each hook follows consistent patterns:
- Query hooks: `useSomethingQuery()` → `{ data, isLoading, isError, error, refetch }`
- Mutation hooks: `useCreateX()`, `useUpdateX()`, `useDeleteX()`

### 4. Query Key Management

All query keys are centralized in `/lib/data/queryKeys.ts`:
- Consistent naming: `['domain', ...identifiers]`
- Easy invalidation: `queryClient.invalidateQueries({ queryKey: queryKeys.user.all })`
- Type-safe with TypeScript

## Data Flow

### Server Components (Next.js App Router)

For data that doesn't need live updates, use **Server Components**:

```tsx
// app/dashboard/page.tsx
async function getKPIData() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("kpis").select("*");
  return data;
}

export default async function DashboardPage() {
  const kpiData = await getKPIData();
  return <Dashboard data={kpiData} />;
}
```

**When to use Server Components:**
- Initial page load data
- SEO-critical content
- Data that doesn't change frequently
- Public data (no auth required)

### Client Components with React Query

For data that needs live updates, caching, or client-side interactions:

```tsx
"use client";

import { useUser } from "@/lib/hooks/use-user";
import { DataLoader } from "@/components/data/data-loader";

export function UserProfile() {
  const { data: user, isLoading, isError, error } = useUser();

  return (
    <DataLoader
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={!user}
      emptyMessage="No user found"
    >
      <div>Welcome, {user.name}!</div>
    </DataLoader>
  );
}
```

**When to use Client Components + React Query:**
- Data that needs real-time updates
- User-specific data that changes frequently
- Interactive features (forms, mutations)
- Data that benefits from caching

## Query Key Conventions

Query keys follow this pattern:

```typescript
['domain', ...identifiers]
```

Examples:
- `['user', 'current']` - Current user
- `['user', userId]` - Specific user
- `['projects', 'list']` - All projects
- `['projects', 'list', { status: 'active' }]` - Filtered projects
- `['projects', projectId]` - Single project

## Cache Strategy

### Default Stale Times

- **User data**: 5 minutes (doesn't change often)
- **Settings**: 5 minutes
- **Workflows/Projects**: 30 seconds (may change more frequently)
- **Templates**: 5 minutes (rarely change)
- **Analytics**: 1 minute (real-time data)

### Invalidation

Queries are invalidated on mutations:

```typescript
// After creating a workflow
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.workflows.lists() });
}
```

## Mutation Patterns

### Standard Mutation Hook

```typescript
export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkflow,
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.lists() });
    },
  });
}
```

### Optimistic Updates

For better UX, update cache optimistically:

```typescript
onSuccess: (data) => {
  // Update cache immediately
  queryClient.setQueryData(queryKeys.workflows.detail(data.id), data);
  // Invalidate list to ensure consistency
  queryClient.invalidateQueries({ queryKey: queryKeys.workflows.lists() });
}
```

## Loading & Error States

Use the `DataLoader` component for consistent UX:

```tsx
<DataLoader
  isLoading={isLoading}
  isError={isError}
  error={error}
  isEmpty={!data}
  emptyMessage="No items found"
  onRetry={() => refetch()}
>
  {/* Your content */}
</DataLoader>
```

## SSR/SSG vs CSR Strategy

### Next.js App Router

1. **Server Components** for initial data (SSR/SSG)
   - Use `createServerSupabaseClient()` in Server Components
   - Data is fetched on the server, no client-side fetching needed

2. **Client Components + React Query** for interactive data
   - Use `createClient()` from `@/lib/supabase/client`
   - Benefits from caching, refetching, optimistic updates

3. **Avoid Double Fetching**
   - Don't fetch the same data in both Server and Client Components
   - If Server Component fetches initial data, pass it as props to Client Component
   - Client Component can use React Query for subsequent updates

## Best Practices

### ✅ Do

- Use React Query for all server state
- Centralize data access functions in `/lib/data/api/`
- Use consistent query keys from `queryKeys.ts`
- Invalidate related queries on mutations
- Use `DataLoader` for consistent loading/error states
- Use Server Components for initial page load data
- Type all data with TypeScript interfaces

### ❌ Don't

- Don't use `useState` + `useEffect` for server state
- Don't fetch data directly in components (use hooks)
- Don't create ad-hoc query keys
- Don't mix patterns for the same type of data
- Don't fetch the same data in both Server and Client Components
- Don't forget to invalidate queries on mutations

## Migration Guide

### Converting Old Patterns

**Before (manual state):**
```tsx
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchUser().then(setUser).finally(() => setLoading(false));
}, []);
```

**After (React Query):**
```tsx
const { data: user, isLoading } = useUser();
```

**Before (direct fetch):**
```tsx
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/data').then(r => r.json()).then(setData);
}, []);
```

**After (React Query hook):**
```tsx
const { data } = useDataQuery();
```

## File Structure

```
lib/
  data/
    queryKeys.ts          # Centralized query keys
    react-query.tsx       # QueryClientProvider setup
    api/
      user.ts            # User data access functions
      workflows.ts       # Workflow data access functions
      settings.ts        # Settings data access functions
      ...
  hooks/
    use-user.ts          # User hooks
    use-user-mutations.ts # User mutation hooks
    use-workflows.ts     # Workflow hooks
    use-settings.ts      # Settings hooks
    ...

components/
  data/
    data-loader.tsx      # Standardized loading/error/empty wrapper
```

## Further Reading

- [React Query Documentation](https://tanstack.com/query/latest)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [State Management Patterns](./state-patterns.md)
- [API Contracts](./api-contracts.md)
