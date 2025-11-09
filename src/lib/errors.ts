/**
 * Error Taxonomy and Error Classes
 * Provides structured error handling with consistent error types
 */

/**
 * Base error class for all application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

/**
 * Validation Errors (400)
 * Input validation failures, schema validation errors
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly validationErrors?: Array<{ path: string[]; message: string }>,
    details?: Record<string, unknown>
  ) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

/**
 * Authentication Errors (401)
 * Invalid credentials, expired tokens
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required", details?: Record<string, unknown>) {
    super(message, "AUTHENTICATION_ERROR", 401, details);
  }
}

/**
 * Authorization Errors (403)
 * Insufficient permissions, resource access denied
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions", details?: Record<string, unknown>) {
    super(message, "AUTHORIZATION_ERROR", 403, details);
  }
}

/**
 * Resource Not Found Errors (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string, details?: Record<string, unknown>) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message, "NOT_FOUND", 404, { resource, id, ...details });
  }
}

/**
 * Resource Conflict Errors (409)
 * Duplicate resources, constraint violations
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "CONFLICT", 409, details);
  }
}

/**
 * System Errors (500)
 * Database failures, external service failures
 */
export class SystemError extends AppError {
  constructor(
    message: string,
    public readonly originalError?: Error,
    details?: Record<string, unknown>
  ) {
    super(message, "SYSTEM_ERROR", 500, {
      ...details,
      originalError: originalError?.message,
    });
  }
}

/**
 * Network Errors
 * Timeouts, connection failures
 */
export class NetworkError extends AppError {
  constructor(
    message: string,
    public readonly retryable: boolean = true,
    details?: Record<string, unknown>
  ) {
    super(message, "NETWORK_ERROR", 503, { retryable, ...details });
  }
}

/**
 * Rate Limit Errors (429)
 */
export class RateLimitError extends AppError {
  constructor(
    message: string = "Rate limit exceeded",
    public readonly retryAfter?: number,
    details?: Record<string, unknown>
  ) {
    super(message, "RATE_LIMIT", 429, { retryAfter, ...details });
  }
}

/**
 * Error taxonomy mapping
 */
export const ERROR_TAXONOMY = {
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    statusCode: 400,
    description: "Input validation failures, schema validation errors",
  },
  AUTHENTICATION_ERROR: {
    code: "AUTHENTICATION_ERROR",
    statusCode: 401,
    description: "Invalid credentials, expired tokens",
  },
  AUTHORIZATION_ERROR: {
    code: "AUTHORIZATION_ERROR",
    statusCode: 403,
    description: "Insufficient permissions, resource access denied",
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    statusCode: 404,
    description: "Resource not found",
  },
  CONFLICT: {
    code: "CONFLICT",
    statusCode: 409,
    description: "Duplicate resources, constraint violations",
  },
  RATE_LIMIT: {
    code: "RATE_LIMIT",
    statusCode: 429,
    description: "Rate limit exceeded",
  },
  SYSTEM_ERROR: {
    code: "SYSTEM_ERROR",
    statusCode: 500,
    description: "Database failures, external service failures",
  },
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    statusCode: 503,
    description: "Timeouts, connection failures",
  },
} as const;

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Format error for API response
 */
export function formatError(error: unknown): {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
} {
  if (isAppError(error)) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
      statusCode: 500,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unknown error occurred",
    statusCode: 500,
  };
}
