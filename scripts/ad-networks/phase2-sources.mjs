import { networkIdentities } from "./network-identities.mjs";
import { sources as recurringSources } from "./sources.mjs";

const fathomSlugs = new Map([
  ["raptive", "raptive"], ["newor-media", "newor-media"], ["adpushup", "adpushup"],
  ["ezoic", "ezoic"], ["monumetric", "monumetric"], ["setupad", "setupad"],
  ["mediavine", "mediavine"], ["playwire", "playwire"], ["she-media", "she-media"],
  ["freestar", "freestar"], ["publift", "publift"], ["refinery89", "refinery89"],
  ["nitropay", "nitropay"], ["aditude", "aditude"],
  ["publisher-collective", "publisher-collective"], ["clickio", "clickio"],
  ["pubnation", "pubnation"], ["snack-media", "snack-media"],
  ["opti-digital", "opti-digital"], ["adnimation", "adnimation"],
  ["anymind-anymanager", "anymind"], ["venatus", "venatus"], ["adapex", "adapex"],
  ["pubpower", "pubpower"], ["pubgalaxy", "pubgalaxy"], ["concert", "concert"],
  ["infolinks", "infolinks"],
]);

const arulSlugs = new Map([
  ["raptive", "raptive"], ["newor-media", "newormedia"], ["adpushup", "adpushup"],
  ["ezoic", "ezoic"], ["monumetric", "monumetric"],
  ["journey-by-mediavine", "journey"], ["setupad", "setupad"],
  ["mediavine", "mediavine"], ["she-media", "shemedia"], ["freestar", "freestar"],
  ["publift", "publift"], ["nitropay", "nitropay"], ["adnimation", "adnimation"],
  ["pubgalaxy", "pubgalaxy"], ["media-net", "medianet"], ["concert", "concertio"],
  ["sovrn", "sovrn"], ["infolinks", "infolinks"],
]);

const explodingSlugs = new Map([
  ["raptive", "cafemedia"], ["adpushup", "adpushup"], ["ezoic", "ezoic"],
  ["snigel", "snigelweb-com"], ["setupad", "setupad"], ["mediavine", "mediavine"],
  ["playwire", "playwire"], ["freestar", "freestar"], ["publift", "publift"],
  ["refinery89", "refinery89"], ["nitropay", "nitropay"], ["clickio", "clickio"],
  ["pubnation", "pubnation-com"], ["snack-media", "snack-media-com"],
  ["anymind-anymanager", "anymanager"], ["venatus", "venatus"],
  ["pubpower", "pubpower-io"], ["infolinks", "infolinks-com"],
]);

const commonPageSlugs = new Map([
  ...networkIdentities.map((network) => [network.slug, network.slug]),
  ["media-net", "media-net"],
  ["anymind-anymanager", "anymind"],
  ["journey-by-mediavine", "journey-by-mediavine"],
]);

export const phase2Sources = [
  ...recurringSources.filter((source) => source.kind === "sellers-json" && !source.recurring).map((source) => ({
    key: source.key,
    kind: "sellers-json-once",
    url: source.url,
    networkSlug: source.networkSlug,
  })),
  {
    key: "fathom:all",
    kind: "fathom-api",
    url: "https://www.fathom.tools/",
    apiUrl: "https://www.fathom.tools/api/v1/publishers",
    networkSlug: null,
    filter: null,
  },
  ...[...fathomSlugs].map(([networkSlug, filter]) => ({
    key: `fathom:${networkSlug}`,
    kind: "fathom-api",
    url: `https://www.fathom.tools/network/${filter}`,
    apiUrl: "https://www.fathom.tools/api/v1/publishers",
    networkSlug,
    filter,
  })),
  ...[...arulSlugs].map(([networkSlug, pageSlug]) => ({
    key: `aruljohn:${networkSlug}`,
    kind: "arul-html",
    url: `https://aruljohn.com/websites-using-${pageSlug}`,
    networkSlug,
  })),
  ...[...explodingSlugs].map(([networkSlug, pageSlug]) => ({
    key: `explodingweb:${networkSlug}`,
    kind: "exploding-html",
    url: `https://explodingweb.io/ad-networks/${pageSlug}`,
    networkSlug: networkSlug === "snigel" ? "publisher-collective" : networkSlug,
  })),
  ...[...commonPageSlugs].map(([networkSlug, pageSlug]) => ({
    key: `whichadnetwork:${networkSlug}`,
    kind: "which-html",
    url: `https://whichadnetwork.com/networks/${pageSlug}`,
    networkSlug,
  })),
  ...[...commonPageSlugs].map(([networkSlug, pageSlug]) => ({
    key: `wappalyzer:${networkSlug}`,
    kind: "wappalyzer-html",
    url: `https://www.wappalyzer.com/technologies/advertising/${pageSlug}/`,
    networkSlug,
  })),
  ...[...commonPageSlugs].map(([networkSlug, pageSlug]) => ({
    key: `sitestatsdb:${networkSlug}`,
    kind: "sitestats-html",
    url: `https://sitestatsdb.com/technologies/ad-networks/${pageSlug}`,
    networkSlug,
  })),
  ...["journey-by-mediavine", "ezoic", "mediavine", "raptive"].map((networkSlug) => ({
    key: `listofwebsitesusing:${networkSlug}`,
    kind: "listof-html",
    url: `https://listofwebsitesusing.com/${networkSlug}`,
    networkSlug,
  })),
  ...[...commonPageSlugs].map(([networkSlug, pageSlug]) => ({
    key: `redvolcano:${networkSlug}`,
    kind: "redvolcano-html",
    url: `https://www.redvolcano.io/data/technologies/${pageSlug}/`,
    networkSlug,
  })),
  {
    key: "official-portfolio:publisher-collective",
    kind: "portfolio-html",
    url: "https://www.publisher-collective.com/our-sites",
    networkSlug: "publisher-collective",
  },
];
