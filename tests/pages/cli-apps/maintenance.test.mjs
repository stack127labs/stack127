import test from "node:test";
import assert from "node:assert/strict";
import { maintenanceFrom } from "../../../scripts/cli-apps/lib/maintenance.mjs";

const now = Date.parse("2026-11-02T00:00:00Z");
const daysAgo = days => new Date(now - days * 86_400_000).toISOString();

test("CLI maintenance uses the pipeline's push-age boundaries, missing data, and archive priority", () => {
  for (const [days, expected] of [[0, "active"], [109.99, "active"], [110, "slow"], [394.99, "slow"], [395, "stale"], [730, "stale"]]) {
    assert.equal(maintenanceFrom({ pushed_at: daysAgo(days) }, null, now), expected, `${days} days`);
  }
  assert.equal(maintenanceFrom(null, null, now), "unknown");
  assert.equal(maintenanceFrom({ pushed_at: "invalid" }, null, now), "unknown");
  assert.equal(maintenanceFrom({ archived: true, pushed_at: daysAgo(1) }, null, now), "archived");
  assert.equal(maintenanceFrom({ archived: true }, null, now), "archived");
});

test("curated CLI batches retain the existing explicit-override behavior", () => {
  assert.equal(maintenanceFrom({ archived: true }, "SLOW", now), "slow");
});
