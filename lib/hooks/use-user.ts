/**
 * User Hook with React Query
 * 
 * Provides user authentication state and user data using React Query.
 * Replaces the manual useState/useEffect pattern with proper caching.
 */

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryKeys } from "@/lib/data/queryKeys";
import {
  getCurrentUser,
  onAuthStateChange,
  type UserProfile,
} from "@/lib/data/api/user";

/**
 * Hook to get current authenticated user
 * 
 * @returns User data with loading/error states
 * 
 * @example
 * ```tsx
 * const { data: user, isLoading, isError } = useUser();
 * 
 * if (isLoading) return <LoadingState />;
 * if (isError || !user) return <SignInPrompt />;
 * 
 * return <div>Welcome, {user.name}!</div>;
 * ```
 */
export function useUser() {
  const queryClient = useQueryClient();

  // Query for current user
  const query = useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes - user data doesn't change often
    retry: false, // Don't retry auth failures
  });

  // Set up auth state listener to invalidate query on auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(() => {
      // Invalidate user query when auth state changes
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    });

    return unsubscribe;
  }, [queryClient]);

  return {
    user: query.data ?? null,
    loading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to get user profile by ID
 * 
 * @param userId - User ID to fetch
 * @returns User profile with loading/error states
 */
export function useUserProfile(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.user.byId(userId ?? ""),
    queryFn: () => {
      if (!userId) throw new Error("User ID is required");
      return getUserProfile(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

// Re-export types for convenience
export type { UserProfile };
