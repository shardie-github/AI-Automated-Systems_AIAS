/**
 * Activation Funnel Tracking
 * Tracks user progression through activation stages
 */

import { track } from "@/lib/telemetry/track";
import { logger } from "@/lib/logging/structured-logger";

export type FunnelStage =
  | "signup"
  | "onboarding_start"
  | "integration_connect"
  | "workflow_create"
  | "workflow_execute"
  | "activated";

export interface FunnelEvent {
  userId: string;
  stage: FunnelStage;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Track funnel stage progression
 */
export async function trackFunnelStage(
  userId: string,
  stage: FunnelStage,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await track(userId, {
      type: "funnel_stage",
      path: "/funnel",
      meta: {
        stage,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
      app: "web",
    });

    logger.info("Funnel stage tracked", {
      userId,
      stage,
      metadata,
    });
  } catch (error) {
    logger.error("Failed to track funnel stage", error instanceof Error ? error : new Error(String(error)), {
      userId,
      stage,
    });
  }
}

/**
 * Track signup
 */
export function trackSignup(userId: string, metadata?: Record<string, unknown>): void {
  trackFunnelStage(userId, "signup", metadata);
}

/**
 * Track onboarding start
 */
export function trackOnboardingStart(userId: string, metadata?: Record<string, unknown>): void {
  trackFunnelStage(userId, "onboarding_start", metadata);
}

/**
 * Track integration connection
 */
export function trackIntegrationConnect(
  userId: string,
  integration: string,
  metadata?: Record<string, unknown>
): void {
  trackFunnelStage(userId, "integration_connect", {
    integration,
    ...metadata,
  });
}

/**
 * Track workflow creation
 */
export function trackWorkflowCreate(
  userId: string,
  workflowId: string,
  metadata?: Record<string, unknown>
): void {
  trackFunnelStage(userId, "workflow_create", {
    workflowId,
    ...metadata,
  });
}

/**
 * Track workflow execution
 */
export function trackWorkflowExecute(
  userId: string,
  workflowId: string,
  metadata?: Record<string, unknown>
): void {
  trackFunnelStage(userId, "workflow_execute", {
    workflowId,
    ...metadata,
  });
}

/**
 * Track activation (all stages complete)
 */
export function trackActivation(userId: string, metadata?: Record<string, unknown>): void {
  trackFunnelStage(userId, "activated", metadata);
}
