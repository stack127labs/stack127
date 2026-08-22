const defaultUserAgent = "stack127-terminal-apps-discovery/1.0 (+https://stack127.com)";

export class HttpError extends Error {
  constructor(status, url, body) {
    super(`HTTP ${status}: ${url}`);
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Polite fetch: per-host rate limiting, retry with backoff on 429/5xx,
 * and a hard failure for other statuses so callers can record them.
 */
const hostState = new Map();

async function reserveSlot(host, minIntervalMs) {
  const state = hostState.get(host) ?? { lastAt: 0, queue: Promise.resolve() };
  const run = state.queue.then(async () => {
    const wait = state.lastAt + minIntervalMs - Date.now();
    if (wait > 0) await sleep(wait);
    state.lastAt = Date.now();
  });
  state.queue = run;
  hostState.set(host, state);
  await run;
}

export async function fetchText(url, {
  accept = "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
  userAgent = defaultUserAgent,
  headers = {},
  minIntervalMs = 250,
  retries = 3,
  timeoutMs = 30000,
} = {}) {
  const host = new URL(url).host;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    await reserveSlot(host, minIntervalMs);

    let response;
    try {
      response = await fetch(url, {
        headers: { Accept: accept, "User-Agent": userAgent, ...headers },
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      if (attempt === retries) throw error;
      await sleep(1000 * (attempt + 1));
      continue;
    }

    if (response.ok) {
      return response.text();
    }

    const body = await response.text().catch(() => "");

    if ((response.status === 429 || response.status >= 500) && attempt < retries) {
      const retryAfter = Number(response.headers.get("retry-after"));
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1500 * (attempt + 1));
      continue;
    }

    throw new HttpError(response.status, url, body.slice(0, 200));
  }

  throw new HttpError(599, url, "");
}

export async function fetchJson(url, options = {}) {
  const text = await fetchText(url, {
    accept: "application/json,text/*;q=0.9,*/*;q=0.5",
    ...options,
  });
  return JSON.parse(text);
}

export async function fetchBuffer(url, options = {}) {
  const host = new URL(url).host;
  await reserveSlot(host, options.minIntervalMs ?? 250);

  const response = await fetch(url, {
    headers: { "User-Agent": options.userAgent ?? defaultUserAgent, ...(options.headers ?? {}) },
    signal: AbortSignal.timeout(options.timeoutMs ?? 120000),
  });

  if (!response.ok) {
    throw new HttpError(response.status, url, "");
  }

  return Buffer.from(await response.arrayBuffer());
}

/** Map over values with bounded concurrency, preserving order. */
export async function mapConcurrent(values, concurrency, callback) {
  const results = new Array(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        results[index] = { ok: true, value: await callback(values[index], index) };
      } catch (error) {
        results[index] = { ok: false, error };
      }
    }
  }

  const workerCount = Math.max(1, Math.min(Number(concurrency) || 1, values.length || 1));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}
