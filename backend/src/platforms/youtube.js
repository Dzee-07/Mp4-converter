import fetch from "node-fetch";
import { BasePlatform } from "./BasePlatform.js";
import { permanentError } from "../utils/retry.js";

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

  async searchVideos(query, { limit = 12, pageToken = null } = {}) {
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
    return {
      results: (data.items || []).map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url ?? null,
        author: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      })),
      nextPageToken: data.nextPageToken ?? null,
    };
  }

  async getDownloadInfo(_url) {
    return {
      formats: [],
      downloadUrl: null,
      note: "Not implemented: retrieving a downloadable stream from YouTube requires a licensed provider or the official Data API, and is intentionally left as an extension point.",
    };
  }
}
