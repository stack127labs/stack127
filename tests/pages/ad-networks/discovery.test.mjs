import assert from "node:assert/strict";
import { test } from "node:test";
import { Readable } from "node:stream";
import {
  csvFields,
  normalizeDomain,
  publisherLinkDomains,
  robotsAllows,
  sellerDomains,
  sellerDomainsStream,
} from "../../../scripts/ad-networks/lib.mjs";
import { selectSources, sources } from "../../../scripts/ad-networks/sources.mjs";

test("normalizes publisher hosts and rejects invalid domain leads", () => {
  assert.equal(normalizeDomain("HTTPS://WWW.Example.COM/path"), "example.com");
  assert.equal(normalizeDomain("www.xn--bcher-kva.de"), "xn--bcher-kva.de");
  for (const input of ["", "localhost", "127.0.0.1", "foo..com", "a.-b.com", "bad host.com", "user@example.com", "*.example.com"]) {
    assert.equal(normalizeDomain(input), null, input);
  }
});

test("seller feeds provide candidate domains without intermediary-only records", () => {
  const leads = sellerDomains({ sellers: [
    { seller_type: "PUBLISHER", domain: "https://www.food.example.com/about" },
    { seller_type: "BOTH", domain: "example.org" },
    { seller_type: "INTERMEDIARY", domain: "exchange.example" },
    { seller_type: "PUBLISHER", domain: "not a domain" },
  ] });
  assert.deepEqual(leads.map((lead) => lead.domain), ["food.example.com", "example.org"]);
  assert.throws(() => sellerDomains({ invalid: true }), /no sellers array/);
});

test("large seller feeds can be parsed as a stream", async () => {
  const body = Readable.from([
    '{"version":"1.0","sell',
    'ers":[{"seller_id":"1","seller_type":"PUBLISHER","domain":"example.com"},',
    '{"seller_id":"2","seller_type":"INTERMEDIARY","domain":"exchange.example"},',
    '{"seller_id":"3","seller_type":"BOTH","domain":"www.example.org"}]}',
  ]);
  const domains = [];
  for await (const candidate of sellerDomainsStream(body)) domains.push(candidate.domain);
  assert.deepEqual(domains, ["example.com", "example.org"]);
});

test("Majestic CSV fields handle quotes and commas", () => {
  assert.deepEqual(csvFields('Rank,Domain,Note'), ["Rank", "Domain", "Note"]);
  assert.deepEqual(csvFields('1,example.com,"a,b"'), ["1", "example.com", "a,b"]);
});

test("official publisher lists keep external publisher domains and exclude site navigation", () => {
  const domains = publisherLinkDomains(`
    <a href="/publishers/">Publishers</a>
    <a href="https://www.ethicalads.io/about/">About</a>
    <a href="https://docs.example.com/start?ref=list&amp;type=publisher">Example docs</a>
    <a href="https://example.org/">Example</a>
  `, "https://www.ethicalads.io/publishers/list/");
  assert.deepEqual(domains.map((item) => item.domain), ["docs.example.com", "example.org"]);
});

test("robots rules honor explicit seller-file exceptions and broad bans", () => {
  assert.equal(robotsAllows("User-agent: *\nDisallow: /\nAllow: /sellers.json$", "/sellers.json"), true);
  assert.equal(robotsAllows("User-agent: *\nDisallow: /", "/sellers.json"), false);
  assert.equal(robotsAllows("User-agent: *\nDisallow: /\nUser-agent: stack127bot\nAllow: /sellers.json", "/sellers.json"), true);
  assert.equal(robotsAllows("User-agent: *\nDisallow: /*.json$", "/sellers.json"), false);
});

test("scheduled source selection excludes feeds with unresolved robots access", () => {
  assert.equal(sources.filter((source) => source.kind === "sellers-json").length, 39);
  assert.equal(selectSources().length, 30);
  assert.throws(() => selectSources(["adapex"]), /paused/);
  assert.throws(() => selectSources(["amazon-publisher-services"]), /paused/);
  assert.equal(selectSources(["concert"])[0].key, "sellers-json:concert");
  assert.equal(selectSources(["google-adsense"])[0].verificationPriority, 95);
  assert.equal(selectSources(["taboola"])[0].transport, "curl-file");
  assert.deepEqual(selectSources(["teads"]).map((source) => source.key).sort(), [
    "sellers-json:teads",
    "sellers-json:teads-outbrain",
  ]);
  assert.equal(selectSources(["ethicalads"])[0].kind, "publisher-list-html");
});
