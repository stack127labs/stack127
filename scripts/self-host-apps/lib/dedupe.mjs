import { canonicalUrl, normalizeName } from "./candidates.mjs";

function setFirst(map, key, value) {
  if (key && !map.has(key)) map.set(key, value);
}

export function buildAppIndexes(apps) {
  const byRepo = new Map();
  const byWebsite = new Map();
  const byName = new Map();

  for (const app of apps) {
    setFirst(byRepo, canonicalUrl(app.source_code_url), app);
    setFirst(byWebsite, canonicalUrl(app.website_url), app);
    setFirst(byName, normalizeName(app.name), app);
  }

  return { byRepo, byWebsite, byName };
}

export function buildCandidateIndexes(candidates) {
  const byRepo = new Map();
  const byWebsite = new Map();
  const byName = new Map();

  for (const candidate of candidates) {
    setFirst(byRepo, candidate.canonical_source_code_key, candidate);
    setFirst(byWebsite, candidate.canonical_website_key, candidate);
    setFirst(byName, candidate.normalized_name, candidate);
  }

  return { byRepo, byWebsite, byName };
}

function otherCandidate(map, key, candidateId) {
  const match = key ? map.get(key) : null;
  return match?.id !== candidateId ? match : null;
}

export function classifyCandidate(candidate, apps, candidates) {
  const appRepo = candidate.canonical_source_code_key
    ? apps.byRepo.get(candidate.canonical_source_code_key)
    : null;
  if (appRepo) return { action: "duplicate", reason: "source_code_url", app: appRepo };

  const appWebsite = candidate.canonical_website_key
    ? apps.byWebsite.get(candidate.canonical_website_key)
    : null;
  if (appWebsite) return { action: "duplicate", reason: "website_url", app: appWebsite };

  const candidateRepo = otherCandidate(
    candidates.byRepo,
    candidate.canonical_source_code_key,
    candidate.id,
  );
  if (candidateRepo) return { action: "duplicate", reason: "source_code_url", candidate: candidateRepo };

  const candidateWebsite = otherCandidate(
    candidates.byWebsite,
    candidate.canonical_website_key,
    candidate.id,
  );
  if (candidateWebsite) return { action: "duplicate", reason: "website_url", candidate: candidateWebsite };

  const appName = candidate.normalized_name
    ? apps.byName.get(candidate.normalized_name)
    : null;
  if (appName) return { action: "review", reason: "name", app: appName };

  const candidateName = otherCandidate(candidates.byName, candidate.normalized_name, candidate.id);
  if (candidateName) return { action: "review", reason: "name", candidate: candidateName };

  return { action: "queue" };
}
