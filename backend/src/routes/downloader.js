import { Router } from "express";
import { DownloaderService } from "../core/DownloaderService.js";
import { logger } from "../utils/logger.js";

const router = Router();
const service = new DownloaderService();

/**
 * POST /api/resolve
 * body: { url: string }
 *
 * Returns the unified JSON shape:
 * { success, platform, title, thumbnail, duration, formats, downloadUrl, error? }
 */
router.post("/resolve", async (req, res) => {
  const { url } = req.body || {};
  logger.info("resolve request", { url });

  const result = await service.process(url);
  const status = result.success ? 200 : result.platform ? 422 : 400;
  res.status(status).json(result);
});

export default router;
