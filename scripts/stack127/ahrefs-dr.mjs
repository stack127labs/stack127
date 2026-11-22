import { setTimeout as sleep } from "node:timers/promises";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

// Both OVH jobs run as the same user and must pass this same host-wide file.
export const AHREFS_STATE_FILE = "/srv/stack127-data/state/ahrefs.sqlite";
export function ahrefsStateFile(environment) {
  return environment === "production" ? AHREFS_STATE_FILE : join(homedir(), ".local/state/stack127/ahrefs.sqlite");
}

/** Hold the request lock in a separate SQLite file so state writes can commit
 * immediately. Process death releases this lock without undoing committed state.
 * Poll SQLITE_BUSY asynchronously so abort signals and the run budget still work. */
async function withSharedState(file, signal, work) {
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  const lock = new DatabaseSync(`${file}.lock`);
  const deadline = Date.now() + 120000;
  try {
    for (;;) {
      signal?.throwIfAborted();
      try { lock.exec("begin immediate"); break; }
      catch (error) {
        if (error.errcode !== 5 || Date.now() >= deadline) throw error;
        await sleep(100, undefined, { signal });
      }
    }
    const db = new DatabaseSync(file);
    try {
      db.exec(`pragma synchronous=FULL;
        create table if not exists request_state (
          id integer primary key check(id=1), next_request_at integer not null, cooldown_until integer not null)`);
      const row = db.prepare("select * from request_state where id=1").get();
      const state = { nextRequestAt: row?.next_request_at ?? 0, cooldownUntil: row?.cooldown_until ?? 0 };
      const write = db.prepare(`insert into request_state values(1,?,?) on conflict(id) do update set
        next_request_at=excluded.next_request_at,cooldown_until=excluded.cooldown_until`);
      // No open state transaction: every run commits before control returns.
      const persist = () => write.run(state.nextRequestAt, state.cooldownUntil);
      return await work(state, persist);
    } finally { db.close(); }
  } finally { lock.close(); }
}

async function boundedText(response, maxBytes) {
  if (Number(response.headers.get("content-length")) > maxBytes) throw new Error("Response is too large");
  const chunks = [];
  let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.length;
    if (bytes > maxBytes) { await response.body.cancel().catch(() => {}); throw new Error("Response is too large"); }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function parseDomainRating(body) {
  const value = body?.domain_rating?.domain_rating;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) throw new Error("Invalid Ahrefs Domain Rating response");
  // The existing schema and UI use whole-number DR. Ahrefs returns a float.
  return Math.round(value);
}

export function retryDelay(header, attempt, now = Date.now()) {
  const seconds = header && /^\d+(?:\.\d+)?$/.test(header.trim()) ? Number(header) * 1000 : null;
  const date = header && seconds === null ? Date.parse(header) - now : null;
  return Math.max(30000 * 2 ** attempt, seconds ?? (Number.isFinite(date) ? date : 0));
}

/** All domains, retries and OVH jobs share one pacing and Retry-After clock. */
export function ahrefsRequester({ apiKey, fetchImplementation = fetch, sleepImplementation = sleep,
  now = Date.now, paceMs = 3000, maxRetries = 2, maxBackoffMs = 60000, signal, onRateLimit, stateFile } = {}) {
  if (!apiKey?.trim()) throw new Error("AHREFS_API_KEY is required");
  if (!Number.isFinite(paceMs) || paceMs < 3000) throw new Error("Ahrefs pacing must be at least 3000ms");
  const localState = { nextRequestAt: 0, cooldownUntil: 0 };
  const withState = work => stateFile ? withSharedState(stateFile, signal, work) : work(localState, () => {});
  let stopped = null;
  return async domain => {
    if (stopped) return { stopped };
    signal?.throwIfAborted();
    for (let attempt = 0; ; attempt++) {
      const result = await withState(async (state, persist) => {
        // Long cooldowns stop promptly instead of sleeping through a scheduled run.
        if (state.cooldownUntil - now() > maxBackoffMs) {
          onRateLimit?.({ retryAt: state.cooldownUntil });
          return { stopped: "rate_limited" };
        }
        const wait = Math.max(0, state.nextRequestAt - now(), state.cooldownUntil - now());
        if (wait) await sleepImplementation(wait, undefined, { signal });
        signal?.throwIfAborted();
        const url = new URL("https://api.ahrefs.com/v3/public/domain-rating-free");
        url.search = new URLSearchParams({ target: domain, version: "dr3", output: "json" });
        // Reserve the next slot before HTTP starts, even if this process dies
        // before receiving a response. Completion extends the same reservation.
        state.nextRequestAt = now() + paceMs;
        persist();
        let response;
        try {
          response = await fetchImplementation(url, { headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" }, signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(30000)]) : AbortSignal.timeout(30000), redirect: "error" });
        } catch {
          state.nextRequestAt = now() + paceMs;
          persist();
          signal?.throwIfAborted();
          return { error: "Ahrefs request failed" };
        }
        // Keep the lock until the body has been consumed/cancelled too.
        try {
          if (response.status === 429) {
            const delay = retryDelay(response.headers.get("retry-after"), attempt, now());
            state.cooldownUntil = now() + Math.max(paceMs, delay);
            // Commit before callbacks or body cleanup can throw, hang or die.
            persist();
            await response.body?.cancel().catch(() => {});
            onRateLimit?.({ retryAt: state.cooldownUntil });
            return attempt >= maxRetries || delay > maxBackoffMs ? { stopped: "rate_limited" } : { retry: true };
          }
          if (response.status === 401 || response.status === 403) {
            await response.body?.cancel().catch(() => {});
            return { stopped: "authentication_failed" };
          }
          if (!response.ok) { await response.body?.cancel().catch(() => {}); return { error: `Ahrefs HTTP ${response.status}` }; }
          try { return { value: parseDomainRating(JSON.parse(await boundedText(response, 64000))) }; }
          catch { signal?.throwIfAborted(); return { error: "Invalid Ahrefs response" }; }
        } finally {
          state.nextRequestAt = now() + paceMs;
          persist();
        }
      });
      if (result.retry) continue;
      if (result.stopped) stopped = result.stopped;
      return result;
    }
  };
}
