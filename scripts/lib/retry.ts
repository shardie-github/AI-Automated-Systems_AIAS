/**
 * Exponential backoff retry utility with jitter
 * Idempotent, safe for concurrent use
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitter?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitter: true,
  onRetry: () => {},
};

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === opts.maxAttempts) {
        throw lastError;
      }

      const delay = calculateDelay(attempt, opts);
      opts.onRetry?.(attempt, lastError);
      await sleep(delay);
    }
  }

  throw lastError || new Error('Retry failed');
}

function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const exponentialDelay = options.baseDelayMs * Math.pow(2, attempt - 1);
  const delay = Math.min(exponentialDelay, options.maxDelayMs);

  if (options.jitter) {
    const jitterAmount = delay * 0.1 * Math.random();
    return delay + jitterAmount;
  }

  return delay;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
