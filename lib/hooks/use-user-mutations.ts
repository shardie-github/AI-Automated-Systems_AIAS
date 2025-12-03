/**
 * User Mutation Hooks
 * 
 * Hooks for updating user data with optimistic updates and cache invalidation.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/data/queryKeys";
import {
  updateUserProfile,
  type UserProfile,
} from "@/lib/data/api/user";

/**
 * Hook to update user profile
 * 
 * @example
 * ```tsx
 * const updateProfile = useUpdateUserProfile();
 * 
 * const handleUpdate = async () => {
 *   await updateProfile.mutateAsync({
 *     userId: user.id,
 *     updates: { name: "New Name" }
 *   });
 * };
 * ```
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<Pick<UserProfile, "name" | "avatar_url">>;
    }) => updateUserProfile(userId, updates),
    onSuccess: (data, variables) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      
      // Optimistically update the cache
      queryClient.setQueryData<UserProfile>(
        queryKeys.user.byId(variables.userId),
        data
      );
      queryClient.setQueryData<UserProfile>(
        queryKeys.user.current(),
        data
      );
    },
  });
}
