// Rank the complete published catalogue before a caller filters by slug or host.
// A repository root is owner/repo after the hostname. GitLab also nests projects in
// subgroups, such as nodes/typescript/duniter. Other deeper links describe a file,
// directory, or other page inside somebody else's repository.
export const starRecipientCtes = `
  star_repository_urls as (
    select id, slug, name, popularity_basis, source_code_host,
      lower(regexp_replace(regexp_replace(
        split_part(split_part(btrim(source_code_url), '#', 1), '?', 1),
        '/+$', ''), '[.]git$', '', 'i')) as repository_key
    from public.self_host_apps where published = true
  ), star_repository_names as (
    select *, regexp_replace(lower(coalesce(name, slug)), '[^a-z0-9]', '', 'g') as app_name,
      regexp_replace(regexp_replace(repository_key, '^.*/', ''), '[^a-z0-9]', '', 'g') as repo_name
    from star_repository_urls
    where repository_key ~ '^https?://[^/]+/[^/]+/[^/]+$'
      or (source_code_host = 'gitlab'
        and repository_key ~ '^https?://[^/]+/[^/]+(/[^/]+)+$'
        and repository_key !~ '/(-|blob|tree|raw|issues|merge_requests|commits?|releases|wikis?)(/|$)')
  ), star_recipients as (
    select id from (
      select id, row_number() over (partition by repository_key order by
        coalesce('source_stars' = any(popularity_basis), false) desc,
        case when app_name = repo_name then 0
          when app_name <> '' and repo_name <> '' and
            (starts_with(app_name, repo_name) or starts_with(repo_name, app_name)) then 1
          when repo_name <> '' and position(repo_name in app_name) > 0 then 2
          else 3 end,
        length(btrim(coalesce(name, slug))), slug collate "C"
      ) as repository_rank
      from star_repository_names
    ) ranked where repository_rank = 1
  )`;
export const starRecipientColumn = 'exists (select 1 from star_recipients where star_recipients.id = app.id) as star_recipient';

// Original tiers: 20260829090000_make_self_host_apps_page_owned.sql.
export const starTiers = [[100000, 100], [50000, 95], [20000, 90], [10000, 85], [5000, 80], [1000, 70], [250, 60], [1, 50]];
export function starScore(stars) {
  return starTiers.find(([minimum]) => Number(stars) >= minimum)?.[1] ?? 0;
}

export function popularityPatch(row, stars, checkedAt) {
  // A missing host value is not evidence that a repository lost its stars.
  if (stars === null || stars === undefined) return {};
  const basis = row.popularity_basis ?? [];
  const catalogBasis = basis.filter(value => value !== 'source_stars' && !value.startsWith('catalog_score:'));
  const savedFloor = basis.find(value => /^catalog_score:\d+(?:\.\d+)?$/.test(value));
  const floor = savedFloor ? Number(savedFloor.split(':')[1])
    : catalogBasis.length ? Number(row.popularity_score ?? 0) : 0;
  const tier = starScore(stars);
  const score = Math.max(floor, tier);
  // Remember the catalog floor when stars overtake it, so later star losses
  // can lower the star component without erasing the catalog score.
  const nextBasis = floor > 0
    ? [...catalogBasis, `catalog_score:${floor}`, ...(tier > floor ? ['source_stars'] : [])]
    : tier > 0 ? ['source_stars'] : [];
  if (Number(row.popularity_score ?? 0) === score && JSON.stringify(basis) === JSON.stringify(nextBasis)) return {};
  return { popularity_score: score, popularity_basis: nextBasis, popularity_checked_at: checkedAt };
}

export function releasePatch(row, version, publishedAt, checkedAt) {
  if (String(row.release_version ?? '').trim() || !String(version ?? '').trim()) return {};
  return { release_version: version, release_published_at: publishedAt ?? null, release_checked_at: checkedAt };
}

export function storedFacts(row) {
  const github = row.source_code_host === 'github' || row.github_project_id || row.source_code_url?.startsWith('https://github.com/');
  return github ? {
    stars: row.project_stars ?? row.source_stars ?? row.github_stars,
    version: row.project_release ?? row.source_latest_release ?? row.github_latest_release,
    publishedAt: row.project_release_at ?? row.source_latest_release_at ?? row.github_latest_release_at,
  } : { stars: row.source_stars, version: row.source_latest_release, publishedAt: row.source_latest_release_at };
}

export function derivedPatch(row, facts, checkedAt) {
  return { ...(row.star_recipient === true ? popularityPatch(row, facts.stars, checkedAt) : {}), ...releasePatch(row, facts.version, facts.publishedAt, checkedAt) };
}
