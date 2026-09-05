import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { extractAmazonCandidatesFromFrontmatter, scoreAmazonCandidate } from "./lib.mjs";

export const root = path.resolve(import.meta.dirname, "../../../");
export const reviewDate = new Date().toISOString().slice(0, 10);

export const directoryFiles = [
  { directory: "zigbee-devices", key: "devices", path: "lib/zigbee-devices/data/devices.json" },
  { directory: "zigbee-coordinators", key: "records", path: "lib/hardware-directories/data/zigbee-coordinators.json" },
  { directory: "z-wave-devices", key: "records", path: "lib/hardware-directories/data/z-wave-devices.json" },
  { directory: "nut-compatible-ups", key: "records", path: "lib/hardware-directories/data/nut-compatible-ups.json" },
  { directory: "local-security-cameras", key: "records", path: "lib/hardware-directories/data/local-security-cameras.json" },
  { directory: "matter-devices", key: "records", path: "lib/hardware-directories/data/matter-devices.json" },
];

export function parseArgs(argv) {
  return Object.fromEntries(argv.slice(2).map((item) => {
    const [key, ...value] = item.replace(/^--/, "").split("=");
    return [key, value.length ? value.join("=") : true];
  }));
}

export async function readJson(file) {
  return JSON.parse(await readFile(path.resolve(root, file), "utf8"));
}

export async function loadDirectoryRecords() {
  const output = [];
  for (const config of directoryFiles) {
    const snapshot = await readJson(config.path);
    for (const record of snapshot[config.key]) output.push({ directory: config.directory, record });
  }
  return output;
}

export function identityFor(record) {
  return {
    model: String(record.model ?? "").trim(),
    name: String(record.name ?? "").trim(),
    vendor: String(record.vendor ?? "").trim(),
  };
}

export function identityHash(record) {
  const value = identityFor(record);
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
}

function compactIdentity(value) {
  return String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function sourceIdentityMatches(identity, sourceIdentity) {
  const model = compactIdentity(identity.model);
  const sourceModel = compactIdentity(sourceIdentity?.model);
  const vendor = compactIdentity(identity.vendor);
  const sourceVendor = compactIdentity(sourceIdentity?.vendor);
  return Boolean(model && vendor && sourceVendor && model === sourceModel && (vendor === sourceVendor || vendor.includes(sourceVendor) || sourceVendor.includes(vendor)));
}

export function sourceEvidence(record) {
  const candidates = [
    record.blakadder_url ? { title: "Blakadder compatibility record", url: record.blakadder_url } : null,
    record.zigbee2mqtt_url ? { title: "Zigbee2MQTT device record", url: record.zigbee2mqtt_url } : null,
    ...(record.source_links ?? []).map((item) => ({ title: item.label, url: item.url })),
    ...(record.provenance ?? []).map((item) => ({ title: `${item.source}: ${item.field}`, url: item.url })),
  ].filter(Boolean);
  const selected = candidates.find((item) => /^https:\/\//.test(item.url) && !/amazon\.(?:com|ca|co\.uk|de|fr|it|es|nl|pl|se)/i.test(item.url));
  return {
    kind: "source-record",
    title: selected?.title || `${record.vendor} ${record.model} directory record`,
    url: selected?.url || "https://stack127.com/",
  };
}

export function amazonCandidatesFromRecord(record) {
  const candidates = new Map();
  const urls = [
    ...(record.source_links ?? []).map((item) => item.url),
    ...(record.provenance ?? []).map((item) => item.url),
  ];
  for (const url of urls) {
    const match = String(url).match(/^https:\/\/(?:[^/]+\.)?amazon\.com\/(?:[^?#]*\/)?(?:dp|gp\/product)\/([A-Za-z0-9]{10})(?:[/?#]|$)/i);
    if (!match) continue;
    const asin = match[1].toUpperCase();
    candidates.set(asin, { asin, origin: "directory-source", url: `https://www.amazon.com/dp/${asin}` });
  }
  return [...candidates.values()];
}

function pageBasename(value) {
  try {
    return decodeURIComponent(new URL(value).pathname.split("/").at(-1) ?? "").replace(/\.html$/i, "").toLowerCase();
  } catch {
    return "";
  }
}

async function walkMarkdown(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walkMarkdown(file));
    else if (entry.isFile() && entry.name.endsWith(".md")) output.push(file);
  }
  return output;
}

export async function loadBlakadderIndex(blakadderRoot) {
  const index = new Map();
  if (!blakadderRoot) return index;
  for (const file of await walkMarkdown(path.join(blakadderRoot, "_zigbee"))) {
    const text = await readFile(file, "utf8");
    const key = path.basename(file, ".md").toLowerCase();
    const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
    const field = (name) => frontmatter.match(new RegExp(`^${name}:\\s*["']?(.+?)["']?\\s*$`, "mi"))?.[1]?.trim() ?? "";
    const sourceIdentity = { model: field("model"), name: field("title"), vendor: field("vendor") };
    index.set(key, extractAmazonCandidatesFromFrontmatter(text).map((item) => ({
      ...item,
      origin: "pinned-blakadder",
      source_identity: sourceIdentity,
      source_url: `https://github.com/blakadder/zigbee/blob/d96e8aaf72ecdad807d3930900d9c8433051d2b4/_zigbee/${path.basename(file)}`,
    })));
  }
  return index;
}

export function blakadderCandidates(record, index) {
  const links = [record.blakadder_url, ...(record.source_links ?? []).map((item) => item.url)].filter(Boolean);
  const candidates = new Map();
  for (const link of links) {
    const key = pageBasename(link);
    for (const item of index.get(key) ?? []) candidates.set(item.asin, item);
  }
  return [...candidates.values()];
}

export function queryFor(identity) {
  const terms = [identity.vendor, identity.model].filter(Boolean).map((value) => `"${String(value).replaceAll('"', "")}"`);
  return `site:amazon.com/dp ${terms.join(" ")}`;
}

export function chooseExactCandidate(identity, candidates) {
  return candidates
    .map((candidate) => ({ ...candidate, match: scoreAmazonCandidate(identity, candidate) }))
    .filter((candidate) => candidate.match.exact_model && candidate.match.vendor_match)
    .sort((left, right) => right.match.score - left.match.score || left.asin.localeCompare(right.asin))[0] ?? null;
}

export function hasUsMarketplaceVariant(record) {
  const values = [
    record.model,
    record.name,
    ...(record.facts ?? []).map((item) => `${item.label} ${item.value}`),
    ...(record.certification_variants ?? []).map((item) => JSON.stringify(item)),
  ].join(" ");
  if (record.certification_variant_kind === "z-wave") return /\bUS(?:\s+LR)?\b|\bUnited States\b/i.test(values);
  const explicitNonUsModel = /(?:^|[-_\s])(UK|EU|AU)(?:$|[-_\s])/i.test(`${record.model} ${record.name}`);
  const explicitUsModel = /(?:^|[-_\s])(US|USA)(?:$|[-_\s])/i.test(`${record.model} ${record.name}`);
  if (explicitNonUsModel && !explicitUsModel) return false;
  const onlyHighVoltage = /\b(?:220|230|240)\s*V\b/i.test(values) && !/\b(?:110|115|120)\s*V\b/i.test(values);
  return !onlyHighVoltage;
}

export function isRetailIdentity(directory, record) {
  if (!record.model || /^(unknown|not published|n\/a)$/i.test(record.model)) return false;
  if (directory === "matter-devices" && /certified variants?|software component|component only/i.test(`${record.model} ${record.name} ${record.category}`)) return false;
  if (directory === "nut-compatible-ups" && !/named model/i.test(record.category)) return false;
  return true;
}

export function isUsProductTitle(title) {
  const value = String(title ?? "");
  const explicitNonUs = /\b(?:UK|EU|European|Australian)\s+(?:plug|socket|outlet|version|model)\b|\b(?:plug|socket|outlet)\s+(?:for\s+)?(?:UK|EU|Europe|Australia)\b/i.test(value);
  const explicitUs = /\b(?:US|USA|United States)\s+(?:plug|socket|outlet|version|model)\b/i.test(value);
  return !explicitNonUs || explicitUs;
}
