type Entry<T> = { value: Promise<T>; expires: number; tags: readonly string[] };
const shared = globalThis as typeof globalThis & { stack127BoundedCaches?: Map<string, Map<string, Entry<unknown>>> };
const stores: Map<string, Map<string, Entry<unknown>>> = shared.stack127BoundedCaches ??= new Map();

/** One app instance: bounded results, shared work, and immediate invalidation. */
export function boundedCache<T>(namespace: string, key: string, load: () => Promise<T>, tags: readonly string[], ttlMs = 900_000, limit = 500): Promise<T> {
  let store = stores.get(namespace);
  if (!store) { store = new Map(); stores.set(namespace, store); }
  const old = store.get(key);
  if (old && old.expires > Date.now()) {
    store.delete(key); store.set(key, old);
    return old.value as Promise<T>;
  }
  if (old) store.delete(key);
  const entry: Entry<T> = { value: Promise.resolve().then(load), expires: Date.now() + ttlMs, tags };
  store.set(key, entry);
  while (store.size > limit) store.delete(store.keys().next().value!);
  entry.value.catch(() => { if (store.get(key) === entry) store.delete(key); });
  return entry.value;
}

export function invalidateBoundedCaches(tags: readonly string[]) {
  const changed = new Set(tags);
  for (const store of stores.values()) for (const [key, entry] of store) {
    if (entry.tags.some(tag => changed.has(tag))) store.delete(key);
  }
}

export function filterCacheKey(params: Record<string, string | string[] | undefined>) {
  return JSON.stringify(Object.entries(params).filter(([, value]) => value !== undefined).sort(([a], [b]) => a.localeCompare(b)));
}

/** All normal numbered pages share one filtered index; only query variants use the 500-slot limit. */
export function directoryResultCache<T>(namespace: string, params: Record<string, string | string[] | undefined>, load: () => Promise<T>, tags: readonly string[]) {
  const filters = Object.entries(params).some(([key, value]) => key !== "page" && key !== "app" && Boolean(Array.isArray(value) ? value.length : value));
  return filters ? boundedCache(namespace, filterCacheKey(params), load, tags)
    : boundedCache(`${namespace}:numbered`, "all", load, tags, 86_400_000, 1);
}
