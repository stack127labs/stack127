import { canonicalUrl, normalizeName } from "./candidates.mjs";

function setFirst(map, key, value) {
  if (key && !map.has(key)) map.set(key, value);
}

export function buildProjectIndexes(projects) {
  const byRepo = new Map();
  const byWebsite = new Map();
  const byName = new Map();

  for (const project of projects) {
    setFirst(byRepo, canonicalUrl(project.source_code_url), project);
    setFirst(byWebsite, canonicalUrl(project.website_url), project);
    setFirst(byName, normalizeName(project.name), project);
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

export function classifyCandidate(candidate, projects, candidates) {
  const projectRepo = candidate.canonical_source_code_key
    ? projects.byRepo.get(candidate.canonical_source_code_key)
    : null;
  if (projectRepo) return { action: "duplicate", reason: "source_code_url", project: projectRepo };

  const projectWebsite = candidate.canonical_website_key
    ? projects.byWebsite.get(candidate.canonical_website_key)
    : null;
  if (projectWebsite) return { action: "duplicate", reason: "website_url", project: projectWebsite };

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

  const projectName = candidate.normalized_name
    ? projects.byName.get(candidate.normalized_name)
    : null;
  if (projectName) return { action: "review", reason: "name", project: projectName };

  const candidateName = otherCandidate(candidates.byName, candidate.normalized_name, candidate.id);
  if (candidateName) return { action: "review", reason: "name", candidate: candidateName };

  return { action: "queue" };
}
