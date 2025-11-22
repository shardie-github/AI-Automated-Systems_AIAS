/**
 * Activation Funnel Event Tracking
 * Centralized tracking for activation funnel events
 */

import { track } from "./track";

export interface ActivationEvent {
  userId: string;
  eventType: "user_signed_up" | "integration_connected" | "workflow_created" | "user_activated" | "user_active";
  metadata?: Record<string, unknown>;
}

/**
 * Track user signup event
 */
export async function trackUserSignup(userId: string, metadata?: Record<string, unknown>): Promise<void> {
  try {
    await track(userId, {
      type: "user_signed_up",
      path: "/api/auth/signup",
      meta: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
      app: "web",
    });
  } catch (error) {
    console.error("Failed to track user signup", error);
  }
}

/**
 * Track integration connected event
 */
export async function trackIntegrationConnected(
  userId: string,
  provider: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await track(userId, {
      type: "integration_connected",
      path: "/api/integrations",
      meta: {
        provider,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
      app: "web",
    });
  } catch (error) {
    console.error("Failed to track integration connected", error);
  }
}

/**
 * Track workflow created event
 */
export async function trackWorkflowCreated(
  userId: string,
  workflowId: string,
  workflowName: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await track(userId, {
      type: "workflow_created",
      path: "/api/v1/workflows",
      meta: {
        workflow_id: workflowId,
        workflow_name: workflowName,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
      app: "web",
    });
  } catch (error) {
    console.error("Failed to track workflow created", error);
  }
}

/**
 * Track user activated event
 * User is activated when they have connected an integration AND created a workflow
 */
export async function trackUserActivated(
  userId: string,
  activationMethod: "workflow_created" | "integration_connected",
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await track(userId, {
      type: "user_activated",
      path: "/api/activation",
      meta: {
        activation_method: activationMethod,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
      app: "web",
    });
  } catch (error) {
    console.error("Failed to track user activated", error);
  }
}

/**
 * Track user active event (for retention tracking)
 */
export async function trackUserActive(userId: string, metadata?: Record<string, unknown>): Promise<void> {
  try {
    await track(userId, {
      type: "user_active",
      path: "/api/auth/login",
      meta: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
      app: "web",
    });
  } catch (error) {
    console.error("Failed to track user active", error);
  }
}
