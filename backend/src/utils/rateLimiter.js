/**
 * Per-IP fixed-window rate limiter. Simple and dependency-free; swap for
 * `express-rate-limit` + a Redis store if you need it to work across
 * multiple server instances.
 */
export function rateLimiter({ windowMs = 60_000, maxRequests = 30 } = {}) {
  const hits = new Map(); // ip -> { count, windowStart }

  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || now - entry.windowStart > windowMs) {
      hits.set(ip, { count: 1, windowStart: now });
      return next();
    }

    if (entry.count >= maxRequests) {
      const retryAfterSec = Math.ceil((entry.windowStart + windowMs - now) / 1000);
      res.set("Retry-After", String(retryAfterSec));
      return res.status(429).json({
        success: false,
        error: "Too many requests — please slow down.",
        retryAfterSeconds: retryAfterSec,
      });
    }

    entry.count += 1;
    next();
  };
}
