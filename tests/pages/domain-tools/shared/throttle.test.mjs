import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  acquireEndpointSlot, reportEndpointResult, clearThrottleForTests,
  endpointStateForTests, THROTTLE_SETTINGS,
} from "../../../../lib/domain/throttle.ts";

beforeEach(() => clearThrottleForTests());

const A = "https://rdap.example-a.test/domain/x";
const B = "https://rdap.example-b.test/domain/x";

test("allows requests up to the per endpoint budget", () => {
  const now = 1_000_000;
  for (let i = 0; i < THROTTLE_SETTINGS.MAX_PER_WINDOW; i += 1) {
    assert.equal(acquireEndpointSlot(A, now).allowed, true, `request ${i} should be allowed`);
  }
  const denied = acquireEndpointSlot(A, now);
  assert.equal(denied.allowed, false);
  assert.equal(denied.reason, "budget_exhausted");
  assert.ok(denied.retryAfterSeconds > 0);
});

test("the budget is global, not per visitor", () => {
  // The failure the per visitor limiter cannot see: many different visitors each
  // making one perfectly reasonable request. There is no client key in this API
  // at all, so every caller draws from the same budget for that registry.
  const now = 1_000_000;
  for (let visitor = 0; visitor < THROTTLE_SETTINGS.MAX_PER_WINDOW; visitor += 1) {
    assert.equal(acquireEndpointSlot(A, now).allowed, true);
  }
  assert.equal(
    acquireEndpointSlot(A, now).allowed,
    false,
    "the next visitor is refused even though they have made no requests of their own",
  );
});

test("one endpoint being exhausted does not affect another", () => {
  const now = 1_000_000;
  for (let i = 0; i < THROTTLE_SETTINGS.MAX_PER_WINDOW; i += 1) acquireEndpointSlot(A, now);
  assert.equal(acquireEndpointSlot(A, now).allowed, false);
  assert.equal(acquireEndpointSlot(B, now).allowed, true, "a throttled registry must not block a different one");
});

test("the budget refills after the window", () => {
  const now = 1_000_000;
  for (let i = 0; i < THROTTLE_SETTINGS.MAX_PER_WINDOW; i += 1) acquireEndpointSlot(A, now);
  assert.equal(acquireEndpointSlot(A, now).allowed, false);
  assert.equal(acquireEndpointSlot(A, now + THROTTLE_SETTINGS.WINDOW_MS + 1).allowed, true);
});

test("repeated rejection opens the breaker", () => {
  const now = 1_000_000;
  for (let i = 0; i < THROTTLE_SETTINGS.BREAKER_THRESHOLD; i += 1) reportEndpointResult(A, 429, now);
  const decision = acquireEndpointSlot(A, now);
  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "circuit_open");
});

test("a 403 counts toward the breaker too", () => {
  const now = 1_000_000;
  for (let i = 0; i < THROTTLE_SETTINGS.BREAKER_THRESHOLD; i += 1) reportEndpointResult(A, 403, now);
  assert.equal(acquireEndpointSlot(A, now).reason, "circuit_open");
});

test("a success resets the rejection count", () => {
  const now = 1_000_000;
  reportEndpointResult(A, 429, now);
  reportEndpointResult(A, 429, now);
  reportEndpointResult(A, 200, now);
  reportEndpointResult(A, 429, now);
  assert.equal(acquireEndpointSlot(A, now).allowed, true, "the breaker should not have opened");
});

test("the breaker closes after the cooldown", () => {
  const now = 1_000_000;
  for (let i = 0; i < THROTTLE_SETTINGS.BREAKER_THRESHOLD; i += 1) reportEndpointResult(A, 429, now);
  assert.equal(acquireEndpointSlot(A, now).allowed, false);
  assert.equal(acquireEndpointSlot(A, now + THROTTLE_SETTINGS.BREAKER_COOLDOWN_MS + 1).allowed, true);
});

test("endpoints are keyed by host, not full URL", () => {
  const now = 1_000_000;
  acquireEndpointSlot("https://rdap.example-a.test/domain/one", now);
  acquireEndpointSlot("https://rdap.example-a.test/domain/two", now);
  assert.equal(endpointStateForTests(A).used, 2, "both paths share the registry's budget");
});
