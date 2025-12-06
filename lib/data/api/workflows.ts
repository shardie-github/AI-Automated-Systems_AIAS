/**
 * Workflows Data Access Layer
 * 
 * Centralized functions for fetching workflow data from Supabase/API.
 */

import { createClient } from "@/lib/supabase/client";

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  template_id?: string;
  status: "active" | "paused" | "archived";
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  config: Record<string, unknown>;
}

/**
 * Get all workflows for current user
 */
export async function getWorkflows(filters?: {
  status?: Workflow["status"];
}): Promise<Workflow[]> {
  const supabase = createClient();
  
  let query = supabase.from("workflows").select("*");

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to fetch workflows");
  }

  return (data || []) as Workflow[];
}

/**
 * Get workflow by ID
 */
export async function getWorkflow(workflowId: string): Promise<Workflow | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", workflowId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    throw new Error(error.message || "Failed to fetch workflow");
  }

  return data as Workflow;
}

/**
 * Get workflow templates
 */
export async function getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
  // Try API route first, fallback to Supabase
  try {
    const response = await fetch("/api/workflows/templates");
    if (response.ok) {
      const data = await response.json();
      return data.templates || [];
    }
  } catch {
    // Fallback to Supabase
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("workflow_templates")
    .select("*")
    .order("name");

  if (error) {
    throw new Error(error.message || "Failed to fetch templates");
  }

  return (data || []) as WorkflowTemplate[];
}

/**
 * Create workflow
 */
export async function createWorkflow(
  workflow: Omit<Workflow, "id" | "created_at" | "updated_at">
): Promise<Workflow> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("workflows")
    .insert(workflow)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to create workflow");
  }

  // Track workflow creation in funnel (if user_id available)
  if (workflow.user_id) {
    try {
      const { trackWorkflowCreate } = await import("@/lib/analytics/funnel-tracking");
      trackWorkflowCreate(workflow.user_id, data.id, {
        templateId: workflow.template_id,
        timestamp: new Date().toISOString(),
      });
    } catch (trackingError) {
      // Non-critical, continue
      console.warn("Failed to track workflow creation", trackingError);
    }
  }

  return data as Workflow;
}

/**
 * Update workflow
 */
export async function updateWorkflow(
  workflowId: string,
  updates: Partial<Omit<Workflow, "id" | "created_at" | "updated_at">>
): Promise<Workflow> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("workflows")
    .update(updates)
    .eq("id", workflowId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to update workflow");
  }

  return data as Workflow;
}

/**
 * Delete workflow
 */
export async function deleteWorkflow(workflowId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from("workflows")
    .delete()
    .eq("id", workflowId);

  if (error) {
    throw new Error(error.message || "Failed to delete workflow");
  }
}
