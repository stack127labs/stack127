// Keep related updates together so shared pages rebuild once. A catalog batch
// also refreshes tool sidebars, so it has a smaller event limit.
export function selectRevalidationBatch(events) {
  if (!events.length) return [];
  const type = events[0].entity_type;
  const limit = type === "page" ? 8 : 20;
  return events.filter(event => event.entity_type === type).slice(0, limit);
}

/** Keep invalidation, verified origin rebuilds, edge purge, and public warming in order. */
export async function refreshTargets(targets, { invalidate, rebuild, purge, warm }) {
  await invalidate(targets);
  const proofs = [];
  for (let index = 0; index < targets.verifyPaths.length; index += 4) {
    proofs.push(...await rebuild(targets.verifyPaths.slice(index, index + 4)));
  }
  await purge(targets.edgeTags);
  for (let index = 0; index < proofs.length; index += 4) await warm(proofs.slice(index, index + 4));
  return proofs;
}

export async function cacheBodyDigest(body) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}
