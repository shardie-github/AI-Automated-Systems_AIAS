# Data Layer Migration Guide

**Phase 5 - Data Layer Stabilization**

This guide helps you migrate existing code to use the new data layer patterns.

## Quick Reference

### Old Pattern → New Pattern

| Old | New |
|-----|-----|
| `useState` + `useEffect` for server data | `useQuery` hook |
| Direct `fetch()` calls | Data access function + hook |
| Manual loading/error state | `DataLoader` component |
| Scattered query keys | Centralized `queryKeys` |

## Step-by-Step Migration

### Step 1: Identify Server State

Look for patterns like:
```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetch('/api/data').then(r => r.json()).then(setData);
}, []);
```

This is **server state** and should use React Query.

### Step 2: Create Data Access Function

Create or use existing function in `/lib/data/api/`:

```tsx
// lib/data/api/my-data.ts
export async function getMyData() {
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}
```

### Step 3: Create Hook

Create hook in `/lib/hooks/`:

```tsx
// lib/hooks/use-my-data.ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/data/queryKeys";
import { getMyData } from "@/lib/data/api/my-data";

export function useMyData() {
  return useQuery({
    queryKey: queryKeys.myDomain.list(),
    queryFn: getMyData,
  });
}
```

### Step 4: Add Query Key

Add to `/lib/data/queryKeys.ts`:

```tsx
export const queryKeys = {
  // ... existing keys
  myDomain: {
    all: ['myDomain'] as const,
    list: () => ['myDomain', 'list'] as const,
  },
};
```

### Step 5: Update Component

Replace old pattern:

```tsx
// OLD
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetchData().then(setData).finally(() => setLoading(false));
}, []);

if (loading) return <div>Loading...</div>;
if (!data) return <div>No data</div>;
return <div>{data.name}</div>;
```

With new pattern:

```tsx
// NEW
import { useMyData } from "@/lib/hooks/use-my-data";
import { DataLoader } from "@/components/data/data-loader";

function MyComponent() {
  const { data, isLoading, isError, error } = useMyData();

  return (
    <DataLoader
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={!data}
      emptyMessage="No data found"
    >
      <div>{data.name}</div>
    </DataLoader>
  );
}
```

## Common Migration Scenarios

### Scenario 1: Supabase Direct Calls

**Before:**
```tsx
const [workflows, setWorkflows] = useState([]);
useEffect(() => {
  const supabase = createClient();
  supabase.from("workflows").select("*").then(({ data }) => {
    setWorkflows(data || []);
  });
}, []);
```

**After:**
```tsx
import { useWorkflows } from "@/lib/hooks/use-workflows";

const { data: workflows } = useWorkflows();
```

### Scenario 2: API Route Calls

**Before:**
```tsx
const [settings, setSettings] = useState(null);
useEffect(() => {
  fetch('/api/settings').then(r => r.json()).then(setSettings);
}, []);
```

**After:**
```tsx
import { useSettings } from "@/lib/hooks/use-settings";

const { data: settings } = useSettings();
```

### Scenario 3: Mutations

**Before:**
```tsx
const [loading, setLoading] = useState(false);
const handleUpdate = async () => {
  setLoading(true);
  try {
    await fetch('/api/workflow', {
      method: 'PUT',
      body: JSON.stringify({ id, updates }),
    });
    // Manually refetch
    refetch();
  } finally {
    setLoading(false);
  }
};
```

**After:**
```tsx
import { useUpdateWorkflow } from "@/lib/hooks/use-workflows";

const updateWorkflow = useUpdateWorkflow();

const handleUpdate = async () => {
  await updateWorkflow.mutateAsync({ id, updates });
  // Cache automatically invalidated!
};
```

### Scenario 4: Conditional Fetching

**Before:**
```tsx
const [data, setData] = useState(null);
useEffect(() => {
  if (userId) {
    fetch(`/api/user/${userId}`).then(r => r.json()).then(setData);
  }
}, [userId]);
```

**After:**
```tsx
import { useUserProfile } from "@/lib/hooks/use-user";

const { data } = useUserProfile(userId);
// Automatically disabled if userId is null!
```

## Migration Checklist

- [ ] Identify all `useState` + `useEffect` patterns for server data
- [ ] Create data access function in `/lib/data/api/`
- [ ] Create React Query hook in `/lib/hooks/`
- [ ] Add query keys to `/lib/data/queryKeys.ts`
- [ ] Replace old pattern with new hook
- [ ] Use `DataLoader` for loading/error states
- [ ] Test that data loads correctly
- [ ] Test that mutations update cache
- [ ] Remove old code

## Backward Compatibility

The old `hooks/use-user.ts` file re-exports from the new location, so existing imports continue to work:

```tsx
// This still works (but consider updating)
import { useUser } from "@/hooks/use-user";

// Preferred:
import { useUser } from "@/lib/hooks/use-user";
```

## Testing After Migration

1. **Data loads correctly** - Check browser DevTools Network tab
2. **Loading states work** - See loading spinner
3. **Error states work** - Trigger an error, see error message
4. **Mutations update cache** - Update data, see UI update immediately
5. **No duplicate requests** - Check Network tab for duplicate calls

## Need Help?

- See `/docs/data-architecture.md` for architecture overview
- See `/docs/state-patterns.md` for state management patterns
- See `/docs/api-contracts.md` for API contracts

## Examples

See these files for reference implementations:
- `/lib/hooks/use-user.ts` - User queries
- `/lib/hooks/use-workflows.ts` - Workflow queries & mutations
- `/lib/hooks/use-settings.ts` - Settings queries & mutations
