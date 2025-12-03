/**
 * Settings Hooks
 * 
 * React Query hooks for user settings.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/data/queryKeys";
import {
  getCurrentUserSettings,
  updateUserSettings,
  type UserSettings,
} from "@/lib/data/api/settings";

/**
 * Hook to get current user's settings
 */
export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.current(),
    queryFn: getCurrentUserSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update user settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserSettings,
    onSuccess: (data) => {
      // Update cache optimistically
      queryClient.setQueryData(queryKeys.settings.current(), data);
    },
  });
}
