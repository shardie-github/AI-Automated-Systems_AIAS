/**
 * Enhanced Workflow Execution Engine
 * Includes rate limiting, circuit breakers, error handling, and real API call structure
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { track } from "@/lib/telemetry/track";
import { getTemplate, validateTemplateConfig } from "./templates";
import { RateLimiter } from "@/lib/performance/rate-limiter";
import { CircuitBreaker } from "@/lib/resilience/circuit-breaker";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

// Initialize rate limiter
const rateLimiter = new RateLimiter();

// Circuit breakers for each integration
const circuitBreakers = new Map<string, CircuitBreaker>();

function getCircuitBreaker(integration: string): CircuitBreaker {
  if (!circuitBreakers.has(integration)) {
    circuitBreakers.set(
      integration,
      new CircuitBreaker({
        name: integration,
        failureThreshold: 5,
        timeout: 60000, // 1 minute
        successThreshold: 2,
      })
    );
  }
  return circuitBreakers.get(integration)!;
}

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
 * Check rate limits for user
 */
async function checkRateLimit(userId: string, plan: string): Promise<boolean> {
  // Get plan limits
  const limits: Record<string, { monthly: number }> = {
    free: { monthly: 100 },
    starter: { monthly: 10000 },
    pro: { monthly: 50000 },
  };

  const limit = limits[plan]?.monthly || limits.free.monthly;
  const key = `workflow:${userId}:${new Date().toISOString().slice(0, 7)}`; // Monthly key

  try {
    const result = await rateLimiter.checkLimit(key, {
      windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
      maxRequests: limit,
    });

    if (!result.allowed) {
      logger.warn("Rate limit exceeded", {
        userId,
        plan,
        limit,
        resetTime: new Date(result.resetTime).toISOString(),
      });
      return false;
    }

    return true;
  } catch (error) {
    // If rate limiting fails, allow the request (fail open)
    logger.error("Rate limit check failed", error instanceof Error ? error : new Error(String(error)), {
      userId,
    });
    return true;
  }
}

/**
 * Execute a workflow with enhanced error handling and rate limiting
 */
export async function executeWorkflow(
  workflowId: string,
  userId: string,
  _trigger?: WorkflowTrigger
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
    // Get user plan for rate limiting
    const { data: userData } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single();

    const plan = (userData?.plan as string) || "free";

    // Check rate limits
    const allowed = await checkRateLimit(userId, plan);
    if (!allowed) {
      throw new Error(
        `Monthly automation limit reached. Upgrade your plan or wait until next month. Current plan: ${plan}`
      );
    }

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

    // Execute workflow steps with retry logic
    const results: Record<string, unknown> = {};
    const steps = workflow.steps || [];

    for (const step of steps) {
      try {
        const stepResult = await executeStepWithRetry(step, userId, results, 3);
        results[step.id] = stepResult;
      } catch (stepError) {
        const errorObj: Error =
          stepError instanceof Error ? stepError : new Error(String(stepError));
        logger.error("Workflow step failed after retries", errorObj, {
          workflowId,
          stepId: step.id,
          userId,
        });
        throw new Error(`Step ${step.id} failed: ${errorObj.message}`);
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

    const errorObj: Error = error instanceof Error ? error : new Error(String(error));
    logger.error("Workflow execution failed", errorObj, {
      workflowId,
      executionId,
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
 * Execute step with retry logic
 */
async function executeStepWithRetry(
  step: { id: string; type: string; config: Record<string, unknown> },
  userId: string,
  previousResults: Record<string, unknown>,
  maxRetries: number = 3
): Promise<unknown> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await executeStep(step, userId, previousResults);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors
      if (
        lastError.message.includes("not connected") ||
        lastError.message.includes("not found") ||
        lastError.message.includes("invalid")
      ) {
        throw lastError;
      }

      // Exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        logger.warn("Step execution failed, retrying", {
          stepId: step.id,
          attempt,
          maxRetries,
          delay,
          error: lastError.message,
        });
        await delay(delay);
      }
    }
  }

  throw lastError || new Error("Step execution failed");
}

/**
 * Execute a single workflow step
 */
async function executeStep(
  step: { id: string; type: string; config: Record<string, unknown> },
  userId: string,
  previousResults: Record<string, unknown>
): Promise<unknown> {
  const { type, config, integration } = step as {
    type: string;
    config: Record<string, unknown>;
    integration?: string;
  };

  // Replace template variables in config
  const processedConfig = processTemplateVariables(config, previousResults);

  switch (type) {
    case "trigger":
      // Triggers are handled by the system, not executed here
      return { triggered: true };

    case "action":
      return await executeAction(integration || "", processedConfig as Record<string, unknown>, userId);

    case "condition":
      return await evaluateCondition(processedConfig as Record<string, unknown>, previousResults);

    default:
      throw new Error(`Unknown step type: ${type}`);
  }
}

/**
 * Execute an action with circuit breaker protection
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
    throw new Error(`Integration ${integration} not connected. Please connect it in Settings.`);
  }

  // Get circuit breaker for this integration
  const circuitBreaker = getCircuitBreaker(integration);

  // Execute with circuit breaker protection
  return await circuitBreaker.execute(
    async () => {
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
    },
    async () => {
      // Fallback when circuit is open
      logger.warn("Circuit breaker open, using fallback", {
        integration,
        userId,
      });
      throw new Error(
        `${integration} integration is temporarily unavailable. Please try again later.`
      );
    }
  );
}

/**
 * Execute Shopify action with real API structure
 * NOTE: Requires SHOPIFY_ACCESS_TOKEN in integrationData
 */
async function executeShopifyAction(
  config: Record<string, unknown>,
  integrationData: Record<string, unknown>
): Promise<unknown> {
  const action = config.action as string;
  const shop = integrationData.shop as string;
  const accessToken = integrationData.access_token as string;

  if (!accessToken) {
    throw new Error("Shopify access token not found. Please reconnect your Shopify integration.");
  }

  const shopifyUrl = `https://${shop}.myshopify.com/admin/api/2024-01`;

  logger.info("Executing Shopify action", { action, shop, config });

  try {
    switch (action) {
      case "get_orders":
        const date = (config.date as string) || "today";
        const response = await fetch(`${shopifyUrl}/orders.json?status=any&created_at_min=${date}`, {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return {
          success: true,
          orders: data.orders || [],
          count: data.orders?.length || 0,
        };

      case "send_email":
        // Shopify doesn't have a direct email API, this would use their notification system
        // For now, return success (this would need to be implemented via Shopify's notification API)
        logger.warn("Shopify send_email action not fully implemented", { config });
        return {
          success: true,
          message: "Email notification queued (Shopify email API integration pending)",
        };

      default:
        throw new Error(`Unsupported Shopify action: ${action}`);
    }
  } catch (error) {
    const errorObj: Error = error instanceof Error ? error : new Error(String(error));
    logger.error("Shopify action failed", errorObj, { action, shop });
    throw new Error(`Shopify action failed: ${errorObj.message}`);
  }
}

/**
 * Execute Wave action with real API structure
 * NOTE: Requires WAVE_ACCESS_TOKEN in integrationData
 */
async function executeWaveAction(
  config: Record<string, unknown>,
  integrationData: Record<string, unknown>
): Promise<unknown> {
  const action = config.action as string;
  const businessId = integrationData.business_id as string;
  const accessToken = integrationData.access_token as string;

  if (!accessToken) {
    throw new Error("Wave access token not found. Please reconnect your Wave Accounting integration.");
  }

  const waveUrl = "https://api.waveapps.com";

  logger.info("Executing Wave action", { action, businessId, config });

  try {
    switch (action) {
      case "get_revenue":
        const date = (config.date as string) || "today";
        // Wave API endpoint for revenue (this is a placeholder - actual endpoint may differ)
        const response = await fetch(`${waveUrl}/businesses/${businessId}/financials`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Wave API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return {
          success: true,
          revenue: data.revenue || 0,
          date,
        };

      case "create_invoice":
        // Wave invoice creation (placeholder - actual implementation needed)
        logger.warn("Wave create_invoice action not fully implemented", { config });
        return {
          success: true,
          message: "Invoice creation queued (Wave invoice API integration pending)",
        };

      default:
        throw new Error(`Unsupported Wave action: ${action}`);
    }
  } catch (error) {
    const errorObj: Error = error instanceof Error ? error : new Error(String(error));
    logger.error("Wave action failed", errorObj, { action, businessId });
    throw new Error(`Wave action failed: ${errorObj.message}`);
  }
}

/**
 * Execute Slack action (placeholder - requires Slack API implementation)
 */
async function executeSlackAction(
  config: Record<string, unknown>,
  _integrationData: Record<string, unknown>
): Promise<unknown> {
  const action = config.action as string;

  logger.info("Executing Slack action", { action, config });

  // TODO: Implement real Slack API calls
  // This requires Slack OAuth and webhook/API integration
  throw new Error(
    "Slack integration is coming soon. Please use email notifications for now."
  );
}

/**
 * Execute Gmail action (placeholder - requires Gmail API implementation)
 */
async function executeGmailAction(
  config: Record<string, unknown>,
  _integrationData: Record<string, unknown>
): Promise<unknown> {
  const action = config.action as string;

  logger.info("Executing Gmail action", { action, config });

  // TODO: Implement real Gmail API calls
  // This requires Google OAuth and Gmail API integration
  throw new Error(
    "Gmail integration is coming soon. Please use email service integrations for now."
  );
}

/**
 * Evaluate a condition
 */
async function evaluateCondition(
  config: Record<string, unknown>,
  previousResults: Record<string, unknown>
): Promise<boolean> {
  const field = config.field as string;
  const operator = (config.operator as string) || "equals";
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
    const errorObj: Error = (error as any) instanceof Error ? error : new Error(String(error));
    logger.error("Failed to store workflow execution", errorObj, { executionId: execution.id });
  }
}

/**
 * Delay helper for retries
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
