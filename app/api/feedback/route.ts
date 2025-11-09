// [STAKE+TRUST:BEGIN:feedback_api]
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createValidatedRoute } from "@/lib/api/validation-middleware";
import { z } from "zod";
import { logger } from "@/lib/logging/structured-logger";
import { telemetry } from "@/lib/monitoring/enhanced-telemetry";
import { SystemError, ValidationError, formatError } from "@/src/lib/errors";
import { recordError } from "@/lib/utils/error-detection";
import { retry } from "@/lib/utils/retry";

export const runtime = "edge";

interface FeedbackResponse {
  ok: boolean;
  error?: string;
  details?: string;
}

const feedbackSchema = z.object({
  userId: z.string().optional().default("anon"),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const POST = createValidatedRoute(feedbackSchema, async (data, req: NextRequest): Promise<NextResponse<FeedbackResponse>> => {
  try {
    // Load environment variables dynamically
    const { env } = await import("@/lib/env");
    const supabaseUrl = env.supabase.url;
    const supabaseKey = env.supabase.anonKey;

    if (!supabaseUrl || !supabaseKey) {
      const error = new SystemError("Supabase configuration missing");
      recordError(error, { endpoint: '/api/feedback' });
      logger.error("Supabase configuration missing");
      const formatted = formatError(error);
      return NextResponse.json(
        { ok: false, error: formatted.message },
        { status: formatted.statusCode }
      );
    }

    const supa = createClient(supabaseUrl, supabaseKey);

    const { userId, rating, comment } = data;

    // Validate comment length if provided
    if (comment && comment.length > 1000) {
      const error = new ValidationError("Comment too long (max 1000 characters)");
      const formatted = formatError(error);
      return NextResponse.json(
        { ok: false, error: formatted.message },
        { status: formatted.statusCode }
      );
    }

    // Retry database insert with exponential backoff
    const { error } = await retry(
      async () => {
        const result = await supa.from("audit_log").insert({
          user_id: userId,
          action: "feedback",
          meta: { rating, comment, timestamp: new Date().toISOString() },
        });
        if (result.error) {
          throw new Error(result.error.message);
        }
        return result;
      },
      {
        maxAttempts: 3,
        initialDelayMs: 1000,
        onRetry: (attempt, err) => {
          logger.warn(`Retrying feedback insert (attempt ${attempt})`, { error: err.message });
        },
      }
    );

    if (error) {
      const systemError = new SystemError(
        "Failed to submit feedback",
        error instanceof Error ? error : new Error(String(error)),
        { userId, rating }
      );
      recordError(systemError, { endpoint: '/api/feedback', userId, rating });
      logger.error("Feedback submission error", systemError, { userId, rating });
      const formatted = formatError(systemError);
      return NextResponse.json(
        { ok: false, error: formatted.message, details: formatted.details?.originalError as string },
        { status: formatted.statusCode }
      );
    }

    // Track feedback submission
    telemetry.track({
      name: "feedback_submitted",
      category: "business",
      properties: { rating, hasComment: !!comment },
    });

    logger.info("Feedback submitted successfully", { userId, rating });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const systemError = new SystemError(
      "Internal server error",
      error instanceof Error ? error : new Error(String(error)),
      { userId: data.userId }
    );
    recordError(systemError, { endpoint: '/api/feedback', userId: data.userId });
    logger.error("Feedback API error", systemError, { userId: data.userId });
    const formatted = formatError(systemError);
    return NextResponse.json(
      {
        ok: false,
        error: formatted.message,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: formatted.statusCode }
    );
  }
});
// [STAKE+TRUST:END:feedback_api]
