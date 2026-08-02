import { BasePlatform } from "./BasePlatform.js";

/**
 * Instagram adapter.
 *
 * Same situation as Facebook (Meta owns both): oEmbed Read and the Graph
 * API require an approved app and an access token belonging to the
 * content owner. There's no public, unauthenticated metadata endpoint
 * for arbitrary Instagram URLs.
 *
 * To make this real: register a Meta app, get oEmbed Read approved, and
 * call https://graph.facebook.com/v19.0/instagram_oembed with your token.
 */
export class InstagramPlatform extends BasePlatform {
  name = "instagram";

  async getMetadata(_url) {
    // TODO: call https://graph.facebook.com/v19.0/instagram_oembed
    //       with ?url=<url>&access_token=<app_id>|<app_secret>
    //       once your app has oEmbed Read approval.
    return {
      title: null,
      thumbnail: null,
      author: null,
      duration: null,
      note: "Not implemented: Instagram metadata requires an approved Meta app + access token (Graph API oEmbed Read).",
    };
  }

  async getDownloadInfo(_url) {
    return {
      formats: [],
      downloadUrl: null,
      note: "Not implemented: Instagram does not expose a public download API for video/reel files.",
    };
  }
}
