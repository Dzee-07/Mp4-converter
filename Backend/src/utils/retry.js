import { logger } from "./logger.js";

/**
 * Wraps an async function with retry + exponential backoff + jitter.
 * Only retries errors marked transient (network errors, 5xx, timeouts) —
 * validation errors and 4xx from a platform should fail fast instead.
 */
export async function withRetry(fn, { attempts = 3, baseDelayMs = 300, label = "operation" } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastErr = err;
      const retriable = err.isTransient !== false; // default: assume retriable unless explicitly marked
      if (!retriable || attempt === attempts) {
        logger.error(`${label} failed permanently`, { attempt, error: err.message });
        throw err;
      }
      const delay = baseDelayMs * 2 ** (attempt - 1) + Math.random() * 100;
      logger.warn(`${label} failed, retrying`, { attempt, delayMs: Math.round(delay), error: err.message });
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw lastErr;
}

/** Marks an error as non-retriable (e.g. bad input, 404, unsupported URL). */
export function permanentError(message) {
  const err = new Error(message);
  err.isTransient = false;
  return err;
}
