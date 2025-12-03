/**
 * Centralized Query Keys
 * 
 * All React Query keys are defined here to ensure consistency and enable
 * easy invalidation of related queries.
 * 
 * Pattern: [domain, ...identifiers]
 * 
 * Examples:
 * - ['user', userId] - Single user
 * - ['users'] - List of users
 * - ['projects', projectId] - Single project
 * - ['projects', { filters: {...} }] - Filtered projects list
 */

export const queryKeys = {
  // User & Auth
  user: {
    all: ['user'] as const,
    current: () => ['user', 'current'] as const,
    byId: (id: string) => ['user', id] as const,
    profile: (id: string) => ['user', id, 'profile'] as const,
  },

  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => ['projects', 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      ['projects', 'list', filters] as const,
    detail: (id: string) => ['projects', id] as const,
    byOwner: (ownerId: string) => ['projects', 'owner', ownerId] as const,
  },

  // Workflows
  workflows: {
    all: ['workflows'] as const,
    lists: () => ['workflows', 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      ['workflows', 'list', filters] as const,
    detail: (id: string) => ['workflows', id] as const,
    templates: () => ['workflows', 'templates'] as const,
    executions: (workflowId?: string) => 
      ['workflows', 'executions', workflowId] as const,
  },

  // Settings
  settings: {
    all: ['settings'] as const,
    current: () => ['settings', 'current'] as const,
    byKey: (key: string) => ['settings', key] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (filters?: Record<string, unknown>) => 
      ['notifications', 'list', filters] as const,
    unread: () => ['notifications', 'unread'] as const,
    byId: (id: string) => ['notifications', id] as const,
  },

  // Analytics & Metrics
  analytics: {
    all: ['analytics'] as const,
    metrics: (type?: string) => ['analytics', 'metrics', type] as const,
    kpis: () => ['analytics', 'kpis'] as const,
    events: (filters?: Record<string, unknown>) => 
      ['analytics', 'events', filters] as const,
  },

  // Blog
  blog: {
    all: ['blog'] as const,
    posts: (filters?: Record<string, unknown>) => 
      ['blog', 'posts', filters] as const,
    post: (slug: string) => ['blog', 'posts', slug] as const,
    comments: (postId: string) => ['blog', 'posts', postId, 'comments'] as const,
  },

  // Integrations
  integrations: {
    all: ['integrations'] as const,
    list: () => ['integrations', 'list'] as const,
    byProvider: (provider: string) => ['integrations', provider] as const,
  },

  // Billing
  billing: {
    all: ['billing'] as const,
    subscription: () => ['billing', 'subscription'] as const,
    invoices: () => ['billing', 'invoices'] as const,
    plans: () => ['billing', 'plans'] as const,
  },

  // Admin
  admin: {
    all: ['admin'] as const,
    metrics: (type?: string) => ['admin', 'metrics', type] as const,
    users: (filters?: Record<string, unknown>) => 
      ['admin', 'users', filters] as const,
    compliance: () => ['admin', 'compliance'] as const,
  },
} as const;

/**
 * Helper to get all query keys for a domain
 * Useful for invalidating all queries in a domain
 */
export function getDomainKeys(domain: keyof typeof queryKeys) {
  return Object.values(queryKeys[domain]);
}
