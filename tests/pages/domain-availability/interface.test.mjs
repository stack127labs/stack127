import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  availabilityVerdict,
  filterAvailabilityNotes,
  registrationFacts,
  registrySourceMetadata,
} from "../../../app/(site)/(tools)/domain-availability/domain-availability-view.ts";

const root = process.cwd();
const routePath = path.join(root, "app/(site)/(tools)/domain-availability/domain-availability-tool.tsx");
const stylesPath = path.join(root, "app/(site)/(tools)/domain-availability/domain-availability-tool.module.css");
const source = readFileSync(routePath, "utf8");
const styles = existsSync(stylesPath) ? readFileSync(stylesPath, "utf8") : "";

function result(overrides = {}) {
  return {
    query: {
      input: "www.example.com",
      domain: "example.com",
      unicode: "example.com",
      tld: "com",
      suffix: "com",
      reduced: true,
      isIdn: false,
      guessedSuffix: false,
    },
    coverage: { source: "iana_bootstrap", operator: null, url: null, unknownTld: false },
    status: "registered",
    checkedAt: "2026-09-05T10:00:00.000Z",
    durationMs: 420,
    registrationDate: "2020-01-02T00:00:00.000Z",
    reregistrationDate: null,
    registryExpiryDate: "2029-08-20T00:00:00.000Z",
    registrarExpiryDate: null,
    lastChangedDate: null,
    transferDate: null,
    lockedDate: null,
    registryDatabaseUpdated: "2026-09-04T00:00:00.000Z",
    events: [],
    statuses: [{ rdap: "redemption period", epp: "redemptionPeriod", known: true }],
    nameservers: [],
    dnssecSigned: null,
    dsRecordCount: null,
    registrar: { name: "Example Registrar", ianaId: null, abuseEmail: null, abusePhone: null, url: null, rdapUrl: null },
    entities: [],
    redactions: [],
    redactionDeclared: false,
    registryFetch: {
      status: "registered",
      httpStatus: 200,
      url: "https://rdap.example/domain/example.com",
      source: "registry",
      body: { objectClassName: "domain" },
      error: null,
      fetchedAt: "2026-09-05T09:59:00.000Z",
      fromCache: true,
    },
    registrarFetch: null,
    notes: ["We looked up example.com, which is the registrable part of what you entered.", "Registrar data is partial."],
    ...overrides,
  };
}

test("availability verdicts keep no registration distinct from failure", () => {
  assert.deepEqual(availabilityVerdict(result()), {
    detail: "example.com has a current registry record.",
    value: "Registered",
  });

  const missing = availabilityVerdict(result({ status: "not_registered" }));
  assert.equal(missing.value, "No registration found");
  assert.match(missing.detail, /reserved, blocked, premium-priced, or newly released/);
  assert.doesNotMatch(missing.detail, /available/i);

  for (const status of ["no_service", "rate_limited", "blocked", "timeout", "registry_error"]) {
    const verdict = availabilityVerdict(result({ status }));
    assert.equal(verdict.value, "Cannot determine");
    assert.doesNotMatch(verdict.detail, /no registration found|available/i);
  }
});

test("registered facts include only contracted values and lifecycle states", () => {
  assert.deepEqual(registrationFacts(result()), [
    { label: "Registered", value: "2 January 2020" },
    { label: "Registry expiry", value: "20 August 2029" },
    { label: "Registrar", value: "Example Registrar" },
    { label: "Lifecycle", value: "Redemption period" },
  ]);
  assert.deepEqual(registrationFacts(result({ status: "not_registered" })), []);
});

test("source metadata and notes avoid repeated normalized input", () => {
  assert.deepEqual(registrySourceMetadata(result()), {
    cached: true,
    fetchedAt: "2026-09-05T09:59:00.000Z",
    host: "rdap.example",
    registryDatabaseUpdated: "2026-09-04T00:00:00.000Z",
  });
  assert.deepEqual(filterAvailabilityNotes(result()), ["Registrar data is partial."]);
});

test("availability checker uses one shared lead and omits sales and duplicate-result UI", () => {
  for (const component of ["ToolTextField", "ToolButton", "ToolStatus", "ToolPrimaryResult", "ToolKeyValueList", "ToolDisclosure", "ToolRawOutput"]) {
    assert.match(source, new RegExp(component));
  }
  assert.equal((source.match(/<ToolPrimaryResult/g) ?? []).length, 1);
  assert.match(source, /:\s*requestError\s*\?/);
  assert.match(source, /<AvailabilityLead detail=\{requestError\} value="Cannot determine"/);
  assert.match(source, /inFlightRef\.current/);
  assert.doesNotMatch(source, /ResultHeader|DomainFavicon|StatePill|DownloadReportButton|ToolDownloadAction|ToolTimeline|ToolProgressBar|ToolDataTable/);
  assert.doesNotMatch(source, /Buy now|registrar affiliate|suggested alternative/);
});

test("availability route styles contain long evidence and stack the primary action", () => {
  assert.match(styles, /\.workbench\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /\.results\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /\.evidence\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /@media\s*\(max-width:\s*640px\)/);
  assert.match(styles, /\.submit\s*\{[^}]*width:\s*100%/s);
});
