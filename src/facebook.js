import { BasePlatform } from "./BasePlatform.js";

/**
 * Facebook adapter.
 *
 * Meta restricts oEmbed Read and the Graph API's video endpoints to
 * approved apps with the right permissions and an access token issued
 * to the content owner — there is no public, unauthenticated way to pull
 * metadata or media for an arbitrary video URL.
 *
 * To make this real: register a Meta app, get "oEmbed Read" access
 * approved, and call the Graph API's oEmbed endpoint with your app token.
 * Fill in the TODOs below once you have credentials.
 */
export class FacebookPlatform extends BasePlatform {
  name = "facebook";

  async getMetadata(_url) {
    // TODO: call https://graph.facebook.com/v19.0/oembed_video
    //       with ?url=<url>&access_token=<app_id>|<app_secret>
    //       once your app has oEmbed Read approval.
    return {
      title: null,
      thumbnail: null,
      author: null,
      duration: null,
      note: "Not implemented: Facebook metadata requires an approved Meta app + access token (Graph API oEmbed Read). Add credentials and wire up the call above.",
    };
  }

  async getDownloadInfo(_url) {
    return {
      formats: [],
      downloadUrl: null,
      note: "Not implemented: Facebook does not expose a public download API for video files.",
    };
  }
}
