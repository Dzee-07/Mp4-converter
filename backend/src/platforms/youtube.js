import fetch from "node-fetch";
import { exec } from "child_process";
import { promisify } from "util";
import { BasePlatform } from "./BasePlatform.js";
import { permanentError } from "../utils/retry.js";

const execAsync = promisify(exec);

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
 * YouTube adapter using native yt-dlp binary processing execution links for conversions.
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

  /**
   * FIXED: Extracts direct media stream link allocations asynchronously.
   * Handles individual resolutions profile arguments passed down from app.jsx
   */
  async getDownloadInfo(_url, resolution = "1080p") {
    try {
      if (!_url) {
        return { formats: [], downloadUrl: null, note: "Invalid or missing video link URL target." };
      }

      // 1. Establish precise format extraction selectors to capture progressive files or standard MP4 mergers
      const heightLimit = resolution.includes("1080") ? "1080" : "720";
      
      // Forces combined MP4 containers to avoid un-muxed audio/video splits inside cross-origin streams
      const formatSelector = `bestvideo[height<=${heightLimit}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${heightLimit}][ext=mp4]/best[ext=mp4]/best`;

      // 2. Formulate the shell sub-process execution query targeting your environment binary files
      const command = `yt-dlp -f "${formatSelector}" --get-url --dump-json "${_url}"`;
      
      const { stdout, stderr } = await execAsync(command);

      if (stderr && !stdout) {
        // Evaluate transient errors or geo-location IP blocks
        throw new Error(stderr);
      }

      const outputLines = stdout.trim().split("\n");
      const targetStreamUrl = outputLines[0]; // Line 1 typically returns our primary direct video link block

      // 3. Fallback extraction parsing to retrieve video metadata titles safely
      let parsedTitle = "Converted Media Video Stream";
      try {
        const jsonDump = JSON.parse(outputLines[outputLines.length - 1]);
        parsedTitle = jsonDump.title || parsedTitle;
      } catch {
        // Fail silently if metadata dumping structures were missed
      }

      return {
        success: true,
        title: parsedTitle,
        formats: [{ quality: resolution, ext: "mp4" }],
        downloadUrl: targetStreamUrl,
        note: "Stream processed cleanly using native yt-dlp server nodes."
      };

    } catch (error) {
      console.error("Critical extraction failure:", error);
      return {
        success: false,
        formats: [],
        downloadUrl: null,
        note: `Extraction pipeline exception: ${error.message}`
      };
    }
  }
}
