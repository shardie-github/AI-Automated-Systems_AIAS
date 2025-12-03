# Data Layer Performance Notes

**Phase 5 - Data Layer Stabilization**

This document captures performance considerations and optimizations in the data layer.

## Caching Strategy

### Stale Times by Domain

| Domain | Stale Time | Rationale |
|--------|------------|-----------|
| User | 5 minutes | User data changes infrequently |
| Settings | 5 minutes | Settings rarely change |
| Workflows | 30 seconds | May change more frequently |
| Templates | 5 minutes | Templates are relatively static |
| Analytics | 1 minute | Real-time data needs freshness |

### Garbage Collection

- **Default GC Time:** 5 minutes
- Unused cache entries are garbage collected after 5 minutes
- This prevents memory leaks while keeping frequently accessed data available

## Request Deduplication

React Query automatically deduplicates identical requests:

```tsx
// If multiple components call this simultaneously:
const { data } = useUser();
const { data } = useUser(); // Same query key

// Only ONE request is made, both components receive the same data
```

**Benefit:** Prevents duplicate API calls when multiple components need the same data.

## Dependent Queries

Use `enabled` option to prevent unnecessary requests:

```tsx
// Only fetch workflow when workflowId is available
const { data: workflow } = useWorkflow(workflowId, {
  enabled: !!workflowId,
});
```

**Benefit:** Avoids fetching data when required parameters are missing.

## Optimistic Updates

For better perceived performance:

```tsx
const updateWorkflow = useUpdateWorkflow();

// Cache is updated immediately, before server responds
updateWorkflow.mutate({ id: "123", updates: { name: "New Name" } });
```

**Benefit:** UI feels instant, even though request is still in flight.

## Background Refetching

React Query refetches stale data in the background:

- On window focus (if `refetchOnWindowFocus: true`)
- On network reconnect (if `refetchOnReconnect: true`)
- On mount (if `refetchOnMount: true`)

**Default:** `refetchOnWindowFocus: false` to reduce unnecessary requests.

## Pagination & Infinite Queries

For large lists, use pagination:

```tsx
// Future: Implement useInfiniteQuery for pagination
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['workflows', 'list'],
  queryFn: ({ pageParam = 0 }) => getWorkflows({ page: pageParam }),
  getNextPageParam: (lastPage, pages) => lastPage.nextPage,
});
```

**Benefit:** Load data incrementally, improving initial load time.

## Selectors for Partial Data

Use `select` to only subscribe to needed data:

```tsx
// Only re-render when user.name changes, not other fields
const userName = useUser({
  select: (user) => user?.name,
});
```

**Benefit:** Reduces unnecessary re-renders.

## Server Components for Initial Load

Use Server Components for initial page load:

```tsx
// app/dashboard/page.tsx (Server Component)
async function getInitialData() {
  const supabase = await createServerSupabaseClient();
  return await supabase.from("workflows").select("*");
}

export default async function DashboardPage() {
  const initialData = await getInitialData();
  return <DashboardClient initialData={initialData} />;
}
```

**Benefit:** 
- Data is fetched on server (faster than client)
- No loading state on initial render
- Better SEO

Then use React Query for subsequent updates:

```tsx
// components/dashboard-client.tsx (Client Component)
export function DashboardClient({ initialData }) {
  // Use initialData for first render, React Query for updates
  const { data } = useWorkflows({
    initialData,
  });
}
```

## Avoiding Over-Fetching

### Combine Related Queries

Instead of:
```tsx
const { data: user } = useUser();
const { data: settings } = useSettings();
const { data: workflows } = useWorkflows();
```

Consider a combined query if they're always used together:
```tsx
// lib/data/api/dashboard.ts
export async function getDashboardData() {
  const [user, settings, workflows] = await Promise.all([
    getCurrentUser(),
    getCurrentUserSettings(),
    getWorkflows(),
  ]);
  return { user, settings, workflows };
}
```

**Benefit:** Single request instead of three sequential requests.

### Request Only Needed Fields

```tsx
// Instead of selecting all fields
const { data } = await supabase.from("workflows").select("*");

// Select only needed fields
const { data } = await supabase
  .from("workflows")
  .select("id, name, status");
```

**Benefit:** Reduces payload size and improves response time.

## Memoization

Use React Query's built-in memoization:

```tsx
// React Query memoizes query results automatically
const { data } = useWorkflows(); // Memoized by query key
```

For derived data:

```tsx
import { useMemo } from "react";

const { data: workflows } = useWorkflows();

// Memoize derived data
const activeWorkflows = useMemo(
  () => workflows?.filter((w) => w.status === "active") ?? [],
  [workflows]
);
```

**Benefit:** Prevents unnecessary recalculations.

## Performance Monitoring

Track query performance:

```tsx
const { data, dataUpdatedAt, isFetching } = useWorkflows();

// Log slow queries
useEffect(() => {
  if (dataUpdatedAt) {
    const fetchTime = Date.now() - dataUpdatedAt;
    if (fetchTime > 1000) {
      console.warn("Slow query detected:", fetchTime);
    }
  }
}, [dataUpdatedAt]);
```

## Best Practices Summary

1. ✅ Set appropriate stale times per domain
2. ✅ Use `enabled` for dependent queries
3. ✅ Use Server Components for initial load
4. ✅ Implement optimistic updates for mutations
5. ✅ Use selectors to reduce re-renders
6. ✅ Combine related queries when appropriate
7. ✅ Select only needed fields from database
8. ✅ Memoize derived data
9. ✅ Monitor query performance
10. ✅ Use pagination for large lists

## Future Optimizations

- [ ] Implement infinite queries for pagination
- [ ] Add request batching for multiple queries
- [ ] Implement query prefetching for likely next pages
- [ ] Add query result compression for large payloads
- [ ] Implement request cancellation for stale requests
