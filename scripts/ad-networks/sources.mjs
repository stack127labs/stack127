// A seller file is a source of domain leads, never evidence of network membership.
// Keep source keys stable so the recurring job matches Phase 2 provenance.
const sellerFeeds = [
  ["raptive", "https://ads.cafemedia.com/sellers.json"],
  ["newor-media", "https://newormedia.com/sellers.json"],
  ["adpushup", "https://adpushup.com/sellers.json"],
  ["ezoic", "https://ezoic.ai/sellers.json"],
  ["monumetric", "https://monumetric.com/sellers.json"],
  ["snigel", "https://cdn.snigelweb.com/sellers/sellers.json"],
  ["journey-by-mediavine", "https://sellers.journeymv.com/sellers.json"],
  ["setupad", "https://setupad.com/sellers.json"],
  ["mediavine", "https://www.mediavine.com/sellers.json"],
  ["playwire", "https://playwire.com/sellers.json"],
  ["she-media", "https://ads.shemedia.com/sellers.json"],
  ["freestar", "https://freestar.com/sellers.json"],
  ["publift", "https://www.publift.com/sellers.json"],
  ["refinery89", "https://refinery89.com/sellers.json"],
  ["nitropay", "https://nitropay.com/sellers.json"],
  ["aditude", "https://cdn-prod.aditude.com/sellers.json"],
  ["clickio", "https://clickio.com/sellers.json"],
  ["pubnation", "https://sellers.pubnation.com/sellers.json"],
  ["snack-media", "https://www.snack-media.com/sellers.json"],
  ["opti-digital", "https://scripts.opti-digital.com/sellers.json"],
  ["adnimation", "https://www.adnimation.com/sellers.json"],
  ["anymind-anymanager", "https://anymanager.io/sellers.json"],
  ["venatus", "https://www.venatus.com/sellers.json"],
  ["adapex", "https://adapex.io/sellers.json"],
  ["pubpower", "https://pubpower.io/sellers.json"],
  ["pubgalaxy", "https://www.pubgalaxy.com/sellers.json"],
  ["media-net", "https://www.media.net/sellers.json"],
  ["concert", "https://concert.io/sellers.json"],
  ["sovrn", "https://lijit.com/sellers.json"],
  ["infolinks", "https://infolinks.com/sellers.json"],
  ["google-adsense", "https://realtimebidding.google.com/sellers.json"],
  ["taboola", "https://www.taboola.com/sellers.json"],
  ["teads", "https://sellers.teads.tv/sellers.json"],
  ["amazon-publisher-services", "https://aps.amazon.com/sellers.json"],
  ["mgid", "https://www.mgid.com/sellers.json"],
  ["revcontent", "https://assets.revcontent.com/sellers/master/sellers.json"],
  ["buysellads-carbon-ads", "https://cdn4.buysellads.com/sellers.json"],
  ["sparteo", "https://sparteo.com/sellers.json"],
];

// Checked 2026-09-25. These hosts need permission or a working robots policy
// before they can be part of a scheduled collector.
const paused = new Map([
  ["raptive", "ads.cafemedia.com/robots.txt returned 403"],
  ["ezoic", "ezoic.ai/robots.txt timed out"],
  ["journey-by-mediavine", "sellers.journeymv.com/robots.txt returned 403"],
  ["refinery89", "redirect destination d14u3rq094fyp8.cloudfront.net/robots.txt returned 403"],
  ["adapex", "adapex.io/robots.txt disallows all paths"],
  ["venatus", "redirect destination hb.vntsm.com/robots.txt returned 403"],
  ["sovrn", "lijit.com/robots.txt returned 403"],
  ["pubgalaxy", "redirect destination cdn.pubgalaxy.com/robots.txt returned 403"],
  ["amazon-publisher-services", "aps.amazon.com/robots.txt returned 503 on repeated runtime checks"],
  ["revcontent", "assets.revcontent.com/robots.txt returned 403"],
  ["buysellads-carbon-ads", "cdn4.buysellads.com/robots.txt disallows the seller file"],
]);

export const sources = [
  ...sellerFeeds.map(([slug, url]) => ({
    key: `sellers-json:${slug}`,
    kind: "sellers-json",
    url,
    networkSlug: slug,
    cadence: "weekly",
    extraction: "sellers[].domain for PUBLISHER or BOTH records",
    use: "candidate_domain_only",
    robotsReviewedAt: slug === "google-adsense" ? "2026-09-28" : "2026-09-25",
    skipRobotsCheck: slug === "google-adsense",
    robotsNote: slug === "google-adsense"
      ? "Official machine-readable seller file; its separate robots endpoint times out"
      : null,
    verificationPriority: slug === "google-adsense" ? 95 : 80,
    timeoutMs: slug === "taboola" ? 180_000 : 45_000,
    transport: slug === "taboola" ? "curl-file" : "fetch",
    normalRequestsPerRun: 2,
    recurring: !paused.has(slug),
    pausedReason: paused.get(slug) ?? null,
  })),
  {
    key: "sellers-json:teads-outbrain",
    kind: "sellers-json",
    url: "https://www.outbrain.com/sellers.json",
    networkSlug: "teads",
    cadence: "weekly",
    extraction: "sellers[].domain for PUBLISHER or BOTH records",
    use: "candidate_domain_only",
    robotsReviewedAt: "2026-09-28",
    verificationPriority: 80,
    normalRequestsPerRun: 2,
    recurring: true,
    pausedReason: null,
  },
  {
    key: "official-publishers:ethicalads",
    kind: "publisher-list-html",
    url: "https://www.ethicalads.io/publishers/list/",
    networkSlug: "ethicalads",
    cadence: "weekly",
    extraction: "external publisher links on the official publisher list",
    use: "candidate_domain_only",
    robotsReviewedAt: "2026-09-28",
    verificationPriority: 90,
    normalRequestsPerRun: 2,
    recurring: true,
    pausedReason: null,
  },
  {
    key: "majestic-million",
    kind: "majestic-csv",
    url: "https://downloads.majestic.com/majestic_million.csv",
    cadence: "weekly",
    extraction: "Domain column of downloadable CSV",
    use: "candidate_domain_only",
    robotsReviewedAt: "2026-09-25",
    normalRequestsPerRun: 2,
    licenseAttribution: "Majestic Million, CC BY 3.0",
    recurring: true,
    pausedReason: null,
  },
];

export function selectSources(keys = []) {
  if (keys.length === 0 || keys.includes("all")) return sources.filter((source) => source.recurring);
  const selected = sources.filter((source) => keys.includes(source.key) || keys.includes(source.networkSlug));
  const unknown = keys.filter((key) => !sources.some((source) => source.key === key || source.networkSlug === key));
  if (unknown.length) throw new Error(`Unknown source: ${unknown.join(", ")}`);
  const held = selected.filter((source) => !source.recurring);
  if (held.length) throw new Error(`Source is paused: ${held.map((source) => `${source.key} (${source.pausedReason})`).join(", ")}`);
  return selected;
}
