/**
 * Workflow Execution Engine
 * Executes workflows based on triggers and actions
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { track } from "@/lib/telemetry/track";
import { getTemplate, validateTemplateConfig } from "./templates";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  results?: Record<string, unknown>;
}

export interface WorkflowTrigger {
  type: "webhook" | "schedule" | "manual";
  config: Record<string, unknown>;
}

export interface WorkflowAction {
  id: string;
  type: string;
  integration: string;
  config: Record<string, unknown>;
}

/**
 * Execute a workflow
 */
export async function executeWorkflow(
  workflowId: string,
  userId: string,
  trigger?: WorkflowTrigger
): Promise<WorkflowExecution> {
  const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const execution: WorkflowExecution = {
    id: executionId,
    workflowId,
    userId,
    status: "running",
    startedAt: new Date(),
  };

  try {
    // Get workflow from database
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", workflowId)
      .eq("user_id", userId)
      .single();

    if (workflowError || !workflow) {
      throw new Error(`Workflow not found: ${workflowError?.message}`);
    }

    if (!workflow.enabled) {
      throw new Error("Workflow is disabled");
    }

    // Get template if workflow is based on a template
    let template;
    if (workflow.template_id) {
      template = getTemplate(workflow.template_id);
    }

    // Validate workflow configuration
    if (template) {
      const validation = validateTemplateConfig(template, workflow.config || {});
      if (!validation.valid) {
        throw new Error(`Invalid workflow configuration: ${validation.errors.join(", ")}`);
      }
    }

    // Execute workflow steps
    const results: Record<string, unknown> = {};
    const steps = workflow.steps || [];

    for (const step of steps) {
      try {
        const stepResult = await executeStep(step, userId, results);
        results[step.id] = stepResult;
      } catch (stepError) {
        logger.error("Workflow step failed", {
          workflowId,
          stepId: step.id,
          error: stepError,
          userId,
        });

        // Retry logic for transient errors
        if (stepError instanceof Error && stepError.message.includes("rate limit")) {
          await delay(2000); // Wait 2 seconds
          try {
            const retryResult = await executeStep(step, userId, results);
            results[step.id] = retryResult;
          } catch (retryError) {
            throw new Error(`Step ${step.id} failed after retry: ${retryError}`);
          }
        } else {
          throw stepError;
        }
      }
    }

    execution.status = "completed";
    execution.completedAt = new Date();
    execution.results = results;

    // Track automation run event
    try {
      await track(userId, {
        type: "automation_run",
        path: "/api/workflows/execute",
        meta: {
          workflow_id: workflowId,
          execution_id: executionId,
          status: "completed",
          duration_ms: execution.completedAt.getTime() - execution.startedAt.getTime(),
          timestamp: new Date().toISOString(),
        },
        app: "web",
      });
    } catch (telemetryError) {
      logger.warn("Failed to track automation run", { error: telemetryError });
    }

    // Store execution in database
    await storeExecution(execution);

    return execution;
  } catch (error) {
    execution.status = "failed";
    execution.completedAt = new Date();
    execution.error = error instanceof Error ? error.message : String(error);

    logger.error("Workflow execution failed", {
      workflowId,
      executionId,
      error,
      userId,
    });

    // Track failed execution
    try {
      await track(userId, {
        type: "automation_run",
        path: "/api/workflows/execute",
        meta: {
          workflow_id: workflowId,
          execution_id: executionId,
          status: "failed",
          error: execution.error,
          timestamp: new Date().toISOString(),
        },
        app: "web",
      });
    } catch (telemetryError) {
      logger.warn("Failed to track failed automation run", { error: telemetryError });
    }

    // Store execution in database
    await storeExecution(execution);

    throw error;
  }
}

/**
 * Execute a single workflow step
 */
async function executeStep(
  step: { id: string; type: string; config: Record<string, unknown> },
  userId: string,
  previousResults: Record<string, unknown>
): Promise<unknown> {
  const { type, config, integration } = step as { type: string; config: Record<string, unknown>; integration?: string };

  // Replace template variables in config
  const processedConfig = processTemplateVariables(config, previousResults);

  switch (type) {
    case "trigger":
      // Triggers are handled by the system, not executed here
      return { triggered: true };

    case "action":
      return await executeAction(integration || "", processedConfig, userId);

    case "condition":
      return await evaluateCondition(processedConfig, previousResults);

    default:
      throw new Error(`Unknown step type: ${type}`);
  }
}

/**
 * Execute an action
 */
async function executeAction(
  integration: string,
  config: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  // Get user's integration credentials
  const { data: integrationData } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", integration)
    .eq("status", "connected")
    .single();

  if (!integrationData) {
    throw new Error(`Integration ${integration} not connected`);
  }

  // Route to appropriate integration handler
  switch (integration) {
    case "shopify":
      return await executeShopifyAction(config, integrationData);
    case "wave":
      return await executeWaveAction(config, integrationData);
    case "slack":
      return await executeSlackAction(config, integrationData);
    case "gmail":
      return await executeGmailAction(config, integrationData);
    default:
      throw new Error(`Unsupported integration: ${integration}`);
  }
}

/**
 * Execute Shopify action
 */
async function executeShopifyAction(
  config: Record<string, unknown>,
  integrationData: Record<string, unknown>
): Promise<unknown> {
  const action = config.action as string;

  // In a real implementation, you would:
  // 1. Use Shopify API with stored access token
  // 2. Execute the action (get orders, send email, etc.)
  // 3. Return the result

  logger.info("Executing Shopify action", { action, config });

  // Placeholder implementation
  return {
    success: true,
    action,
    message: "Shopify action executed",
  };
}

/**
 * Execute Wave action
 */
async function executeWaveAction(
  config: Record<string, unknown>,
  integrationData: Record<string, unknown>
): Promise<unknown> {
  const action = config.action as string;

  logger.info("Executing Wave action", { action, config });

  // Placeholder implementation
  return {
    success: true,
    action,
    message: "Wave action executed",
  };
}

/**
 * Execute Slack action
 */
async function executeSlackAction(
  config: Record<string, unknown>,
  integrationData: Record<string, unknown>
): Promise<unknown> {
  const action = config.action as string;

  logger.info("Executing Slack action", { action, config });

  // Placeholder implementation
  return {
    success: true,
    action,
    message: "Slack action executed",
  };
}

/**
 * Execute Gmail action
 */
async function executeGmailAction(
  config: Record<string, unknown>,
  integrationData: Record<string, unknown>
): Promise<unknown> {
  const action = config.action as string;

  logger.info("Executing Gmail action", { action, config });

  // Placeholder implementation
  return {
    success: true,
    action,
    message: "Gmail action executed",
  };
}

/**
 * Evaluate a condition
 */
async function evaluateCondition(
  config: Record<string, unknown>,
  previousResults: Record<string, unknown>
): Promise<boolean> {
  const field = config.field as string;
  const operator = config.operator as string || "equals";
  const value = config.value;

  // Process template variables
  const processedField = processTemplateVariables(field, previousResults) as string;

  switch (operator) {
    case "equals":
      return processedField === value;
    case "contains":
      return processedField.includes(value as string);
    case "greater_than":
      return Number(processedField) > Number(value);
    case "less_than":
      return Number(processedField) < Number(value);
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}

/**
 * Process template variables in config
 */
function processTemplateVariables(
  config: string | Record<string, unknown>,
  previousResults: Record<string, unknown>
): string | Record<string, unknown> {
  if (typeof config === "string") {
    return config.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const parts = path.split(".");
      let value: unknown = previousResults;
      for (const part of parts) {
        if (value && typeof value === "object" && part in value) {
          value = (value as Record<string, unknown>)[part];
        } else {
          return match; // Return original if not found
        }
      }
      return String(value);
    });
  }

  if (typeof config === "object" && config !== null) {
    const processed: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(config)) {
      processed[key] = processTemplateVariables(val as string | Record<string, unknown>, previousResults);
    }
    return processed;
  }

  return config;
}

/**
 * Store execution in database
 */
async function storeExecution(execution: WorkflowExecution): Promise<void> {
  try {
    await supabase.from("workflow_executions").insert({
      id: execution.id,
      workflow_id: execution.workflowId,
      user_id: execution.userId,
      status: execution.status,
      started_at: execution.startedAt.toISOString(),
      completed_at: execution.completedAt?.toISOString(),
      error: execution.error,
      results: execution.results,
    });
  } catch (error) {
    logger.error("Failed to store workflow execution", { error, executionId: execution.id });
  }
}

/**
 * Delay helper for retries
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
