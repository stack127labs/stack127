import assert from "node:assert/strict";
import { test } from "node:test";
import {
  filterHardwareRecords,
  getDirectoryPage,
  getDirectorySort,
  hardwareDirectoryPageHref,
  hardwareDirectoryPaginationPages,
  sortHardwareRecords,
} from "../../../../app/(site)/(directories)/_components/hardware-directory-filters.ts";

const records = [
  { added: "2026-01-01", category: "Sensors", features: ["Thread", "Battery"], model: "A1", name: "Alpha sensor", search_terms: ["contact"], vendor: "Acme" },
  { added: "2026-04-01", category: "Plugs", features: ["Wi-Fi"], model: "B2", name: "Beta plug", search_terms: ["energy"], vendor: "Beta" },
  { added: null, category: "Sensors", features: ["Thread"], model: "C3", name: "Gamma sensor", search_terms: [], vendor: "Acme" },
];

test("hardware directory filters combine exact facets and broad search", () => {
  assert.deepEqual(filterHardwareRecords(records, { category: "Sensors", feature: "Thread" }).map((record) => record.model), ["A1", "C3"]);
  assert.deepEqual(filterHardwareRecords(records, { q: "energy" }).map((record) => record.model), ["B2"]);
  assert.deepEqual(filterHardwareRecords(records, { vendor: "Acme", feature: ["Thread", "Battery"] }).map((record) => record.model), ["A1"]);
});

test("hardware directory sorting and pagination are deterministic", () => {
  assert.equal(getDirectorySort({ sort: "unknown" }), "name");
  assert.equal(getDirectoryPage({ page: "0" }), 1);
  assert.deepEqual(sortHardwareRecords(records, "newest").map((record) => record.model), ["B2", "A1", "C3"]);
  assert.deepEqual(hardwareDirectoryPaginationPages(5, 10), [1, null, 4, 5, 6, null, 10]);
  assert.equal(hardwareDirectoryPageHref("/matter-devices", { q: "plug", page: "7" }, 2), "/matter-devices?q=plug&page=2");
});
