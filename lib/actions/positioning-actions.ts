"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { Database } from "@/src/integrations/supabase/types";

/**
 * Server Action: Submit Positioning Feedback
 * 
 * This action:
 * 1. Inserts feedback into positioning_feedback table
 * 2. Impact score is automatically calculated by database trigger
 * 3. Logs the feedback submission in activity_log
 * 4. Returns structured response with impact score for UI display
 */

type PositioningFeedbackResponse = {
  success: boolean;
  error?: string;
  data?: {
    feedbackId: number;
    impactScore: number;
    message: string;
  };
};

export async function submitPositioningFeedback(
  userId: string,
  feedbackType: "value_proposition" | "target_persona" | "pain_point" | "solution_clarity" | "messaging" | "feature_request" | "general",
  feedbackText: string,
  metadata?: Record<string, unknown>
): Promise<PositioningFeedbackResponse> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        success: false,
        error: "Server configuration error: Missing Supabase credentials",
      };
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Step 1: Insert feedback (impact score calculated by trigger)
    const { data: feedbackData, error: feedbackError } = await supabase
      .from("positioning_feedback")
      .insert({
        user_id: userId,
        feedback_type: feedbackType,
        feedback_text: feedbackText,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, impact_score")
      .single();

    if (feedbackError || !feedbackData) {
      return {
        success: false,
        error: feedbackError?.message || "Failed to submit feedback",
      };
    }

    // Step 2: Log feedback submission activity
    const { error: activityError } = await supabase
      .from("activity_log")
      .insert({
        user_id: userId,
        activity_type: "form_submit",
        entity_type: "positioning_feedback",
        entity_id: feedbackData.id.toString(),
        metadata: {
          feedback_type: feedbackType,
          impact_score: feedbackData.impact_score,
        },
        created_at: new Date().toISOString(),
      });

    if (activityError) {
      console.error("Activity log error:", activityError);
    }

    // Step 3: Revalidate dashboard to show updated metrics
    revalidatePath("/");
    revalidatePath("/dashboard");

    // Generate personalized message based on impact score
    let message = "Thank you for your feedback!";
    if (feedbackData.impact_score >= 70) {
      message = "🎉 Excellent feedback! Your input has high impact on our positioning clarity.";
    } else if (feedbackData.impact_score >= 40) {
      message = "✨ Great feedback! Your contribution helps us improve.";
    } else {
      message = "Thank you for your feedback! Every contribution matters.";
    }

    return {
      success: true,
      data: {
        feedbackId: feedbackData.id,
        impactScore: Number(feedbackData.impact_score),
        message,
      },
    };
  } catch (error) {
    console.error("Positioning feedback error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Server Action: Log User Activity
 * 
 * Logs any user engagement (clicks, scrolls, views, etc.)
 * Can be called from client components for tracking
 */
export async function logActivity(
  userId: string | null,
  sessionId: string | null,
  activityType: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, error: "Server configuration error" };
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.from("activity_log").insert({
      user_id: userId || null,
      session_id: sessionId || null,
      activity_type: activityType,
      entity_type: entityType || null,
      entity_id: entityId || null,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Activity log error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Log activity error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
