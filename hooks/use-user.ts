/**
 * @deprecated This hook has been moved to @/lib/hooks/use-user.ts
 * 
 * Please update your imports:
 * 
 * OLD: import { useUser } from "@/hooks/use-user";
 * NEW: import { useUser } from "@/lib/hooks/use-user";
 * 
 * The new hook uses React Query for better caching and state management.
 */

export { useUser } from "@/lib/hooks/use-user";
export type { UserProfile as User } from "@/lib/hooks/use-user";
