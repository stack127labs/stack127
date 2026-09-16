import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DEFAULT_RESOURCE_PLANNER_INPUT,
  calculateSelfHostedResourcePlan,
  formatResourcePlannerRange,
} from "../../../lib/self-hosted-app-resource-planner/engine.ts";
import { normalizeResourcePlannerRange } from "../../../lib/self-hosted-app-resource-planner/catalogue.ts";

const catalogue = {
  vaultwarden: {
    slug: "vaultwarden",
    name: "Vaultwarden",
    ram: { minMb: 256, maxMb: 512, kind: "estimated", confidence: "medium", basis: "small private instance", sourceUrls: ["https://example.com/vaultwarden"], note: null, checkedAt: "2026-09-10" },
    storage: { minGb: 1, maxGb: 2, kind: "estimated", confidence: "medium", basis: "small private instance", sourceUrls: ["https://example.com/vaultwarden"], note: null, checkedAt: "2026-09-10" },
  },
  immich: {
    slug: "immich",
    name: "Immich",
    ram: { minMb: 2048, maxMb: 6144, kind: "estimated", confidence: "low", basis: "photo library with machine learning", sourceUrls: ["https://example.com/immich"], note: null, checkedAt: "2026-09-10" },
    storage: null,
  },
  unknown: {
    slug: "unknown",
    name: "Unknown app",
    ram: null,
    storage: null,
  },
};

function input(overrides = {}) {
  return {
    ...DEFAULT_RESOURCE_PLANNER_INPUT,
    rows: [{
      id: "row-1",
      kind: "curated",
      appSlug: "vaultwarden",
      name: "Vaultwarden",
      quantity: "1",
      ramMinGiB: "",
      ramMaxGiB: "",
      storageMinGb: "",
      storageMaxGb: "",
    }],
    ramBudgetGiB: "8",
    storageBudgetGb: "100",
    ...overrides,
  };
}

function valid(overrides = {}) {
  const result = calculateSelfHostedResourcePlan(input(overrides), catalogue);
  assert.equal(result.status, "valid", JSON.stringify(result.issues));
  assert.ok(result.values);
  return result.values;
}

test("FF-001 calculates a complete known row against the reserved host budget", () => {
  const result = valid();
  assert.equal(result.ram.knownMinMb, 256);
  assert.equal(result.ram.knownMaxMb, 512);
  assert.equal(result.ram.availableMb, 6553.6);
  assert.equal(result.storage.knownMinGb, 1);
  assert.equal(result.storage.knownMaxGb, 2);
  assert.equal(result.storage.availableGb, 80);
  assert.equal(result.ram.fit, "within");
  assert.equal(result.storage.fit, "within");
  assert.equal(result.bindingResource, "ram");
});

test("FF-002 multiplies quantities before summing and finds the binding dimension", () => {
  const result = valid({
    rows: [
      { ...input().rows[0], id: "a", quantity: "2" },
      { ...input().rows[0], id: "b", quantity: "3" },
    ],
    ramBudgetGiB: "2",
    storageBudgetGb: "10",
    headroomPercent: "0",
  });
  assert.equal(result.ram.knownMinMb, 1280);
  assert.equal(result.ram.knownMaxMb, 2560);
  assert.equal(result.storage.knownMinGb, 5);
  assert.equal(result.storage.knownMaxGb, 10);
  assert.equal(result.ram.fit, "tight");
  assert.equal(result.storage.fit, "within");
  assert.equal(result.bindingResource, "ram");
});

test("FF-003 uses exact within, tight, and over boundaries", () => {
  const row = { ...input().rows[0], kind: "custom", appSlug: "", name: "Custom", ramMinGiB: "4", ramMaxGiB: "6", storageMinGb: "1", storageMaxGb: "2" };
  const within = valid({ rows: [row], ramBudgetGiB: "8", storageBudgetGb: "10", headroomPercent: "20" });
  assert.equal(within.ram.fit, "within");
  const tight = valid({ rows: [{ ...row, ramMaxGiB: "7" }], ramBudgetGiB: "8", storageBudgetGb: "10", headroomPercent: "20" });
  assert.equal(tight.ram.fit, "tight");
  const over = valid({ rows: [{ ...row, ramMinGiB: "7", ramMaxGiB: "8" }], ramBudgetGiB: "8", storageBudgetGb: "10", headroomPercent: "20" });
  assert.equal(over.ram.fit, "over");
});

test("FF-004 keeps unknown dimensions partial without treating them as zero", () => {
  const result = valid({
    rows: [input().rows[0], { ...input().rows[0], id: "unknown", appSlug: "immich", name: "Immich" }],
  });
  assert.equal(result.ram.fit, "tight");
  assert.equal(result.storage.fit, "unknown");
  assert.deepEqual(result.storage.unknownRows, [{ id: "unknown", name: "Immich", quantity: 1 }]);
  assert.equal(result.storage.knownMinGb, 1);
  assert.equal(result.storage.knownMaxGb, 2);
  assert.equal(result.bindingResource, "ram");
});

test("FF-005 retains fractional RAM precision before display rounding", () => {
  const result = valid({
    rows: [{ ...input().rows[0], kind: "custom", appSlug: "", name: "Small custom service", quantity: "3", ramMinGiB: "0.05", ramMaxGiB: "0.15", storageMinGb: "1", storageMaxGb: "1" }],
    ramBudgetGiB: "1",
    storageBudgetGb: "10",
    headroomPercent: "0",
  });
  assert.equal(result.ram.knownMinMb, 153.6);
  assert.equal(result.ram.knownMaxMb, 460.8);
  assert.equal(formatResourcePlannerRange(result.ram, "ram"), "0.2 GiB to 0.5 GiB");
});

test("FF-006 rejects a reversed custom range and returns no values", () => {
  const result = calculateSelfHostedResourcePlan(input({
    rows: [{ ...input().rows[0], kind: "custom", appSlug: "", name: "Custom", ramMinGiB: "2", ramMaxGiB: "1" }],
  }), catalogue);
  assert.equal(result.status, "invalid");
  assert.equal(result.values, null);
  assert.ok(result.issues.some((issue) => issue.field.includes("ramMaxGiB")));
});

test("validates grammar and inclusive numeric boundaries without plausible fallback values", () => {
  for (const candidate of [
    input({ rows: [] }),
    input({ headroomPercent: "-1" }),
    input({ headroomPercent: "81" }),
    input({ rows: [{ ...input().rows[0], quantity: "0" }] }),
    input({ rows: [{ ...input().rows[0], quantity: "1.5" }] }),
    input({ ramBudgetGiB: "1,5" }),
    input({ storageBudgetGb: "1e3" }),
    input({ ramBudgetGiB: "" }),
  ]) {
    const result = calculateSelfHostedResourcePlan(candidate, catalogue);
    assert.equal(result.status, "invalid");
    assert.equal(result.values, null);
  }
});

test("keeps a custom row with no bounds as unknown", () => {
  const result = valid({
    rows: [{ ...input().rows[0], kind: "custom", appSlug: "", name: "My private service", ramMinGiB: "", ramMaxGiB: "", storageMinGb: "", storageMaxGb: "" }],
  });
  assert.equal(result.ram.fit, "unknown");
  assert.equal(result.storage.fit, "unknown");
  assert.deepEqual(result.ram.unknownRows, [{ id: "row-1", name: "My private service", quantity: 1 }]);
  assert.equal(formatResourcePlannerRange(result.ram, "ram"), "Unknown");
  assert.equal(formatResourcePlannerRange(result.storage, "storage"), "Unknown");
});

test("labels partial ranges as known subtotals", () => {
  const result = valid({
    rows: [input().rows[0], { ...input().rows[0], id: "unknown", appSlug: "unknown", name: "Unknown app" }],
  });
  assert.equal(formatResourcePlannerRange(result.ram, "ram"), "Known subtotal: 0.3 GiB to 0.5 GiB");
  assert.equal(formatResourcePlannerRange(result.storage, "storage"), "Known subtotal: 1.0 GB to 2.0 GB");
});

test("catalogue normalization accepts the full 4096 GiB RAM range and preserves notes", () => {
  const normalized = normalizeResourcePlannerRange({
    min: 4_000_000,
    max: 4_194_304,
    kind: "estimated",
    confidence: "low",
    basis: "large reviewed workload",
    source_urls: ["https://example.test/source"],
    note: "Measured with optional workers enabled.",
    checked_at: "2026-09-10",
  }, "ram");
  assert.equal(normalized?.minMb, 4_000_000);
  assert.equal(normalized?.maxMb, 4_194_304);
  assert.equal(normalized?.note, "Measured with optional workers enabled.");
  assert.equal(normalizeResourcePlannerRange({ ...normalized, min: 4_194_305, max: 4_194_305, source_urls: normalized?.sourceUrls }, "ram"), null);
});

test("is deterministic and pure for a large valid plan", () => {
  const candidate = input({
    rows: Array.from({ length: 50 }, (_, index) => ({ ...input().rows[0], id: `row-${index}`, quantity: "99" })),
  });
  const first = calculateSelfHostedResourcePlan(candidate, catalogue);
  const second = calculateSelfHostedResourcePlan(candidate, catalogue);
  assert.deepEqual(second, first);
  const source = readFileSync(new URL("../../../lib/self-hosted-app-resource-planner/engine.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /react|fetch\(|navigator\.|document\.|window\.|localStorage|sessionStorage/i);
});
