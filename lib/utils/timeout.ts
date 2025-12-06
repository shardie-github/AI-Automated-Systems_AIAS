/**
 * Timeout Utility
 * Enforces timeouts on async operations to prevent hanging requests
 */

export class TimeoutError extends Error {
  constructor(message: string = "Operation timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * Execute a promise with a timeout
 * @param promise The promise to execute
 * @param timeoutMs Timeout in milliseconds
 * @param errorMessage Custom error message
 * @returns Promise that rejects with TimeoutError if timeout is exceeded
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new TimeoutError(errorMessage || `Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Create a timeout promise
 * @param timeoutMs Timeout in milliseconds
 * @param errorMessage Custom error message
 * @returns Promise that rejects after timeout
 */
export function createTimeout(
  timeoutMs: number,
  errorMessage?: string
): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(
      () => reject(new TimeoutError(errorMessage || `Timeout after ${timeoutMs}ms`)),
      timeoutMs
    )
  );
}

/**
 * Default timeout values for different operation types
 */
export const DEFAULT_TIMEOUTS = {
  /** External API calls (Shopify, Wave, etc.) */
  EXTERNAL_API: 30000, // 30 seconds
  
  /** Internal API calls */
  INTERNAL_API: 10000, // 10 seconds
  
  /** Database queries */
  DATABASE: 5000, // 5 seconds
  
  /** File operations */
  FILE_OPERATION: 10000, // 10 seconds
  
  /** Workflow execution */
  WORKFLOW_EXECUTION: 60000, // 60 seconds
} as const;
