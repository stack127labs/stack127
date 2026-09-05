import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import {
  buildCreatorsApiSearchRequest,
  normalizeCreatorsApiSearchResponse,
  tokenEndpointForVersion,
} from "./creators-api.mjs";
import { parseArgs, readJson, root } from "./workflow.mjs";

const credentialId = process.env.AMAZON_CREATORS_API_CREDENTIAL_ID;
const credentialSecret = process.env.AMAZON_CREATORS_API_SECRET;
const credentialVersion = process.env.AMAZON_CREATORS_API_VERSION;
const apiHost = (process.env.AMAZON_CREATORS_API_HOST || "https://creatorsapi.amazon").replace(/\/$/, "");
const marketplace = process.env.AMAZON_CREATORS_API_MARKETPLACE || "www.amazon.com";
if (!credentialId || !credentialSecret || !credentialVersion) {
  console.error("Creators API credentials are unavailable. Set the credential ID, secret, and version in .env.affiliate after Amazon grants access.");
  process.exit(2);
}

const args = parseArgs(process.argv);
const delay = Math.max(250, Number(args.delay ?? 1100));
const limit = Number(args.limit ?? Number.POSITIVE_INFINITY);
const outputFile = path.join(root, "lib/amazon-affiliate/data/creators-api-results.jsonl");
const candidates = await readJson("lib/amazon-affiliate/data/candidates.json");
const reviews = await readJson("lib/amazon-affiliate/data/reviews.json");
const currentReview = new Map(reviews.reviews.map((review) => [`${review.directory}/${review.record_slug}`, review]));
const completed = new Map();
for (const line of (await readFile(outputFile, "utf8").catch(() => "")).split("\n")) {
  if (!line.trim()) continue;
  try {
    const entry = JSON.parse(line);
    if (!entry.error) completed.set(`${entry.directory}/${entry.record_slug}`, entry.identity_hash);
  } catch {
    // A partial final line remains retryable.
  }
}

const pending = candidates.records.filter((item) => {
  const key = `${item.directory}/${item.record_slug}`;
  return currentReview.get(key)?.status === "needs-review" && completed.get(key) !== item.identity_hash;
}).slice(0, limit);

const tokenResponse = await fetch(tokenEndpointForVersion(credentialVersion), {
  body: JSON.stringify({
    client_id: credentialId,
    client_secret: credentialSecret,
    grant_type: "client_credentials",
    scope: "creatorsapi::default",
  }),
  headers: { "Content-Type": "application/json" },
  method: "POST",
  signal: AbortSignal.timeout(30_000),
});
const tokenPayload = await tokenResponse.json();
if (!tokenResponse.ok || !tokenPayload.access_token) throw new Error(`Creators API token request failed with HTTP ${tokenResponse.status}.`);

let processed = 0;
for (const item of pending) {
  let lastError = "Creators API search failed";
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(`${apiHost}/catalog/v1/searchItems`, {
        body: JSON.stringify(buildCreatorsApiSearchRequest(item.identity, { marketplace, partnerTag: "stack127-20" })),
        headers: {
          Authorization: `Bearer ${tokenPayload.access_token}`,
          "Content-Type": "application/json",
          "x-marketplace": marketplace,
        },
        method: "POST",
        signal: AbortSignal.timeout(45_000),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const normalized = normalizeCreatorsApiSearchResponse(payload);
      await appendFile(outputFile, `${JSON.stringify({
        ...normalized,
        directory: item.directory,
        identity_hash: item.identity_hash,
        queried_at: new Date().toISOString(),
        record_slug: item.record_slug,
        source: "Amazon Creators API SearchItems",
      })}\n`);
      lastError = "";
      break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      await new Promise((resolve) => setTimeout(resolve, delay * 2 ** (attempt - 1)));
    }
  }
  if (lastError) await appendFile(outputFile, `${JSON.stringify({
    directory: item.directory,
    error: lastError,
    identity_hash: item.identity_hash,
    queried_at: new Date().toISOString(),
    record_slug: item.record_slug,
    source: "Amazon Creators API SearchItems",
  })}\n`);
  processed += 1;
  if (processed % 100 === 0) console.log(JSON.stringify({ processed, remaining: pending.length - processed }));
  await new Promise((resolve) => setTimeout(resolve, delay));
}

console.log(JSON.stringify({ processed, remaining: pending.length - processed }));
