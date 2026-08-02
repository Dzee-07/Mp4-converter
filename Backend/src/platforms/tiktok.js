import fetch from "node-fetch";
import { BasePlatform } from "./BasePlatform.js";
import { permanentError } from "../utils/retry.js";

/**
 * TikTok adapter.
 *
 * Metadata: uses TikTok's public oEmbed endpoint
 * (https://www.tiktok.com/oembed) — documented, unauthenticated, ToS-
 * compliant. Returns title/description, author and thumbnail.
 *
 * Download info: intentionally NOT implemented — see getDownloadInfo().
 * TikTok does not offer a public API for downloadable video files
 * (with or without the watermark), and building that requires
 * reverse-engineering private endpoints, which breaks TikTok's Terms
 * of Service.
 */
export class TikTokPlatform extends BasePlatform {
  name = "tiktok";

  async getMetadata(url) {
    const endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await fetch(endpoint);

    if (res.status === 404 || res.status === 400) {
      throw permanentError("This TikTok URL could not be found or is private.");
    }
    if (!res.ok) {
      throw new Error(`TikTok oEmbed request failed with status ${res.status}`);
    }

    const data = await res.json();
    return {
      title: data.title ?? "Untitled video",
      thumbnail: data.thumbnail_url ?? null,
      author: data.author_name ?? null,
      duration: null,
    };
  }

  async getDownloadInfo(_url) {
    return {
      formats: [],
      downloadUrl: null,
      note: "Not implemented: TikTok has no public/licensed download API. This is an intentional extension point, not a bug — see README.md.",
    };
  }
}
