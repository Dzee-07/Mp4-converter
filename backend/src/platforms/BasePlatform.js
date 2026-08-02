/**
 * Contract every platform adapter must implement. This is what makes the
 * service "easy to extend to additional platforms later" — add a new file
 * in src/platforms, implement these two methods, register it in
 * src/platforms/index.js, and it's live.
 */
export class BasePlatform {
  /** Short machine name, e.g. "youtube" */
  name = "base";

  /**
   * Fetch public metadata (title, thumbnail, author, duration if available).
   * Must throw a permanentError() for invalid/unsupported URLs, or a normal
   * Error for transient failures (so the retry wrapper kicks in).
   * @param {string} url
   * @returns {Promise<{title:string, thumbnail:string|null, author?:string, duration?:number|null}>}
   */
  async getMetadata(url) {
    throw new Error("getMetadata() not implemented");
  }

  /**
   * Resolve downloadable formats / a stream endpoint for the given URL.
   * IMPORTANT: see each adapter's file for why this is intentionally a stub
   * in this build — see README.md "What's real vs. stubbed".
   * @param {string} url
   * @returns {Promise<{formats: Array<{quality:string,url:string|null}>, downloadUrl: string|null}>}
   */
  async getDownloadInfo(url) {
    throw new Error("getDownloadInfo() not implemented");
  }
}
