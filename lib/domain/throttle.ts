/**
 * Global, per registry endpoint throttling.
 *
 * The per-visitor limiter in lib/dns/rate-limit.ts stops one person hammering us.
 * It does nothing about many visitors each making one legitimate request in the
 * same minute, and the resource actually under pressure is our single outbound
 * address, not any one visitor's quota. Registries throttle by source IP, so a
 * block is a shared failure that takes every domain tool down at once.
 *
 * This is in-process state. It is correct for a single instance, which is what
 * the OVH deployment runs. If the app is ever scaled horizontally this needs to
 * move to Postgres or Redis, and that is a deliberate decision, not a detail.
 */

type EndpointState = {
  /** Requests started inside the current window. */
  used: number;
  windowStartedAt: number;
  /** Set when the breaker is open; no requests go out until this passes. */
  openUntil: number;
  consecutiveRejections: number;
};

const endpoints = new Map<string, EndpointState>();

const WINDOW_MS = 60_000;
/** Conservative. Registries do not publish their limits, so stay well under. */
const MAX_PER_WINDOW = 60;
const BREAKER_THRESHOLD = 3;
const BREAKER_COOLDOWN_MS = 5 * 60_000;
const MAX_ENDPOINTS = 500;

function keyFor(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function stateFor(key: string, now: number): EndpointState {
  let state = endpoints.get(key);
  if (!state) {
    if (endpoints.size >= MAX_ENDPOINTS) {
      for (const [existing, value] of endpoints) {
        if (value.openUntil <= now && now - value.windowStartedAt > WINDOW_MS) endpoints.delete(existing);
      }
    }
    state = { used: 0, windowStartedAt: now, openUntil: 0, consecutiveRejections: 0 };
    endpoints.set(key, state);
  }
  if (now - state.windowStartedAt >= WINDOW_MS) {
    state.used = 0;
    state.windowStartedAt = now;
  }
  return state;
}

export type ThrottleDecision =
  | { allowed: true }
  | { allowed: false; reason: "circuit_open" | "budget_exhausted"; retryAfterSeconds: number };

/** Ask whether one request may go out to this endpoint right now. */
export function acquireEndpointSlot(url: string, now = Date.now()): ThrottleDecision {
  const key = keyFor(url);
  const state = stateFor(key, now);

  if (state.openUntil > now) {
    return { allowed: false, reason: "circuit_open", retryAfterSeconds: Math.ceil((state.openUntil - now) / 1000) };
  }
  if (state.used >= MAX_PER_WINDOW) {
    const retry = Math.ceil((state.windowStartedAt + WINDOW_MS - now) / 1000);
    return { allowed: false, reason: "budget_exhausted", retryAfterSeconds: Math.max(1, retry) };
  }
  state.used += 1;
  return { allowed: true };
}

/** Report the outcome so the breaker can open on repeated rejection. */
export function reportEndpointResult(url: string, httpStatus: number | null, now = Date.now()) {
  const key = keyFor(url);
  const state = stateFor(key, now);
  if (httpStatus === 429 || httpStatus === 403) {
    state.consecutiveRejections += 1;
    if (state.consecutiveRejections >= BREAKER_THRESHOLD) {
      state.openUntil = now + BREAKER_COOLDOWN_MS;
      state.consecutiveRejections = 0;
    }
    return;
  }
  if (httpStatus !== null) state.consecutiveRejections = 0;
}

export function endpointStateForTests(url: string) {
  return endpoints.get(keyFor(url)) ?? null;
}

export function clearThrottleForTests() {
  endpoints.clear();
}

export const THROTTLE_SETTINGS = {
  WINDOW_MS,
  MAX_PER_WINDOW,
  BREAKER_THRESHOLD,
  BREAKER_COOLDOWN_MS,
};
