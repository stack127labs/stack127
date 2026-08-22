const repoHosts = new Set(["github.com", "gitlab.com", "codeberg.org", "git.sr.ht", "sourcehut.org"]);

export function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function normalizeName(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function canonicalUrl(value) {
  if (!value) return null;
  let raw = String(value).trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;

  try {
    const url = new URL(raw);
    url.hash = "";
    url.search = "";
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const parts = url.pathname
      .split("/")
      .filter(Boolean)
      .map((part) => decodeURIComponent(part).replace(/\.git$/i, "").toLowerCase());

    if (host === "github.com" && parts.length >= 2) {
      return `github.com/${parts[0]}/${parts[1]}`;
    }
    if ((host === "gitlab.com" || host === "codeberg.org") && parts.length >= 2) {
      return `${host}/${parts[0]}/${parts[1]}`;
    }
    if (parts.length === 0) return host;
    return `${host}/${parts.join("/")}`.replace(/\/$/, "");
  } catch {
    return String(value)
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\.git$/, "")
      .replace(/\/$/, "");
  }
}

export function canonicalRepoKey(value) {
  const canonical = canonicalUrl(value);
  if (!canonical) return null;
  const host = canonical.split("/")[0];
  if (!repoHosts.has(host)) return null;
  const parts = canonical.split("/");
  if (parts.length < 3) return null;
  return `${parts[0]}/${parts[1]}/${parts[2]}`;
}

export function canonicalWebsiteKey(value) {
  const canonical = canonicalUrl(value);
  return canonical ?? null;
}

/**
 * Deterministic dedupe key: repository identity wins, then website identity,
 * then the normalized name. The same app discovered by two sources lands on
 * the same key; every source row is preserved separately in the queue.
 */
export function dedupeKey({ repositoryUrl, websiteUrl, name }) {
  const repo = canonicalRepoKey(repositoryUrl);
  if (repo) return `repo:${repo}`;

  const website = canonicalWebsiteKey(websiteUrl);
  if (website) return `site:${website}`;

  return `name:${normalizeName(name)}`;
}

export function absoluteUrl(value, baseUrl) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw || raw.startsWith("#") || raw.startsWith("mailto:")) return null;
  try {
    return new URL(raw, baseUrl).toString();
  } catch {
    return /^https?:\/\//i.test(raw) ? raw : null;
  }
}

export function cleanText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function scoreCandidate(candidate) {
  let score = 10;
  if (candidate.repository_url) score += 30;
  else if (candidate.website_url) score += 15;
  if (candidate.summary_raw) score += 20;
  if (candidate.website_url) score += 10;
  if (candidate.docs_url) score += 5;
  if ((candidate.categories_raw ?? []).length > 0) score += 5;
  if ((candidate.platforms_raw ?? []).length > 0) score += 5;
  if ((candidate.install_methods_raw ?? []).length > 0) score += 5;
  if (typeof candidate.stars === "number" && candidate.stars > 0) score += 10;
  return Math.min(score, 100);
}

export function normalizeCandidate(input, { source, sourceType, sourceUrl } = {}) {
  const name = cleanText(input.name ?? input.title ?? input.package ?? input.id ?? "");
  if (!name) return null;

  const repositoryUrl = absoluteUrl(
    input.repository_url ?? input.repo_url ?? input.github_url ?? input.git ?? input.source_url ?? null,
  );
  const websiteUrl = absoluteUrl(
    input.website_url ?? input.homepage ?? input.homepage_url ?? input.website ?? input.url ?? null,
  );
  const docsUrl = absoluteUrl(input.docs_url ?? input.documentation_url ?? null);

  const candidate = {
    source,
    source_type: sourceType ?? "directory",
    source_key: String(input.source_key ?? sourceUrl ?? `${slugify(name)}`),
    source_url: absoluteUrl(input.source_url ?? sourceUrl ?? null),
    name,
    slug: slugify(input.slug ?? name),
    normalized_name: normalizeName(name),
    summary_raw: cleanText(input.summary ?? input.description ?? null) || null,
    website_url: websiteUrl,
    repository_url: repositoryUrl,
    docs_url: docsUrl,
    install_hint: input.install_hint ? String(input.install_hint).slice(0, 300) : null,
    license_raw: input.license ? String(input.license).slice(0, 120) : null,
    language_raw: input.language ? String(input.language).slice(0, 60) : null,
    stars: Number.isFinite(Number(input.stars)) && Number(input.stars) >= 0 ? Math.round(Number(input.stars)) : null,
    latest_version: input.latest_version ? String(input.latest_version).slice(0, 80) : null,
    latest_release_at: input.latest_release_at ?? null,
    categories_raw: Array.isArray(input.categories) ? input.categories.filter(Boolean).map(String).slice(0, 12) : [],
    platforms_raw: Array.isArray(input.platforms) ? input.platforms.filter(Boolean).map(String).slice(0, 12) : [],
    install_methods_raw: Array.isArray(input.install_methods)
      ? input.install_methods.filter(Boolean).map(String).slice(0, 12)
      : [],
    payload: input.payload ?? {},
  };

  candidate.canonical_repo_key = canonicalRepoKey(repositoryUrl);
  candidate.canonical_website_key = canonicalWebsiteKey(websiteUrl);
  candidate.dedupe_key = dedupeKey({
    repositoryUrl,
    websiteUrl,
    name,
  });
  candidate.confidence_score =
    Number.isFinite(Number(input.confidence_score))
      ? Math.max(0, Math.min(100, Math.round(Number(input.confidence_score))))
      : scoreCandidate(candidate);

  return candidate;
}
