import { request } from "./request.mjs";

export async function fetchText(url, { accept = "text/html,application/xhtml+xml" } = {}) {
  return request(url, { headers: {
    Accept: accept,
    "User-Agent": "stack127-self-host-app-discovery/1.0",
  } });
}

export async function mapConcurrent(values, concurrency, callback) {
  const results = new Array(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await callback(values[index], index);
    }
  }

  const workerCount = Math.max(1, Math.min(Number(concurrency) || 1, values.length || 1));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}
