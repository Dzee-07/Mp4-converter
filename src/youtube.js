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

  async getDownloadInfo(_url) {
    return {
      formats: [],
      downloadUrl: null,
      note: "Not implemented: retrieving a downloadable stream from YouTube requires a licensed provider or the official Data API, and is intentionally left as an extension point.",
    };
  }
}
