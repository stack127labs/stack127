#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseAllianceProductDetail } from "./lib/catalog.mjs";
import { matchOpenSmartHouseDevice, openSmartHouseCandidates, productImageDocument } from "./lib/opensmarthouse.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const cacheRoot = path.resolve(process.env.STACK127_ZWAVE_CACHE ?? "/tmp/stack127-z-wave-alliance-cache");
const openSmartHouseCache = path.join(cacheRoot, "opensmarthouse");
const reportPath = path.join(repositoryRoot, "content_docs/z-wave-devices/opensmarthouse-image-research.json");
const refreshReport = JSON.parse(await readFile(path.join(repositoryRoot, "content_docs/z-wave-devices/refresh-report.json"), "utf8"));
const resolvedByAllianceId = new Map();
try {
  const previous = JSON.parse(await readFile(reportPath, "utf8"));
  for (const record of previous.records.filter((item) => item.status === "resolved")) resolvedByAllianceId.set(record.alliance_id, record);
} catch {
  // The first research pass has no prior report.
}
try {
  const [processedImages, allianceIndex] = await Promise.all([
    readFile(path.join(cacheRoot, "processed-images.json"), "utf8").then(JSON.parse),
    readFile(path.join(cacheRoot, "alliance-index.json"), "utf8").then(JSON.parse),
  ]);
  for (const apiRecord of allianceIndex) {
    const cached = processedImages[apiRecord.slug];
    if (!cached?.source_url?.includes("opensmarthouse.org")) continue;
    const deviceId = Number(cached.source_url.match(/\/zwavedatabase\/(\d+)\//)?.[1]);
    if (!deviceId || resolvedByAllianceId.has(apiRecord.id)) continue;
    resolvedByAllianceId.set(apiRecord.id, {
      alliance_id: apiRecord.id,
      alliance_url: apiRecord.link,
      confidence: "previously-validated-exact-match",
      image_source_url: cached.source_url,
      opensmarthouse_id: deviceId,
      source_url: `https://opensmarthouse.org/zwavedatabase/${deviceId}`,
      status: "resolved",
    });
  }
} catch {
  // A missing processed-image cache simply means there are no earlier matches to recover.
}
const imageFailures = refreshReport.coverage.failures
  .filter((failure) => /image/i.test(failure.reason) && !resolvedByAllianceId.has(failure.id));

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "stack127 catalog research (+https://stack127.com)" },
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function cachedJson(fileName, url) {
  const file = path.join(openSmartHouseCache, fileName);
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    const value = await fetchJson(url);
    await writeFile(file, `${JSON.stringify(value)}\n`);
    return value;
  }
}

async function mapConcurrent(values, concurrency, callback) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await callback(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

await mkdir(openSmartHouseCache, { recursive: true });
const indexResponse = await cachedJson("device-index.json", "https://opensmarthouse.org/dmxConnect/api/zwavedatabase/device/list.php?limit=99999");
const index = indexResponse.devices ?? [];
const prepared = [];
const candidateIds = new Set();
for (const failure of imageFailures) {
  const html = await readFile(path.join(cacheRoot, "details", `${failure.id}.html`), "utf8");
  const fields = parseAllianceProductDetail(html).fields;
  const candidates = openSmartHouseCandidates(fields, index);
  for (const candidate of candidates) candidateIds.add(candidate.id);
  prepared.push({ failure, fields });
}

const detailedDevices = new Map();
await mapConcurrent([...candidateIds], 6, async (id, indexPosition) => {
  const detail = await cachedJson(`device-${id}.json`, `https://opensmarthouse.org/dmxConnect/api/zwavedatabase/device/read.php?device_id=${id}`);
  detailedDevices.set(id, {
    ...detail,
    device_ref: detail.device_ref,
    manufacturer_name: detail.manufacturer?.label,
    manufacturer_ref: detail.manufacturer?.reference,
  });
  if ((indexPosition + 1) % 50 === 0) console.log(`${indexPosition + 1}/${candidateIds.size} OpenSmartHouse device details`);
});

const researchedRecords = prepared.map(({ failure, fields }) => {
  const candidates = openSmartHouseCandidates(fields, index)
    .map((candidate) => detailedDevices.get(candidate.id))
    .filter(Boolean);
  const match = matchOpenSmartHouseDevice(fields, candidates);
  if (!match) return { alliance_id: failure.id, alliance_url: failure.url, reason: "No exact OpenSmartHouse identity match", status: "unresolved" };
  const image = productImageDocument(match.device.documents ?? []);
  if (!image) return { alliance_id: failure.id, alliance_url: failure.url, opensmarthouse_id: match.device.database_id ?? match.device.id, reason: "Matched device has no unambiguous product image", status: "unresolved" };
  const deviceId = match.device.database_id ?? match.device.id;
  return {
    alliance_id: failure.id,
    alliance_url: failure.url,
    confidence: match.confidence,
    image_source_url: `https://opensmarthouse.org/zwavedatabase/${deviceId}/reference/${encodeURIComponent(image.file)}`,
    opensmarthouse_id: deviceId,
    source_url: `https://opensmarthouse.org/zwavedatabase/${deviceId}`,
    status: "resolved",
  };
});

for (const record of researchedRecords.filter((item) => item.status === "resolved")) resolvedByAllianceId.set(record.alliance_id, record);
const unresolved = researchedRecords.filter((record) => record.status !== "resolved");
const records = [...resolvedByAllianceId.values(), ...unresolved].sort((left, right) => left.alliance_id - right.alliance_id);
const resolved = records.filter((record) => record.status === "resolved");
const report = {
  generated_at: new Date().toISOString(),
  source_total: records.length,
  candidate_device_total: candidateIds.size,
  resolved_total: resolved.length,
  unresolved_total: unresolved.length,
  records,
};
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ source_total: report.source_total, candidate_device_total: candidateIds.size, resolved_total: resolved.length, unresolved_total: report.unresolved_total, report: path.relative(repositoryRoot, reportPath) }, null, 2));
