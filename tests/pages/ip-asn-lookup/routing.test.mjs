import assert from "node:assert/strict";
import test from "node:test";
import { parseCymruAsnText, parseCymruOriginText } from "../../../lib/ip-asn/routing.ts";

test("parses a Team Cymru origin TXT record into routing context", () => {
  assert.deepEqual(parseCymruOriginText("1.1.1.1", "13335 | 1.1.1.0/24 | AU | - | CLOUDFLARENET"), {
    source: "Team Cymru",
    asn: 13335,
    prefix: "1.1.1.0/24",
    countryCode: "AU",
    networkName: "CLOUDFLARENET",
  });
});

test("rejects malformed origin data and keeps incomplete values unknown", () => {
  assert.equal(parseCymruOriginText("1.1.1.1", "not an origin"), null);
  assert.deepEqual(parseCymruOriginText("1.1.1.1", "13335 | | AU"), {
    source: "Team Cymru",
    asn: 13335,
    prefix: null,
    countryCode: "AU",
    networkName: null,
  });
});

test("parses the Team Cymru ASN description without making it a registry holder", () => {
  assert.equal(parseCymruAsnText("13335 | AU | apnic | 2010-07-14 | CLOUDFLARENET"), "CLOUDFLARENET");
  assert.equal(parseCymruAsnText("13335 | AU"), null);
});
