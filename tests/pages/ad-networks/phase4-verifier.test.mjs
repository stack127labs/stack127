import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { parseAdsTxt } from "../../../scripts/ad-networks/ads-txt.mjs";
import {
  fetchAdsTxt,
  fetchHomepage,
  isPublicAddress,
  safeFetch,
} from "../../../scripts/ad-networks/fetch-policy.mjs";
import { matchNetworks, needsHomepage } from "../../../scripts/ad-networks/matcher.mjs";
import { createLocalDiscoveryStore } from "../../../scripts/ad-networks/local-discovery-store.mjs";
import { openLocalDatabase } from "../../../scripts/ad-networks/local-db.mjs";
import {
  claimLocalPublishers,
  releaseLocalLease,
} from "../../../scripts/ad-networks/local-verifier-store.mjs";
import { nextCheckAt, relationshipAfterMiss } from "../../../scripts/ad-networks/verifier-store.mjs";

test("ads.txt parser keeps supported variables and unique seller records", () => {
  const parsed = parseAdsTxt(`\uFEFF# managed file\r
OWNERDOMAIN = Example.COM\r
MANAGERDOMAIN = MediaVine.com, us # regional manager\r
SUBDOMAIN=www.example.com\r
google.com, pub-123, DIRECT, f08c47fec0942fa0\r
google.com, pub-123, DIRECT, f08c47fec0942fa0\r
bad row\r
`);

  assert.deepEqual(parsed.ownerDomains.map((item) => item.value), ["example.com"]);
  assert.deepEqual(parsed.managerDomains.map(({ value, country }) => ({ value, country })), [
    { value: "mediavine.com", country: "US" },
  ]);
  assert.deepEqual(parsed.subdomains.map((item) => item.value), ["www.example.com"]);
  assert.equal(parsed.sellers.length, 1);
  assert.equal(parsed.sellers[0].relationship, "DIRECT");
  assert.equal(parsed.errors.length, 1);
});

test("manager domain confirms a relationship and a corroborated page signature identifies Journey", () => {
  const parsed = parseAdsTxt("MANAGERDOMAIN=mediavine.com\nmediavine.com, 123, DIRECT\n");
  const networks = [
    { id: 1, slug: "mediavine", manager_domains: ["mediavine.com"], ad_system_domains: ["mediavine.com"], program_signatures: [] },
    {
      id: 2,
      slug: "journey-by-mediavine",
      manager_domains: ["journeymv.com"],
      ad_system_domains: ["journeymv.com"],
      program_signatures: [{
        kind: "html_substring",
        value: "journeymv.com",
        requires_manager_domains: ["mediavine.com"],
        relationship_type: "active_network_use",
      }],
    },
  ];
  assert.equal(needsHomepage(parsed, networks), true);
  const matches = matchNetworks({
    parsed,
    networks,
    fetchEvidence: { checkedUrl: "https://example.com/ads.txt", finalUrl: "https://example.com/ads.txt", checkedAt: "2026-09-25T00:00:00Z", sha256: "abc" },
    homepage: {
      html: '<script src="https://scripts.journeymv.com/app.js"></script><script src="https://scripts.mediavine.com/app.js"></script>',
      finalUrl: "https://example.com/",
    },
    discoverySources: [],
  });
  assert.deepEqual(matches.confirmed.map((item) => item.slug).sort(), ["journey-by-mediavine", "mediavine"]);
  assert.equal(matches.confirmed.find((item) => item.slug === "mediavine").relationshipType, "primary_or_exclusive_manager");
  assert.equal(matches.confirmed.find((item) => item.slug === "journey-by-mediavine").relationshipType, "active_network_use");
});

test("AdSense requires the same publisher account in ads.txt and the live page", () => {
  const network = {
    id: 32,
    slug: "google-adsense",
    manager_domains: [],
    ad_system_domains: ["google.com"],
    program_signatures: [{
      kind: "adsense_account_match",
      ad_system: "google.com",
      seller_relationship: "DIRECT",
      seller_id_pattern: "^pub-\\d{16}$",
      relationship_type: "active_network_use",
      source_url: "https://support.google.com/adsense/answer/7584263?hl=en",
    }],
  };
  const parsed = parseAdsTxt("google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n");
  const base = {
    parsed,
    networks: [network],
    fetchEvidence: { checkedUrl: "https://example.com/ads.txt", checkedAt: "2026-09-28T00:00:00Z", sha256: "abc" },
    discoverySources: [{ source_key: "sellers-json:google-adsense" }],
  };

  assert.equal(needsHomepage(parsed, [network]), true);
  const matching = matchNetworks({
    ...base,
    homepage: {
      html: '<meta name="google-adsense-account" content="ca-pub-1234567890123456">',
      finalUrl: "https://example.com/",
    },
  });
  assert.equal(matching.confirmed[0].slug, "google-adsense");
  assert.equal(matching.confirmed[0].verificationMethod, "ads_txt_and_adsense_account");
  assert.equal(matching.review.length, 0);

  const mismatched = matchNetworks({
    ...base,
    homepage: {
      html: '<script data-ad-client="ca-pub-9999999999999999" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>',
      finalUrl: "https://example.com/",
    },
  });
  assert.equal(mismatched.confirmed.length, 0);
  assert.equal(mismatched.review.length, 0);
  assert.equal(matchNetworks({ ...base, homepage: null }).confirmed.length, 0);
  for(const container of ['template','textarea','style','noscript']) {
    for(const markup of ['<meta name="google-adsense-account" content="ca-pub-1234567890123456">',
      '<script data-ad-client="ca-pub-1234567890123456" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>']) {
      assert.equal(matchNetworks({...base,homepage:{html:`<${container}>${markup}</${container}>`}}).confirmed.length,0,container);
    }
  }
});

test("a network tag needs its required direct ads.txt system", () => {
  const network = {
    id: 33,
    slug: "taboola",
    manager_domains: ["taboola.com"],
    ad_system_domains: ["taboola.com"],
    program_signatures: [{
      kind: "html_substring",
      value: "cdn.taboola.com/libtrc/",
      requires_direct_ad_system_domains: ["taboola.com"],
      relationship_type: "active_network_use",
    }],
  };
  const direct = parseAdsTxt("taboola.com, publisher-1, DIRECT\n");
  const reseller = parseAdsTxt("taboola.com, publisher-1, RESELLER\n");
  const base = {
    networks: [network],
    fetchEvidence: { checkedUrl: "https://example.com/ads.txt", checkedAt: "2026-09-28T00:00:00Z", sha256: "abc" },
    homepage: { html: '<script src="https://cdn.taboola.com/libtrc/example/loader.js"></script>', finalUrl: "https://example.com/" },
    discoverySources: [{ source_key: "sellers-json:taboola" }],
  };

  assert.equal(needsHomepage(direct, [network], base.discoverySources), true);
  assert.equal(matchNetworks({ ...base, parsed: direct }).confirmed[0].slug, "taboola");
  assert.equal(needsHomepage(reseller, [network], base.discoverySources), false);
  assert.equal(matchNetworks({ ...base, parsed: reseller }).confirmed.length, 0);
});

test("a page-only network needs both its official discovery source and live tag", () => {
  const network = {
    id: 40,
    slug: "ethicalads",
    manager_domains: [],
    ad_system_domains: [],
    program_signatures: [{
      kind: "html_substring",
      value: "media.ethicalads.io/media/client/",
      requires_discovery_source: true,
      allow_without_ads_txt: true,
      relationship_type: "active_network_use",
    }],
  };
  const parsed = parseAdsTxt("");
  const homepage = {
    html: '<script src="https://media.ethicalads.io/media/client/ethicalads.min.js"></script>',
    finalUrl: "https://example.com/",
  };
  const fetchEvidence = { checkedUrl: "https://example.com/ads.txt", checkedAt: "2026-09-28T00:00:00Z", sha256: null };

  assert.equal(needsHomepage(parsed, [network], []), false);
  assert.equal(matchNetworks({ parsed, networks: [network], fetchEvidence, homepage, discoverySources: [] }).confirmed.length, 0);
  const discoverySources = [{ source_key: "official-publishers:ethicalads" }];
  assert.equal(needsHomepage(parsed, [network], discoverySources), true);
  const match = matchNetworks({ parsed, networks: [network], fetchEvidence, homepage, discoverySources }).confirmed[0];
  assert.equal(match.slug, "ethicalads");
  assert.equal(match.verificationMethod, "page_signature");
  for(const html of [`<p>media.ethicalads.io/media/client/ethicalads.min.js</p>`,
    `<template>${homepage.html}</template>`, `<script type="application/json">${JSON.stringify(homepage.html)}</script>`]) {
    assert.equal(matchNetworks({parsed,networks:[network],fetchEvidence,homepage:{html},discoverySources}).confirmed.length,0);
  }
  const withPublisher={...network,program_signatures:[{...network.program_signatures[0],value:'data-ea-publisher='}]};
  for(const [html,expected] of [['<div data-ea-publisher="publisher-id"></div>',1],
    ['<template><div data-ea-publisher="publisher-id"></div></template>',0],
    ['<p>data-ea-publisher=</p>',0]]) {
    assert.equal(matchNetworks({parsed,networks:[withPublisher],fetchEvidence,homepage:{html},discoverySources}).confirmed.length,expected);
  }
});

test("an ad-system row is review evidence only when discovery points to that network", () => {
  const parsed = parseAdsTxt("freestar.com, seller-1, DIRECT\n");
  const networks = [{
    id: 3,
    slug: "freestar",
    manager_domains: ["freestar.com"],
    ad_system_domains: ["freestar.com"],
    program_signatures: [],
  }];
  const base = {
    parsed,
    networks,
    fetchEvidence: { checkedUrl: "https://example.com/ads.txt", checkedAt: "2026-09-25T00:00:00Z", sha256: "abc" },
    homepage: null,
  };
  assert.equal(matchNetworks({ ...base, discoverySources: [] }).review.length, 0);
  const hinted = matchNetworks({ ...base, discoverySources: [{ source_key: "fathom:freestar" }] });
  assert.equal(hinted.confirmed.length, 0);
  assert.equal(hinted.review[0].slug, "freestar");
});

test("fetch policy rejects private addresses and a second outside-root redirect", async () => {
  assert.equal(isPublicAddress("127.0.0.1"), false);
  assert.equal(isPublicAddress("10.20.30.40"), false);
  assert.equal(isPublicAddress("8.8.8.8"), true);
  const responses = [
    new Response(null, { status: 302, headers: { location: "https://first.test/ads.txt" } }),
    new Response(null, { status: 302, headers: { location: "https://second.test/ads.txt" } }),
  ];
  await assert.rejects(
    safeFetch("https://example.com/ads.txt", {}, {
      lookup: async () => [{ address: "8.8.8.8", family: 4 }],
      fetch: async () => responses.shift(),
    }),
    /too_many_external_redirects/,
  );
});

test("publisher verification reads ads.txt and the homepage without requesting robots.txt", async () => {
  const requested = [];
  const dependencies = {
    lookup: async () => [{ address: "8.8.8.8", family: 4 }],
    fetch: async (url) => {
      requested.push(url.toString());
      if (url.pathname === "/ads.txt") {
        return new Response("MANAGERDOMAIN=mediavine.com\n", {
          status: 200,
          headers: { "content-type": "text/plain" },
        });
      }
      return new Response("<html><body>journeymv.com</body></html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      });
    },
  };

  assert.equal((await fetchAdsTxt("example.com", {}, dependencies)).outcome, "parsed");
  assert.match((await fetchHomepage("example.com", dependencies)).html, /journeymv\.com/);
  assert.deepEqual(requested, ["https://example.com/ads.txt", "https://example.com/"]);
});

test("relationship retirement requires repeated valid absence across time", () => {
  const first = relationshipAfterMiss({
    status: "confirmed", consecutive_misses: 0, first_missed_at: null,
    last_missed_at: null, ended_at: null,
  }, "2026-09-01T00:00:00Z");
  assert.equal(first.status, "confirmed");
  assert.equal(first.misses, 1);

  const second = relationshipAfterMiss({
    status: "confirmed", consecutive_misses: 1,
    first_missed_at: "2026-09-01T00:00:00Z",
    last_missed_at: "2026-09-01T00:00:00Z", ended_at: null,
  }, "2026-09-03T01:00:00Z");
  assert.equal(second.status, "stale");

  const third = relationshipAfterMiss({
    status: "stale", consecutive_misses: 2,
    first_missed_at: "2026-09-01T00:00:00Z",
    last_missed_at: "2026-09-03T01:00:00Z", ended_at: null,
  }, "2026-09-08T00:00:00Z");
  assert.equal(third.status, "ended");
  assert.equal(third.misses, 3);
});

test("retry schedule distinguishes transient errors from stable outcomes", () => {
  const now = new Date("2026-09-25T00:00:00Z");
  assert.equal(nextCheckAt("temporary_error", 0, now).toISOString(), "2026-09-25T06:00:00.000Z");
  assert.equal(nextCheckAt("temporary_error", 1, now).toISOString(), "2026-09-26T00:00:00.000Z");
  assert.equal(nextCheckAt("matched", 0, now).toISOString(), "2026-10-02T00:00:00.000Z");
  assert.equal(nextCheckAt("no_ads_txt", 0, now).toISOString(), "2026-10-25T00:00:00.000Z");
});

test("local queue deduplicates discovery and recovers an expired worker lease", () => {
  const directory = mkdtempSync(join(tmpdir(), "stack127-ad-network-test-"));
  const path = join(directory, "queue.sqlite");
  const database = openLocalDatabase(path);
  try {
    const store = createLocalDiscoveryStore(database);
    const seenAt = "2026-09-25T00:00:00.000Z";
    const source = { key: "sellers-json:concert", url: "https://concert.io/sellers.json", kind: "sellers-json" };
    assert.deepEqual(store.upsertBatch(source, [{ domain: "example.com", supplied: "Example.com" }], seenAt), {
      inserted: 1,
      newSightings: 0,
    });
    assert.deepEqual(store.upsertBatch(source, [{ domain: "example.com", supplied: "example.com" }], seenAt), {
      inserted: 0,
      newSightings: 0,
    });

    const firstClaim = claimLocalPublishers(database, { limit: 1, leaseMinutes: 10 });
    assert.equal(firstClaim.length, 1);
    assert.equal(claimLocalPublishers(database, { limit: 1, leaseMinutes: 10 }).length, 0);
    database.prepare("update publishers set lease_until = ? where id = ?")
      .run("2026-09-25T00:00:00.000Z", firstClaim[0].id);
    assert.equal(claimLocalPublishers(database, { limit: 1, leaseMinutes: 10 }).length, 1);
    releaseLocalLease(database, firstClaim[0].id);
  } finally {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("local identity catalog includes the expanded network roster and acquired aliases", () => {
  const directory = mkdtempSync(join(tmpdir(), "stack127-ad-network-identities-test-"));
  const database = openLocalDatabase(join(directory, "queue.sqlite"));
  try {
    assert.equal(database.prepare("select count(*) as count from ad_networks").get().count, 44);
    const aditude = JSON.parse(database.prepare("select manager_domains from ad_networks where slug = 'aditude'").get().manager_domains);
    const venatus = JSON.parse(database.prepare("select manager_domains from ad_networks where slug = 'venatus'").get().manager_domains);
    assert.deepEqual(aditude, ["aditude.com", "aditude.io"]);
    assert.deepEqual(venatus, ["venatus.com", "adinplay.com"]);
  } finally {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("an explicitly higher-priority candidate runs before a normal confirmed site", () => {
  const directory = mkdtempSync(join(tmpdir(), "stack127-ad-network-priority-test-"));
  const database = openLocalDatabase(join(directory, "queue.sqlite"));
  try {
    const store = createLocalDiscoveryStore(database);
    const seenAt = "2026-09-28T00:00:00.000Z";
    store.upsertBatch(
      { key: "sellers-json:concert", url: "https://concert.io/sellers.json", kind: "sellers-json" },
      [{ domain: "normal.example.com", supplied: "normal.example.com" }],
      seenAt,
    );
    store.upsertBatch(
      { key: "sellers-json:google-adsense", url: "https://realtimebidding.google.com/sellers.json", kind: "sellers-json", verificationPriority: 95 },
      [{ domain: "urgent.example.com", supplied: "urgent.example.com" }],
      seenAt,
    );
    const normal = database.prepare("select id from publishers where normalized_domain = 'normal.example.com'").get();
    const network = database.prepare("select id from ad_networks where slug = 'concert'").get();
    database.prepare(`
      insert into relationships (
        ad_network_id, publisher_id, status, relationship_type,
        verification_method, first_confirmed_at, last_confirmed_at,
        created_at, updated_at
      ) values (?, ?, 'confirmed', 'active_network_use', 'test', ?, ?, ?, ?)
    `).run(network.id, normal.id, seenAt, seenAt, seenAt, seenAt);

    const claimed = claimLocalPublishers(database, { limit: 1, leaseMinutes: 10 });
    assert.equal(claimed[0].normalized_domain, "urgent.example.com");
  } finally {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
