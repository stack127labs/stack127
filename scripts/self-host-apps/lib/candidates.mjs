import { slugify } from "./summary-rules.mjs";

const githubRepoPattern = /^github\.com\/([^/]+)\/([^/]+)$/i;

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
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const parts = url.pathname
      .split("/")
      .filter(Boolean)
      .map((part) => decodeURIComponent(part).replace(/\.git$/i, "").toLowerCase());

    if (["github.com", "codeberg.org"].includes(host) && parts.length >= 2) {
      return `${host}/${parts[0]}/${parts[1]}`;
    }
    if (host === "gitlab.com" && parts.length >= 2) {
      const separator = parts.indexOf("-");
      const repositoryParts = separator >= 2 ? parts.slice(0, separator) : parts;
      return `${host}/${repositoryParts.join("/")}`;
    }

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

export function absoluteUrl(value, baseUrl) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw || raw.startsWith("#") || raw.startsWith("mailto:")) return null;
  try {
    return new URL(raw, baseUrl).toString();
  } catch {
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  }
}

export function canonicalSourceCodeUrl(value) {
  const canonical = canonicalUrl(value);
  if (!canonical) return null;
  const match = canonical.match(githubRepoPattern);
  if (match) return `https://github.com/${match[1]}/${match[2]}`;
  if (canonical.startsWith("gitlab.com/") || canonical.startsWith("codeberg.org/")) return `https://${canonical}`;
  return null;
}

export function candidateSourceKey({ sourceUrl, sourceCodeUrl, websiteUrl, name }) {
  return canonicalUrl(sourceCodeUrl) ?? canonicalUrl(sourceUrl) ?? canonicalUrl(websiteUrl) ?? normalizeName(name);
}

function sourceCodeHost(value) {
  if (!value) return "unknown";
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    if (host === "github.com") return "github";
    if (host === "gitlab.com") return "gitlab";
    if (host === "codeberg.org") return "codeberg";
    return "other";
  } catch {
    return "unknown";
  }
}

export function scoreCandidate(candidate) {
  let score = 10;
  if (candidate.source_code_url) score += 35;
  if (candidate.website_url) score += 20;
  if (candidate.summary_raw) score += 15;
  if (candidate.docs_url) score += 5;
  if (candidate.docker_url) score += 5;
  if ((candidate.categories_raw ?? []).length > 0) score += 5;
  if ((candidate.surfaces_raw ?? []).length > 0) score += 5;
  return Math.min(score, 100);
}

export function normalizeCandidate(input, { source, sourceUrl, baseUrl } = {}) {
  const name = String(input.name ?? input.title ?? "").trim();
  if (!name) return null;

  const sourceCodeUrl = absoluteUrl(
    input.source_code_url ?? input.repository_url ?? input.repo_url ?? input.github_url ?? input.github ?? null,
    baseUrl,
  );
  const websiteUrl = absoluteUrl(input.website_url ?? input.homepage_url ?? input.homepage ?? input.website ?? input.url ?? null, baseUrl);
  const itemSourceUrl = absoluteUrl(input.source_url ?? input.page_url ?? input.url ?? sourceUrl ?? null, baseUrl);
  const docsUrl = absoluteUrl(input.docs_url ?? input.documentation_url ?? input.docs ?? null, baseUrl);
  const dockerUrl = absoluteUrl(input.docker_url ?? input.container_url ?? input.package_url ?? null, baseUrl);
  const slug = slugify(input.slug ?? name);
  const normalizedName = normalizeName(name);
  const sourceKey = String(input.source_key ?? candidateSourceKey({ sourceUrl: itemSourceUrl, sourceCodeUrl, websiteUrl, name }) ?? slug);

  const candidate = {
    source,
    source_key: sourceKey,
    source_url: itemSourceUrl,
    name,
    slug,
    summary_raw: input.summary ?? input.description ?? input.short_description ?? null,
    website_url: websiteUrl,
    source_code_url: sourceCodeUrl,
    source_code_host: input.source_code_host ?? sourceCodeHost(sourceCodeUrl),
    docs_url: docsUrl,
    docker_url: dockerUrl,
    self_hosting_status: input.self_hosting_status ?? "unknown",
    canonical_source_code_key: canonicalUrl(sourceCodeUrl),
    canonical_website_key: canonicalUrl(websiteUrl),
    normalized_name: normalizedName,
    categories_raw: Array.isArray(input.categories) ? input.categories.filter(Boolean).map(String) : [],
    surfaces_raw: Array.isArray(input.surfaces ?? input.platforms) ? (input.surfaces ?? input.platforms).filter(Boolean).map(String) : [],
    payload: input.payload ?? input,
  };

  return {
    ...candidate,
    confidence_score: Number.isFinite(Number(input.confidence_score)) ? Number(input.confidence_score) : scoreCandidate(candidate),
  };
}

export async function upsertCandidate(client, candidate) {
  const result = await client.query(
    `
      insert into public.self_host_app_candidates (
        source,
        source_key,
        source_url,
        name,
        slug,
        summary_raw,
        website_url,
        source_code_url,
        source_code_host,
        docs_url,
        docker_url,
        self_hosting_status,
        canonical_source_code_key,
        canonical_website_key,
        normalized_name,
        categories_raw,
        surfaces_raw,
        payload,
        confidence_score
      )
      values (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16::text[], $17::text[], $18::jsonb, $19
      )
      on conflict (source, source_key) do update set
        source_url = coalesce(excluded.source_url, self_host_app_candidates.source_url),
        name = excluded.name,
        slug = excluded.slug,
        summary_raw = coalesce(excluded.summary_raw, self_host_app_candidates.summary_raw),
        website_url = coalesce(excluded.website_url, self_host_app_candidates.website_url),
        source_code_url = coalesce(excluded.source_code_url, self_host_app_candidates.source_code_url),
        source_code_host = case
          when excluded.source_code_host <> 'unknown' then excluded.source_code_host
          else self_host_app_candidates.source_code_host
        end,
        docs_url = coalesce(excluded.docs_url, self_host_app_candidates.docs_url),
        docker_url = coalesce(excluded.docker_url, self_host_app_candidates.docker_url),
        self_hosting_status = case
          when excluded.self_hosting_status <> 'unknown' then excluded.self_hosting_status
          else self_host_app_candidates.self_hosting_status
        end,
        canonical_source_code_key = coalesce(excluded.canonical_source_code_key, self_host_app_candidates.canonical_source_code_key),
        canonical_website_key = coalesce(excluded.canonical_website_key, self_host_app_candidates.canonical_website_key),
        normalized_name = excluded.normalized_name,
        categories_raw = case
          when cardinality(excluded.categories_raw) > 0 then excluded.categories_raw
          else self_host_app_candidates.categories_raw
        end,
        surfaces_raw = case
          when cardinality(excluded.surfaces_raw) > 0 then excluded.surfaces_raw
          else self_host_app_candidates.surfaces_raw
        end,
        payload = excluded.payload,
        confidence_score = greatest(self_host_app_candidates.confidence_score, excluded.confidence_score),
        status = case
          when self_host_app_candidates.status in ('published', 'rejected', 'enriching') then self_host_app_candidates.status
          else 'new'
        end,
        duplicate_app_id = case
          when self_host_app_candidates.status = 'enriching' then self_host_app_candidates.duplicate_app_id
          else null
        end,
        duplicate_candidate_id = case
          when self_host_app_candidates.status = 'enriching' then self_host_app_candidates.duplicate_candidate_id
          else null
        end,
        duplicate_reason = case
          when self_host_app_candidates.status = 'enriching' then self_host_app_candidates.duplicate_reason
          else null
        end,
        last_seen_at = now(),
        updated_at = now()
      returning (xmax = 0) as inserted
    `,
    [
      candidate.source,
      candidate.source_key,
      candidate.source_url,
      candidate.name,
      candidate.slug,
      candidate.summary_raw,
      candidate.website_url,
      candidate.source_code_url,
      candidate.source_code_host,
      candidate.docs_url,
      candidate.docker_url,
      candidate.self_hosting_status,
      candidate.canonical_source_code_key,
      candidate.canonical_website_key,
      candidate.normalized_name,
      candidate.categories_raw,
      candidate.surfaces_raw,
      JSON.stringify(candidate.payload ?? {}),
      candidate.confidence_score,
    ],
  );

  return Boolean(result.rows[0]?.inserted);
}

export async function storeCandidates(client, candidates, { source, sourceUrl, notes } = {}) {
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const candidate of candidates) {
    try {
      if (await upsertCandidate(client, candidate)) inserted += 1;
      else updated += 1;
    } catch (error) {
      errors += 1;
      console.warn(`warning ${candidate.slug}: ${error.message}`);
    }
  }

  return { source, source_url: sourceUrl ?? null, notes: notes ?? null, discovered: candidates.length, inserted, updated, errors };
}
