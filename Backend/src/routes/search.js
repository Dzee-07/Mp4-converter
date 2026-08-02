import { Router } from "express";
import { platforms } from "../platforms/index.js";
import { withRetry } from "../utils/retry.js";
import { logger } from "../utils/logger.js";
import { config } from "../config.js";

const router = Router();

/**
 * GET /api/search?platform=youtube&q=naruto
 *
 * Real results only where a platform actually exposes a search API:
 * - youtube: YouTube Data API v3 (needs YOUTUBE_API_KEY, see README)
 * - tiktok/facebook/instagram: no public search API without an approved
 *   partner app, so this returns success:false with an explanatory error
 *   instead of pretending to search.
 */
router.get("/search", async (req, res) => {
  const { platform, q } = req.query;
  logger.info("search request", { platform, q });

  if (!q || !q.trim()) {
    return res.status(400).json({ success: false, error: "A search query is required." });
  }

  const adapter = platforms[platform];
  if (!adapter) {
    return res.status(400).json({ success: false, error: "Unsupported or missing platform." });
  }

  if (typeof adapter.searchVideos !== "function") {
    return res.status(501).json({
      success: false,
      platform,
      error: `Real search isn't available for ${platform} yet — it has no public search API without an approved partner app.`,
    });
  }

  try {
    const results = await withRetry(() => adapter.searchVideos(q.trim()), {
      attempts: config.retry.attempts,
      baseDelayMs: config.retry.baseDelayMs,
      label: `${platform}.searchVideos`,
    });
    res.json({ success: true, platform, results });
  } catch (err) {
    logger.error("search failed", { platform, q, error: err.message });
    res.status(422).json({ success: false, platform, error: err.message });
  }
});

export default router;
