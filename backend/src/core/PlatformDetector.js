/**
 * Detects which platform a URL belongs to by matching its hostname.
 * Add a new platform by adding one entry here — no other code needs to
 * change to recognize the new domain.
 */
const DOMAIN_RULES = [
  { platform: "youtube", hosts: ["youtube.com", "youtu.be", "m.youtube.com"] },
  { platform: "tiktok", hosts: ["tiktok.com", "vm.tiktok.com"] },
  { platform: "facebook", hosts: ["facebook.com", "fb.watch", "m.facebook.com"] },
  { platform: "instagram", hosts: ["instagram.com"] },
];

export function detectPlatform(rawUrl) {
  let host;
  try {
    host = new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return null; // not a valid URL at all
  }

  for (const rule of DOMAIN_RULES) {
    if (rule.hosts.some((h) => host === h || host.endsWith(`.${h}`))) {
      return rule.platform;
    }
  }
  return null;
}

export function isValidUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
