# State Management Patterns

**Phase 5 - Data Layer Stabilization**

This document describes patterns for managing different types of state in the application.

## State Categories

### 1. Server State

**Definition:** Data that comes from APIs, databases, or external sources.

**Solution:** React Query (TanStack Query)

**Examples:**
- User data
- Projects/workflows lists
- Settings
- Analytics/metrics
- Blog posts

**Pattern:**
```tsx
import { useUser } from "@/lib/hooks/use-user";

function UserProfile() {
  const { data: user, isLoading, isError } = useUser();
  // React Query handles caching, refetching, invetching automatically
}
```

**Benefits:**
- Automatic caching
- Background refetching
- Optimistic updates
- Request deduplication
- Error retry logic

### 2. UI/Local State

**Definition:** State that's specific to a component and doesn't need to be shared.

**Solution:** React `useState`

**Examples:**
- Modal open/closed
- Form input values
- Toggle states
- Local filters (before syncing to URL)

**Pattern:**
```tsx
function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && <Modal onClose={() => setIsOpen(false)} />}
    </div>
  );
}
```

**When to use:**
- State is only used in one component
- State doesn't need to persist across navigation
- State is temporary (e.g., form inputs before submission)

### 3. Shared UI State

**Definition:** UI state that needs to be shared across multiple components.

**Solution:** React Context or Zustand (if complex)

**Examples:**
- Theme (dark/light mode) - already handled by ThemeProvider
- Sidebar open/closed state
- Active tab in a multi-tab interface
- Global loading overlay

**Pattern with Context:**
```tsx
// contexts/sidebar-context.tsx
const SidebarContext = createContext<{
  isOpen: boolean;
  toggle: () => void;
}>({ isOpen: false, toggle: () => {} });

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ isOpen, toggle: () => setIsOpen(!isOpen) }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Usage
function Component() {
  const { isOpen, toggle } = useContext(SidebarContext);
}
```

**Pattern with Zustand (if needed):**
```tsx
// stores/ui-store.ts
import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

// Usage
function Component() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
}
```

**When to use Zustand:**
- Multiple unrelated components need the same state
- State logic is complex
- Need middleware (persist, devtools, etc.)

**When NOT to use Zustand:**
- Can be solved with Context
- State is simple (use useState)
- State is server data (use React Query)

### 4. URL State

**Definition:** State that should be reflected in the URL (for sharing, bookmarking, back/forward navigation).

**Solution:** Next.js `useSearchParams` + `useRouter`

**Examples:**
- Filters (status, category, etc.)
- Pagination
- Sort order
- Search query
- Active tab/page

**Pattern:**
```tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";

function FilteredList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const status = searchParams.get("status") || "all";
  
  const setStatus = (newStatus: string) => {
    const params = new URLSearchParams(searchParams);
    if (newStatus === "all") {
      params.delete("status");
    } else {
      params.set("status", newStatus);
    }
    router.push(`?${params.toString()}`);
  };
  
  // Use status in query
  const { data } = useWorkflows({ status: status === "all" ? undefined : status });
  
  return (
    <div>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
      </select>
      {/* ... */}
    </div>
  );
}
```

**Benefits:**
- Shareable URLs
- Browser back/forward works
- Deep linking
- SEO-friendly

### 5. Form State

**Definition:** State for form inputs and validation.

**Solution:** React Hook Form (already in use)

**Pattern:**
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data) => {
    // Submit to API
  };
  
  return <form onSubmit={handleSubmit(onSubmit)}>{/* ... */}</form>;
}
```

### 6. Multi-Step Workflow State

**Definition:** State that persists across multiple pages/steps (e.g., onboarding wizard).

**Options:**

#### Option A: URL State (Recommended for simple flows)
```tsx
// app/onboarding/[step]/page.tsx
// State stored in URL: /onboarding/step-1?data=...
```

#### Option B: Zustand Store (For complex flows)
```tsx
// stores/onboarding-store.ts
interface OnboardingStore {
  currentStep: number;
  data: Record<string, unknown>;
  setData: (key: string, value: unknown) => void;
  nextStep: () => void;
  previousStep: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentStep: 1,
  data: {},
  setData: (key, value) => set((state) => ({
    data: { ...state.data, [key]: value },
  })),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  previousStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
}));
```

#### Option C: Backend Draft (For long forms)
Save progress to backend as draft, restore on page load.

## Decision Tree

```
Is this data from an API/DB?
├─ YES → Use React Query (server state)
└─ NO → Is it UI state?
    ├─ Used in one component? → useState
    ├─ Used in multiple components? → Context or Zustand
    ├─ Should be in URL? → useSearchParams
    └─ Form inputs? → React Hook Form
```

## Anti-Patterns to Avoid

### ❌ Don't use useState for server data
```tsx
// BAD
const [users, setUsers] = useState([]);
useEffect(() => {
  fetchUsers().then(setUsers);
}, []);

// GOOD
const { data: users } = useUsers();
```

### ❌ Don't use Context for server state
```tsx
// BAD - Context doesn't handle caching, refetching, etc.
const UsersContext = createContext([]);

// GOOD - Use React Query
const { data: users } = useUsers();
```

### ❌ Don't mix server and UI state
```tsx
// BAD
const [state, setState] = useState({
  user: null,        // Server state
  isLoading: true,   // Derived from server state
  isModalOpen: false // UI state
});

// GOOD - Separate concerns
const { data: user, isLoading } = useUser(); // Server state
const [isModalOpen, setIsModalOpen] = useState(false); // UI state
```

## Examples

### Example 1: Dashboard with Filters

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useWorkflows } from "@/lib/hooks/use-workflows";
import { DataLoader } from "@/components/data/data-loader";

export function Dashboard() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "all";
  
  // Server state - React Query
  const { data: workflows, isLoading, isError } = useWorkflows(
    status === "all" ? undefined : { status }
  );
  
  // UI state - useState
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  return (
    <DataLoader isLoading={isLoading} isError={isError}>
      <WorkflowList
        workflows={workflows}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </DataLoader>
  );
}
```

### Example 2: Settings Page with Form

```tsx
"use client";

import { useForm } from "react-hook-form";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";

export function SettingsPage() {
  // Server state - React Query
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  
  // Form state - React Hook Form
  const form = useForm({
    defaultValues: settings || {},
  });
  
  const onSubmit = async (data) => {
    await updateSettings.mutateAsync(data);
  };
  
  if (isLoading) return <LoadingState />;
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>;
}
```

## Summary

| State Type | Solution | When to Use |
|------------|----------|-------------|
| Server Data | React Query | Data from APIs/DB |
| Local UI State | useState | Component-specific |
| Shared UI State | Context/Zustand | Multiple components |
| URL State | useSearchParams | Shareable/bookmarkable |
| Form State | React Hook Form | Forms |
| Multi-Step Flow | URL/Zustand/Backend | Wizards/onboarding |
