/**
 * Workflow Hooks
 * 
 * React Query hooks for workflow data.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/data/queryKeys";
import {
  getWorkflows,
  getWorkflow,
  getWorkflowTemplates,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  type Workflow,
  type WorkflowTemplate,
} from "@/lib/data/api/workflows";

/**
 * Hook to get all workflows
 */
export function useWorkflows(filters?: { status?: Workflow["status"] }) {
  return useQuery({
    queryKey: queryKeys.workflows.list(filters),
    queryFn: () => getWorkflows(filters),
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Hook to get single workflow
 */
export function useWorkflow(workflowId: string | null) {
  return useQuery({
    queryKey: queryKeys.workflows.detail(workflowId ?? ""),
    queryFn: () => {
      if (!workflowId) throw new Error("Workflow ID is required");
      return getWorkflow(workflowId);
    },
    enabled: !!workflowId,
    staleTime: 30_000,
  });
}

/**
 * Hook to get workflow templates
 */
export function useWorkflowTemplates() {
  return useQuery({
    queryKey: queryKeys.workflows.templates(),
    queryFn: getWorkflowTemplates,
    staleTime: 5 * 60 * 1000, // 5 minutes - templates don't change often
  });
}

/**
 * Hook to create workflow
 */
export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkflow,
    onSuccess: () => {
      // Invalidate workflows list
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.lists() });
    },
  });
}

/**
 * Hook to update workflow
 */
export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Workflow> }) =>
      updateWorkflow(id, updates),
    onSuccess: (data) => {
      // Update cache optimistically
      queryClient.setQueryData(queryKeys.workflows.detail(data.id), data);
      // Invalidate list to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.lists() });
    },
  });
}

/**
 * Hook to delete workflow
 */
export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: (_, workflowId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.workflows.detail(workflowId) });
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.lists() });
    },
  });
}
