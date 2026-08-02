import fetch from "node-fetch";
import { BasePlatform } from "./BasePlatform.js";
import { permanentError } from "../utils/retry.js";

/** Converts YouTube's ISO 8601 duration (e.g. "PT3M24S") into "3:24" / "1:02:03". */
function formatIsoDuration(iso) {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = parseInt(m[1] || "0", 10);
  const min = parseInt(m[2] || "0", 10);
  const s = parseInt(m[3] || "0", 10);
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`;
}

/**
 * YouTube adapter.
 *
 * Metadata: uses YouTube's public, unauthenticated oEmbed endpoint
 * (https://www.youtube.com/oembed) — this is documented, ToS-compliant,
 * and requires no API key. It returns title, author and thumbnail, but
 * NOT duration (oEmbed doesn't expose it; the official Data API v3 does,
 * but needs an API key — swap it in here if you have one).
 *
 * Search: uses the official YouTube Data API v3 search.list endpoint.
 * This is the real, ToS-compliant way to get actual search results —
 * requires a free API key from console.cloud.google.com (see README).
 * Without a key, searchVideos() throws and the caller should fall back.
 *
 * Download info: intentionally NOT implemented. YouTube does not provide
 * a public API for retrieving downloadable video files, and building that
 * requires reverse-engineering YouTube's player, which breaks YouTube's
 * Terms of Service. Plug in a licensed/authorized provider here if you
 * have one — see getDownloadInfo() below.
 */
export class YouTubePlatform extends BasePlatform {
  name = "youtube";

  async getMetadata(url) {
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(endpoint);

    if (res.status === 404 || res.status === 400) {
      throw permanentError("This YouTube URL could not be found or is private.");
    }
    if (!res.ok) {
      throw new Error(`YouTube oEmbed request failed with status ${res.status}`); // transient -> retried
    }

    const data = await res.json();
    return {
      title: data.title ?? "Untitled video",
      thumbnail: data.thumbnail_url ?? null,
      author: data.author_name ?? null,
      duration: null, // not exposed by oEmbed
    };
  }

  async searchVideos(query, { limit = 10, pageToken = null } = {}) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw permanentError("YOUTUBE_API_KEY is not set on the backend — search needs a real API key (see README).");
    }
    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      maxResults: String(limit),
      q: query,
      key: apiKey,
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);

    if (res.status === 403) {
      throw permanentError("YouTube API key was rejected (quota exceeded, restricted, or invalid).");
    }
    if (!res.ok) {
      throw new Error(`YouTube search failed with status ${res.status}`); // transient -> retried
    }

    const data = await res.json();
    const items = data.items || [];
    const ids = items.map((item) => item.id.videoId).filter(Boolean);
    const durations = ids.length ? await this._fetchDurations(ids, apiKey) : {};

    return {
      results: items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url ?? null,
        author: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        duration: durations[item.id.videoId] ?? null, // e.g. "3:24" — null if lookup failed
      })),
      nextPageToken: data.nextPageToken ?? null,
    };
  }

  /** Batches a videos.list(contentDetails) call to get real durations for up to 50 IDs at once. */
  async _fetchDurations(ids, apiKey) {
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids.join(",")}&key=${apiKey}`);
      if (!res.ok) return {};
      const data = await res.json();
      const out = {};
      for (const v of data.items || []) {
        out[v.id] = formatIsoDuration(v.contentDetails?.duration);
      }
      return out;
    } catch {
      return {}; // duration is a nice-to-have — never fail the whole search over it
    }
  }

  async getDownloadInfo(_url) {
    return {
      formats: [],
      downloadUrl: null,
      note: "Not implemented: retrieving a downloadable stream from YouTube requires a licensed provider or the official Data API, and is intentionally left as an extension point.",
    };
  }
}
