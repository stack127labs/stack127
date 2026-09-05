import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  buildAmazonAffiliateUrl,
  extractAmazonAsin,
  getAmazonMatch,
  validateAmazonReview,
} from "../../../../lib/amazon-affiliate/index.ts";
import {
  extractAmazonCandidatesFromFrontmatter,
  extractAmazonMarkdownProduct,
  scoreAmazonCandidate,
} from "../../../../scripts/stack127/amazon-affiliate/lib.mjs";
import { isUsProductTitle, sourceIdentityMatches } from "../../../../scripts/stack127/amazon-affiliate/workflow.mjs";
import {
  buildCreatorsApiSearchRequest,
  normalizeCreatorsApiSearchResponse,
} from "../../../../scripts/stack127/amazon-affiliate/creators-api.mjs";

const root = new URL("../../../../", import.meta.url);
const directoryFiles = [
  ["zigbee-devices", "lib/zigbee-devices/data/devices.json", "devices"],
  ["zigbee-coordinators", "lib/hardware-directories/data/zigbee-coordinators.json", "records"],
  ["z-wave-devices", "lib/hardware-directories/data/z-wave-devices.json", "records"],
  ["nut-compatible-ups", "lib/hardware-directories/data/nut-compatible-ups.json", "records"],
  ["local-security-cameras", "lib/hardware-directories/data/local-security-cameras.json", "records"],
  ["matter-devices", "lib/hardware-directories/data/matter-devices.json", "records"],
];

test("Amazon product URLs use an exact ASIN and the stack127 tracking ID", () => {
  assert.equal(extractAmazonAsin("https://www.amazon.com/example/dp/B0B6P22YJC"), "B0B6P22YJC");
  assert.equal(extractAmazonAsin("https://www.amazon.com/gp/product/B09KXTCMSC"), "B09KXTCMSC");
  assert.equal(extractAmazonAsin("https://example.com/dp/B0B6P22YJC"), null);
  assert.equal(extractAmazonAsin("https://www.amazon.com/s?k=zigbee"), null);
  assert.equal(
    buildAmazonAffiliateUrl("B0B6P22YJC"),
    "https://www.amazon.com/dp/B0B6P22YJC/ref=nosim?tag=stack127-20",
  );
});

test("pinned source records yield US Amazon candidates without copying old tags", () => {
  const candidates = extractAmazonCandidatesFromFrontmatter(`---
model: ZBDongle-E
vendor: SONOFF
link: https://www.amazon.com/SONOFF-Universal/dp/B0B6P22YJC?tag=someone-20
link2: https://www.amazon.de/dp/B0B6P22YJC
---`);

  assert.deepEqual(candidates, [{ asin: "B0B6P22YJC", url: "https://www.amazon.com/dp/B0B6P22YJC" }]);
});

test("Amazon candidates score exact model and vendor identity", () => {
  const candidate = {
    asin: "B0B6P22YJC",
    title: "SONOFF Zigbee 3.0 USB Dongle Plus-E ZBDongle-E - Amazon",
    url: "https://www.amazon.com/dp/B0B6P22YJC",
  };
  assert.deepEqual(scoreAmazonCandidate({ model: "ZBDongle-E", name: "Zigbee USB coordinator", vendor: "SONOFF" }, candidate), {
    exact_model: true,
    name_overlap: 0,
    score: 6,
    vendor_match: true,
  });
});

test("Amazon page evidence extracts only the canonical product title", () => {
  const markdown = `Title: Amazon.com: SONOFF Zigbee 3.0 USB Dongle Plus-E ZBDongle-E : Electronics

URL Source: http://www.amazon.com/dp/B0B6P22YJC

Markdown Content:`;
  assert.deepEqual(extractAmazonMarkdownProduct(markdown, "B0B6P22YJC"), {
    asin: "B0B6P22YJC",
    title: "SONOFF Zigbee 3.0 USB Dongle Plus-E ZBDongle-E",
    url: "https://www.amazon.com/dp/B0B6P22YJC",
  });
  assert.equal(extractAmazonMarkdownProduct("Title: Page not found", "B0B6P22YJC"), null);
});

test("explicit non-US electrical variants are not published as US matches", () => {
  assert.equal(isUsProductTitle("Brand smart plug, UK plug version"), false);
  assert.equal(isUsProductTitle("Brand smart plug, US outlet model"), true);
});

test("pinned source identity can prove an exact short retail model", () => {
  assert.equal(sourceIdentityMatches(
    { model: "P1", name: "Motion sensor", vendor: "Acme" },
    { model: "P1", name: "Motion detector", vendor: "Acme Devices" },
  ), true);
  assert.equal(sourceIdentityMatches(
    { model: "P1", name: "Motion sensor", vendor: "Acme" },
    { model: "P2", name: "Motion detector", vendor: "Acme Devices" },
  ), false);
});

test("Creators API discovery requests exact US identity with the stack127 tag", () => {
  assert.deepEqual(buildCreatorsApiSearchRequest({ model: "ZBDongle-E", vendor: "SONOFF" }), {
    itemCount: 10,
    itemPage: 1,
    keywords: "SONOFF ZBDongle-E",
    marketplace: "www.amazon.com",
    partnerTag: "stack127-20",
    resources: ["itemInfo.byLineInfo", "itemInfo.externalIds", "itemInfo.title"],
    searchIndex: "All",
  });
});

test("Creators API responses retain only identity evidence needed for review", () => {
  assert.deepEqual(normalizeCreatorsApiSearchResponse({
    searchResult: {
      items: [{
        asin: "B0B6P22YJC",
        detailPageURL: "https://www.amazon.com/dp/B0B6P22YJC?tag=stack127-20",
        itemInfo: {
          byLineInfo: { brand: { displayValue: "SONOFF" } },
          title: { displayValue: "SONOFF Zigbee Dongle Plus-E ZBDongle-E" },
        },
      }],
      searchURL: "https://www.amazon.com/s?k=SONOFF+ZBDongle-E&tag=stack127-20",
    },
  }), {
    results: [{ asin: "B0B6P22YJC", title: "SONOFF Zigbee Dongle Plus-E ZBDongle-E", url: "https://www.amazon.com/dp/B0B6P22YJC" }],
    search_url: "https://www.amazon.com/s?k=SONOFF+ZBDongle-E&tag=stack127-20",
  });
});

test("confirmed reviews require exact identity evidence", () => {
  const confirmed = {
    asin: "B0B6P22YJC",
    directory: "zigbee-coordinators",
    evidence: [
      {
        kind: "source-record",
        title: "SONOFF ZBDongle-E",
        url: "https://zigbee.blakadder.com/SONOFF_ZBDongle-E.html",
      },
      {
        kind: "search-result",
        title: "SONOFF Zigbee 3.0 USB Dongle Plus-E Gateway",
        url: "https://www.amazon.com/dp/B0B6P22YJC",
      },
    ],
    matched_identifiers: ["SONOFF", "ZBDongle-E"],
    marketplace: "US",
    record_slug: "sonoff-zbdongle-e",
    reviewed_at: "2026-09-05",
    status: "confirmed",
  };

  assert.deepEqual(validateAmazonReview(confirmed), []);
  assert.match(validateAmazonReview({ ...confirmed, matched_identifiers: ["SONOFF"] }).join(" "), /two matched identifiers/i);
  assert.match(validateAmazonReview({ ...confirmed, asin: undefined }).join(" "), /ASIN/i);
});

test("reviewed non-matches keep a reason and evidence without creating a link", () => {
  const review = {
    directory: "matter-devices",
    evidence: [
      {
        kind: "source-record",
        title: "Admin software component",
        url: "https://csa-iot.org/csa_product/example/",
      },
    ],
    marketplace: "US",
    reason: "The certification is software, not a retail hardware product.",
    record_slug: "example-software-component",
    reviewed_at: "2026-09-05",
    status: "not-retail",
  };

  assert.deepEqual(validateAmazonReview(review), []);
  assert.equal(getAmazonMatch(review), null);
});

test("every physical directory record has one explicit Amazon review state", async () => {
  const ledger = JSON.parse(await readFile(new URL("lib/amazon-affiliate/data/reviews.json", root), "utf8"));
  const expected = new Set();
  for (const [directory, path, key] of directoryFiles) {
    const snapshot = JSON.parse(await readFile(new URL(path, root), "utf8"));
    for (const record of snapshot[key]) expected.add(`${directory}/${record.slug}`);
  }

  const actual = new Set(ledger.reviews.map((review) => `${review.directory}/${review.record_slug}`));
  assert.equal(ledger.partner_tag, "stack127-20");
  assert.equal(ledger.marketplace, "US");
  assert.equal(ledger.reviews.length, expected.size);
  assert.equal(actual.size, expected.size);
  assert.deepEqual([...expected].filter((key) => !actual.has(key)), []);
  assert.equal(ledger.reviews.every((review) => validateAmazonReview(review).length === 0), true);
  assert.equal(
    ledger.reviews
      .filter((review) => review.status !== "confirmed")
      .every((review) => !review.asin),
    true,
  );
});

test("directory details show only confirmed sponsored Amazon links", async () => {
  const shared = await readFile(new URL("app/(site)/(directories)/_components/hardware-directory-browser.tsx", root), "utf8");
  const zigbee = await readFile(new URL("app/(site)/(directories)/zigbee-devices/zigbee-device-browser.tsx", root), "utf8");
  for (const source of [shared, zigbee]) {
    assert.match(source, /Check price on Amazon/);
    assert.match(source, /rel="sponsored noreferrer"/);
    assert.doesNotMatch(source, /Amazon price|Amazon rating|Amazon image/i);
  }
});
