import { detectPlatform, isValidUrl } from "./PlatformDetector.js";
import { platforms } from "../platforms/index.js";
import { withRetry, permanentError } from "../utils/retry.js";
import { TtlCache } from "../utils/cache.js";
import { logger } from "../utils/logger.js";
import { config } from "../config.js";

const metadataCache = new TtlCache({ ttlMs: config.cache.ttlMs, maxEntries: config.cache.maxEntries });

export class DownloaderService {
  /**
   * Main entry point. Detects the platform, validates the URL, fetches
   * metadata (cached + retried), and returns the unified response shape
   * described in the API docs.
   * @param {string} url
   */
  async process(url) {
    if (!url || typeof url !== "string") {
      return this._fail(null, "A video URL is required.");
    }
    if (!isValidUrl(url)) {
      return this._fail(null, "That doesn't look like a valid URL.");
    }

    const platformKey = detectPlatform(url);
    if (!platformKey || !platforms[platformKey]) {
      return this._fail(null, "Unsupported platform. Supported: YouTube, TikTok, Facebook, Instagram.");
    }

    const adapter = platforms[platformKey];
    const cacheKey = `${platformKey}:${url}`;

    const cached = metadataCache.get(cacheKey);
    if (cached) {
      logger.debug("cache hit", { cacheKey });
      return cached;
    }

    try {
      const metadata = await withRetry(() => adapter.getMetadata(url), {
        attempts: config.retry.attempts,
        baseDelayMs: config.retry.baseDelayMs,
        label: `${platformKey}.getMetadata`,
      });

      const downloadInfo = await withRetry(() => adapter.getDownloadInfo(url), {
        attempts: config.retry.attempts,
        baseDelayMs: config.retry.baseDelayMs,
        label: `${platformKey}.getDownloadInfo`,
      });

      const response = {
        success: true,
        platform: platformKey,
        title: metadata.title,
        thumbnail: metadata.thumbnail,
        author: metadata.author ?? null,
        duration: metadata.duration ?? null,
        formats: downloadInfo.formats ?? [],
        downloadUrl: downloadInfo.downloadUrl ?? null,
        ...(downloadInfo.note || metadata.note ? { note: downloadInfo.note || metadata.note } : {}),
      };

      metadataCache.set(cacheKey, response);
      return response;
    } catch (err) {
      logger.error("processing failed", { url, platform: platformKey, error: err.message });
      return this._fail(platformKey, err.message);
    }
  }

  _fail(platform, error) {
    return { success: false, platform, error };
  }
}
