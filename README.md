# Omega Downloader Service

A modular backend that detects the platform for a video URL, validates it,
fetches public metadata, and returns a unified JSON response. Built with a
clean separation between the orchestrating service, per-platform adapters,
and cross-cutting utilities (logging, retry, caching, rate limiting), so
adding a new platform is a one-file, one-line change.

## Run it

```bash
npm install
npm start
# POST http://localhost:4000/api/resolve   body: { "url": "https://..." }
```

## What's real vs. what's stubbed — please read this

- **URL detection & validation** — fully implemented (`src/core/PlatformDetector.js`).
- **Metadata for YouTube & TikTok** — fully implemented, using each
  platform's **public, unauthenticated oEmbed endpoint** (documented,
  ToS-compliant, no scraping). You get title, author, and thumbnail.
  Duration isn't exposed by oEmbed on either platform.
- **Metadata for Facebook & Instagram** — stubbed. Meta restricts video
  oEmbed to apps with approved permissions and an access token from the
  content owner, so there's no public endpoint to call without that setup.
  Fill in the TODO in `src/platforms/facebook.js` / `instagram.js` once you
  have Meta app credentials.
- **`getDownloadInfo()` (the actual downloadable file/stream) — intentionally
  not implemented for any platform.** None of these four platforms offer a
  public or licensed API for retrieving a video file. Building that requires
  reverse-engineering each platform's private player/CDN endpoints, which
  breaks their Terms of Service and raises copyright concerns — so this
  service stops at metadata and leaves `getDownloadInfo()` as a clearly
  marked extension point. If you have a licensed provider or partnership
  for a given platform, that's where you'd wire it in.

## Architecture

```
src/
  core/
    PlatformDetector.js   # URL -> platform key, URL validation
    DownloaderService.js  # orchestrates detect -> validate -> cache -> retry -> adapter
  platforms/
    BasePlatform.js        # interface every adapter implements
    youtube.js, tiktok.js, facebook.js, instagram.js
    index.js                # registry — add a platform here
  utils/
    logger.js, retry.js, cache.js, rateLimiter.js
  routes/downloader.js       # POST /api/resolve
  index.js                   # Express bootstrap
```

## Response shape

```json
{
  "success": true,
  "platform": "youtube",
  "title": "...",
  "thumbnail": "https://...",
  "author": "...",
  "duration": null,
  "formats": [],
  "downloadUrl": null,
  "note": "optional explanation when a field couldn't be resolved"
}
```

On failure:

```json
{ "success": false, "platform": "youtube", "error": "..." }
```

## Extending to a new platform

1. Create `src/platforms/<name>.js` extending `BasePlatform`, implementing
   `getMetadata(url)` and `getDownloadInfo(url)`.
2. Add its domain(s) to `DOMAIN_RULES` in `src/core/PlatformDetector.js`.
3. Register the instance in `src/platforms/index.js`.

No other file needs to change — caching, retry, rate limiting, and the
route all work against the `BasePlatform` interface.
