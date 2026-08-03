import { YouTubePlatform } from "./youtube.js";
import { TikTokPlatform } from "./tiktok.js";
import { FacebookPlatform } from "./facebook.js";
import { InstagramPlatform } from "./instagram.js";

/**
 * Registry mapping a platform key (from PlatformDetector) to its adapter
 * instance. To support a new platform: write src/platforms/<name>.js
 * extending BasePlatform, then add one line here.
 */
export const platforms = {
  youtube: new YouTubePlatform(),
  tiktok: new TikTokPlatform(),
  facebook: new FacebookPlatform(),
  instagram: new InstagramPlatform(),
};
