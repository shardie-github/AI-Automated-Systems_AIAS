# API Contracts

**Phase 5 - Data Layer Stabilization**

This document describes the key entity types, endpoints, and expected request/response shapes used throughout the application.

## Entity Types

### User

```typescript
interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}
```

**Data Access:**
- `getCurrentUser()` - Get authenticated user
- `getUserProfile(userId)` - Get user by ID
- `updateUserProfile(userId, updates)` - Update user profile

**Hooks:**
- `useUser()` - Current user query
- `useUserProfile(userId)` - User profile query
- `useUpdateUserProfile()` - Update mutation

### Workflow

```typescript
interface Workflow {
  id: string;
  name: string;
  description?: string;
  template_id?: string;
  status: "active" | "paused" | "archived";
  created_at: string;
  updated_at: string;
  user_id?: string;
}
```

**Data Access:**
- `getWorkflows(filters?)` - List workflows
- `getWorkflow(id)` - Get single workflow
- `createWorkflow(data)` - Create workflow
- `updateWorkflow(id, updates)` - Update workflow
- `deleteWorkflow(id)` - Delete workflow

**Hooks:**
- `useWorkflows(filters?)` - List query
- `useWorkflow(id)` - Single query
- `useCreateWorkflow()` - Create mutation
- `useUpdateWorkflow()` - Update mutation
- `useDeleteWorkflow()` - Delete mutation

### Workflow Template

```typescript
interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  config: Record<string, unknown>;
}
```

**Data Access:**
- `getWorkflowTemplates()` - List templates

**Hooks:**
- `useWorkflowTemplates()` - Templates query

### User Settings

```typescript
interface UserSettings {
  id: string;
  user_id: string;
  theme?: "light" | "dark" | "system";
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  language?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
}
```

**Data Access:**
- `getCurrentUserSettings()` - Get user settings
- `updateUserSettings(updates)` - Update settings

**Hooks:**
- `useSettings()` - Settings query
- `useUpdateSettings()` - Update mutation

## API Endpoints

### Authentication

#### GET `/api/auth/login`
**Purpose:** Not used directly - handled by Supabase client

#### POST `/api/auth/signup`
**Purpose:** User registration

**Request:**
```typescript
{
  email: string;
  password: string;
  name?: string;
}
```

**Response:**
```typescript
{
  user: UserProfile;
  session: Session;
}
```

### Workflows

#### GET `/api/workflows/templates`
**Purpose:** Get workflow templates

**Response:**
```typescript
{
  templates: WorkflowTemplate[];
}
```

#### POST `/api/workflows/execute`
**Purpose:** Execute a workflow

**Request:**
```typescript
{
  workflowId: string;
  input?: Record<string, unknown>;
}
```

**Response:**
```typescript
{
  executionId: string;
  status: "running" | "completed" | "failed";
  result?: unknown;
}
```

### Billing

#### GET `/api/billing/subscription-status`
**Purpose:** Get user subscription status

**Query Params:**
- `userId` (string, required)

**Response:**
```typescript
{
  isPremium: boolean;
  plan?: string;
  expiresAt?: string;
}
```

### Settings

#### GET `/api/settings`
**Purpose:** Get user settings (or use React Query hook)

**Response:**
```typescript
UserSettings | null
```

#### PUT `/api/settings`
**Purpose:** Update user settings (or use React Query hook)

**Request:**
```typescript
Partial<Omit<UserSettings, "id" | "user_id" | "created_at" | "updated_at">>
```

**Response:**
```typescript
UserSettings
```

### Analytics

#### POST `/api/analytics/track`
**Purpose:** Track analytics event

**Request:**
```typescript
{
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

### Health

#### GET `/api/healthz`
**Purpose:** Health check endpoint

**Response:**
```typescript
{
  status: "ok" | "error";
  timestamp: string;
  version?: string;
}
```

## Supabase Tables

### `profiles`
User profile information

**Columns:**
- `id` (uuid, primary key, references auth.users)
- `email` (text)
- `name` (text)
- `avatar_url` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `workflows`
User workflows

**Columns:**
- `id` (uuid, primary key)
- `name` (text)
- `description` (text, nullable)
- `template_id` (uuid, nullable)
- `status` (text: "active" | "paused" | "archived")
- `user_id` (uuid, references auth.users)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `workflow_templates`
Predefined workflow templates

**Columns:**
- `id` (uuid, primary key)
- `name` (text)
- `description` (text, nullable)
- `category` (text, nullable)
- `config` (jsonb)

### `user_settings`
User preferences and settings

**Columns:**
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, unique)
- `theme` (text: "light" | "dark" | "system")
- `notifications_enabled` (boolean)
- `email_notifications` (boolean)
- `language` (text)
- `timezone` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Error Handling

### Standard Error Response

```typescript
{
  error: {
    message: string;
    code?: string;
    details?: unknown;
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permission
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Request validation failed
- `INTERNAL_ERROR` - Server error

## Type Safety

All entity types are defined in:
- `/lib/data/api/*.ts` - Entity interfaces
- `/types/supabase.ts` - Supabase generated types (when available)

**Usage:**
```typescript
import type { UserProfile } from "@/lib/data/api/user";
import type { Workflow } from "@/lib/data/api/workflows";
```

## Data Normalization

Data access functions normalize API responses to consistent shapes:

```typescript
// API might return different shape
const apiResponse = {
  user_id: "123",
  full_name: "John Doe",
  // ...
};

// Normalized to consistent shape
const normalized = {
  id: "123",
  name: "John Doe",
  // ...
};
```

This ensures components always receive predictable data structures.

## Future Entities

As the application grows, add new entities following the same pattern:

1. Define interface in `/lib/data/api/[entity].ts`
2. Create data access functions
3. Create React Query hooks in `/lib/hooks/use-[entity].ts`
4. Add query keys to `/lib/data/queryKeys.ts`
5. Document here
