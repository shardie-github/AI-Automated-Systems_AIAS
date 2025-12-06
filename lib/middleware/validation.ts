/**
 * Input Validation Middleware
 * 
 * Comprehensive input validation for API routes.
 * Prevents injection attacks, validates data types, and sanitizes input.
 */

import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeRequestBody } from "./security";

/**
 * Validation error response
 */
export function validationErrorResponse(errors: z.ZodError): NextResponse {
  return NextResponse.json(
    {
      error: "Validation failed",
      details: errors.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    },
    { status: 400 }
  );
}

/**
 * Validate request body with Zod schema
 */
export function validateBody<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  try {
    // This is a placeholder - in actual usage, you'd parse the body
    // For now, return a structure that can be used
    return { success: false, response: validationErrorResponse(new z.ZodError([])) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, response: validationErrorResponse(error) };
    }
    return {
      success: false,
      response: NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate query parameters
 */
export function validateQuery<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  try {
    const query = Object.fromEntries(request.nextUrl.searchParams.entries());
    const data = schema.parse(query);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, response: validationErrorResponse(error) };
    }
    return {
      success: false,
      response: NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      ),
    };
  }
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number"),
  url: z.string().url("Invalid URL"),
  uuid: z.string().uuid("Invalid UUID"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Invalid slug format"),
  positiveInt: z.number().int().positive(),
  nonEmptyString: z.string().min(1, "String cannot be empty"),
  dateISO: z.string().datetime(),
};

/**
 * Sanitize and validate input
 */
export function sanitizeAndValidate<T extends z.ZodTypeAny>(
  input: unknown,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  try {
    // Sanitize first
    const sanitized = sanitizeRequestBody(input);
    // Then validate
    const data = schema.parse(sanitized);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}
