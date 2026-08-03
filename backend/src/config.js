export const config = {
  port: process.env.PORT || 4000,
  cache: {
    ttlMs: 5 * 60 * 1000, // 5 minutes
    maxEntries: 500,
  },
  retry: {
    attempts: 3,
    baseDelayMs: 300,
  },
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // per IP per window
  },
};