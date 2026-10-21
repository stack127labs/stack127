import assert from "node:assert/strict";
import test from "node:test";
import { rebaseReviewedCorrections } from "../../../scripts/launch-directories/prepare-record-corrections.mjs";

const before = { cost_label: "Free; $49", evidence: { cost: { note: "Old checked price" } } };
const changes = { cost_label: "Free; $19 and $49", evidence: { cost: { note: "Corrected checked price" } } };
const review = [{ slug: "devhunt", expected_updated_at: "2026-10-20T00:00:00.000001Z", before, changes }];
const current = { slug: "devhunt", is_published: true, ...before, updated_at: "2026-10-21T00:00:00.123456Z", domain_rating: 50 };

test("facts imports may move versions while reviewed old fields remain guarded", () => {
  const [patch] = rebaseReviewedCorrections(review, [current]);
  assert.equal(patch.expected_updated_at, current.updated_at);
  assert.deepEqual(patch.changes, changes);
  assert.ok(!Object.hasOwn(patch.changes, "domain_rating"));
});

test("a changed price or evidence, a missing listing, and a partial review stop rebasing", () => {
  for (const rows of [[], [{ ...current, is_published: false }], [{ ...current, cost_label: "New editorial change" }],
    [{ ...current, evidence: { cost: { note: "Another check" } } }]]) assert.throws(() => rebaseReviewedCorrections(review, rows));
  assert.throws(() => rebaseReviewedCorrections([{ ...review[0], before: { cost_label: before.cost_label } }], [current]), /before/);
});

test("already-applied corrections remain safe for an idempotent updater run", () => {
  assert.deepEqual(rebaseReviewedCorrections(review, [{ ...current, ...changes }])[0].changes, changes);
});
