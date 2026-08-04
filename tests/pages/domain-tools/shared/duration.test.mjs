import assert from "node:assert/strict";
import test from "node:test";
import { humanDuration } from "../../../../lib/domain/duration.ts";

test("plain-language durations never roll over to twelve months", () => {
  assert.equal(humanDuration(364), "11 months");
  assert.equal(humanDuration(365), "1 year");
  assert.equal(humanDuration(11_313), "30 years, 11 months");
});

test("short durations remain easy to scan", () => {
  assert.equal(humanDuration(1), "1 day");
  assert.equal(humanDuration(12), "12 days");
  assert.equal(humanDuration(35), "5 weeks");
  assert.equal(humanDuration(61), "2 months");
});
