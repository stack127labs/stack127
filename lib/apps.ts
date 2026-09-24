import { unstable_cache } from "next/cache";
import { getPool } from "./db";

export type AppCategory = {
  name: string;
  slug: string;
  icon_key: string | null;
};

export type DirectoryResourceEstimate = {
  estimate_min: number;
  estimate_max: number;
  unit: "mb" | "gb";
  estimate_kind: "derived" | "estimated";
  confidence: "high" | "medium" | "low";
  basis: string;
  source_urls: string[];
  note: string | null;
  checked_at: Date | string;
};

export type DirectoryInstallOption = {
  method: string;
  label: string;
  url: string;
  image: string | null;
  support_level: "official" | "community" | "third_party";
  source_url: string | null;
  note: string | null;
  sort_order: number;
};

export type DirectoryApp = {
  slug: string;
  name: string;
  summary: string;
  icon_url: string | null;
  icon_source_url: string | null;
  website_url: string | null;
  source_code_url: string | null;
  source_code_host: string;
  docs_url: string | null;
  install_docs_url: string | null;
  docker_url: string | null;
  license: string | null;
  license_type: string;
  license_spdx_id: string | null;
  source_model: "open_source" | "source_available" | "closed_source" | "unknown";
  publisher_name: string | null;
  publisher_type: string;
  publisher_url: string | null;
  pricing_model: "free" | "freemium" | "paid" | "subscription" | "usage_based" | "enterprise" | "unknown";
  self_hosting_status: "self_hostable" | "not_self_hostable" | "unknown";
  maintenance_status: string;
  github_owner: string | null;
  github_repo: string | null;
  github_stars: number | null;
  github_forks: number | null;
  github_primary_language: string | null;
  github_topics: string[];
  github_created_at: Date | null;
  github_pushed_at: Date | null;
  github_latest_release: string | null;
  github_latest_release_at: Date | null;
  github_last_commit_at: Date | null;
  github_checked_at: Date | null;
  docker_support: string;
  deployment_methods: string[];
  docker_image: string | null;
  compose_support: boolean | null;
  compose_url: string | null;
  requires_database: boolean | null;
  database_types: string[];
  ram_mb: number | null;
  ram_min_mb: number | null;
  ram_recommended_mb: number | null;
  ram_default_limit_mb: number | null;
  ram_researched: boolean;
  storage_profile: string;
  storage_min_gb: number | null;
  persistent_storage: boolean | null;
  storage_researched: boolean;
  database_researched: boolean;
  docker_researched: boolean;
  docker_image_researched: boolean;
  compose_researched: boolean;
  resource_requirement_kind: string;
  technical_facts_checked_at: Date | null;
  resource_estimates: Record<string, DirectoryResourceEstimate>;
  install_options: DirectoryInstallOption[];
  popularity_score: number;
  popularity_basis: string[];
  popularity_checked_at: Date | null;
  release_version: string | null;
  release_published_at: Date | null;
  release_checked_at: Date | null;
  release_url: string | null;
  surfaces: string[];
  summary_source: string;
  summary_confidence: string;
  categories: AppCategory[];
};

export type DirectoryAppIndex = Pick<
  DirectoryApp,
  | "slug"
  | "name"
  | "summary"
  | "icon_url"
  | "license"
  | "license_spdx_id"
  | "source_model"
  | "pricing_model"
  | "publisher_name"
  | "maintenance_status"
  | "release_published_at"
  | "github_last_commit_at"
  | "docker_support"
  | "compose_support"
  | "requires_database"
  | "ram_min_mb"
  | "ram_recommended_mb"
  | "ram_default_limit_mb"
  | "ram_researched"
  | "storage_profile"
  | "storage_min_gb"
  | "storage_researched"
  | "popularity_score"
  | "surfaces"
  | "categories"
> & {
  install_methods: string[];
  ram_estimate_min_mb: number | null;
  storage_estimate_min_gb: number | null;
};

export type SelfHostAppsStats = {
  appCount: number;
  categoryCount: number;
  dockerCount: number;
  activeCount: number;
};

export type DirectoryLicenseCount = {
  count: number;
  license: string | null;
  license_spdx_id: string | null;
};

const categoryJoin = `
  left join (
    select
      app_category.app_id,
      coalesce(
      jsonb_agg(
        jsonb_build_object(
          'name', category.name,
          'slug', category.slug,
          'icon_key', category.icon_key
        )
        order by category.sort_order, category.name
      ),
      '[]'::jsonb
    ) as categories
    from public.self_host_app_category_links app_category
    join public.self_host_app_categories category on category.id = app_category.category_id
    group by app_category.app_id
  ) category_set on category_set.app_id = app.id
`;

const resourceEstimateJoin = `
  left join lateral (
    select jsonb_strip_nulls(jsonb_build_object(
      'ram', case when estimate.ram_estimate_min_mb is not null then jsonb_build_object(
        'estimate_min', estimate.ram_estimate_min_mb,
        'estimate_max', estimate.ram_estimate_max_mb,
        'unit', 'mb',
        'estimate_kind', estimate.ram_estimate_kind,
        'confidence', estimate.ram_estimate_confidence,
        'basis', estimate.ram_estimate_basis,
        'source_urls', estimate.ram_source_urls,
        'note', estimate.ram_note,
        'checked_at', estimate.checked_at
      ) end,
      'storage', case when estimate.storage_estimate_min_gb is not null then jsonb_build_object(
        'estimate_min', estimate.storage_estimate_min_gb,
        'estimate_max', estimate.storage_estimate_max_gb,
        'unit', 'gb',
        'estimate_kind', estimate.storage_estimate_kind,
        'confidence', estimate.storage_estimate_confidence,
        'basis', estimate.storage_estimate_basis,
        'source_urls', estimate.storage_source_urls,
        'note', estimate.storage_note,
        'checked_at', estimate.checked_at
      ) end
    )) as resource_estimates
    from public.self_host_app_resource_estimates estimate
    where estimate.app_id = app.id
  ) resource_estimate_set on true
`;

const installOptionJoin = `
  left join lateral (
    select coalesce(option.options, '[]'::jsonb) as install_options
    from public.self_host_app_install_options option
    where option.app_id = app.id
  ) install_option_set on true
`;

function normalizeJsonArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeCategories(value: unknown): AppCategory[] {
  return normalizeJsonArray<AppCategory>(value).filter(
    (category) =>
      typeof category.name === "string" &&
      typeof category.slug === "string",
  );
}

function normalizeResourceEstimates(value: unknown): Record<string, DirectoryResourceEstimate> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const entries = Object.entries(value as Record<string, unknown>);
  const estimates: Record<string, DirectoryResourceEstimate> = {};

  for (const [resourceKind, rawEstimate] of entries) {
    if (!rawEstimate || typeof rawEstimate !== "object" || Array.isArray(rawEstimate)) {
      continue;
    }

    const estimate = rawEstimate as Record<string, unknown>;
    const unit = estimate.unit === "mb" || estimate.unit === "gb" ? estimate.unit : null;
    const estimateKind = estimate.estimate_kind === "derived" || estimate.estimate_kind === "estimated"
      ? estimate.estimate_kind
      : null;
    const confidence = estimate.confidence === "high" || estimate.confidence === "medium" || estimate.confidence === "low"
      ? estimate.confidence
      : null;
    const min = Number(estimate.estimate_min);
    const max = Number(estimate.estimate_max);

    if (
      !unit ||
      !estimateKind ||
      !confidence ||
      !Number.isFinite(min) ||
      !Number.isFinite(max) ||
      max < min ||
      typeof estimate.basis !== "string"
    ) {
      continue;
    }

    const sourceUrls = normalizeJsonArray<unknown>(estimate.source_urls)
      .filter((url): url is string => typeof url === "string" && /^https?:\/\//i.test(url));

    if (sourceUrls.length === 0) {
      continue;
    }

    estimates[resourceKind] = {
      estimate_min: min,
      estimate_max: max,
      unit,
      estimate_kind: estimateKind,
      confidence,
      basis: estimate.basis,
      source_urls: sourceUrls,
      note: typeof estimate.note === "string" ? estimate.note : null,
      checked_at: typeof estimate.checked_at === "string" || estimate.checked_at instanceof Date
        ? estimate.checked_at
        : "",
    };
  }

  return estimates;
}

function normalizeInstallOptions(value: unknown): DirectoryInstallOption[] {
  return normalizeJsonArray<Record<string, unknown>>(value)
    .filter((option) =>
      typeof option.method === "string" &&
      typeof option.label === "string" &&
      typeof option.url === "string" &&
      /^https?:\/\//i.test(option.url) &&
      (option.support_level === "official" || option.support_level === "community" || option.support_level === "third_party"),
    )
    .map((option) => ({
      method: option.method as string,
      label: option.label as string,
      url: option.url as string,
      image: typeof option.image === "string" ? option.image : null,
      support_level: option.support_level as DirectoryInstallOption["support_level"],
      source_url: typeof option.source_url === "string" ? option.source_url : null,
      note: typeof option.note === "string" ? option.note : null,
      sort_order: Number.isFinite(Number(option.sort_order)) ? Number(option.sort_order) : 0,
    }));
}

function normalizeStringArray(value: unknown): string[] {
  return normalizeJsonArray<unknown>(value).filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );
}

async function loadSelfHostAppsStats(): Promise<SelfHostAppsStats> {
  const result = await getPool().query<{
    active_count: number | string;
    app_count: number | string;
    category_count: number | string;
    docker_count: number | string;
  }>(
    `
      select
        count(*) filter (
          where app.published = true
            and app.self_hosting_status = 'self_hostable'
        ) as app_count,
        (
          select count(*)
          from public.self_host_app_categories category
          where exists (
            select 1
            from public.self_host_app_category_links app_category
            join public.self_host_apps joined_app on joined_app.id = app_category.app_id
            where app_category.category_id = category.id
              and joined_app.published = true
              and joined_app.self_hosting_status = 'self_hostable'
          )
        ) as category_count,
        count(*) filter (
          where app.published = true
            and app.self_hosting_status = 'self_hostable'
            and app.docker_support in ('official', 'community')
        ) as docker_count,
        count(*) filter (
          where app.published = true
            and app.self_hosting_status = 'self_hostable'
            and app.maintenance_status = 'active'
        ) as active_count
      from public.self_host_apps app
    `,
  );

  const row = result.rows[0];

  return {
    activeCount: Number(row?.active_count ?? 0),
    appCount: Number(row?.app_count ?? 0),
    categoryCount: Number(row?.category_count ?? 0),
    dockerCount: Number(row?.docker_count ?? 0),
  };
}

export const getSelfHostAppsStats = unstable_cache(loadSelfHostAppsStats, ["stack127-self-host-app-stats"], {
  revalidate: 60,
  tags: ["stack127-self-host-apps"],
});

export async function getSelfHostAppsModifiedAt(): Promise<Date | null> {
  const result = await getPool().query<{ modified_at: Date | string | null }>(
    `
      select greatest(
        coalesce(
          (
            select max(app.updated_at)
            from public.self_host_apps app
            where app.published = true
              and app.self_hosting_status = 'self_hostable'
          ),
          '1970-01-01'::timestamptz
        ),
        coalesce(
          (
            select max(category.updated_at)
            from public.self_host_app_categories category
            where exists (
              select 1
              from public.self_host_app_category_links app_category
              join public.self_host_apps app on app.id = app_category.app_id
              where app_category.category_id = category.id
                and app.published = true
                and app.self_hosting_status = 'self_hostable'
            )
          ),
          '1970-01-01'::timestamptz
        ),
        coalesce(
          (
            select max(app_category.created_at)
            from public.self_host_app_category_links app_category
            join public.self_host_apps app on app.id = app_category.app_id
            where app.published = true
              and app.self_hosting_status = 'self_hostable'
          ),
          '1970-01-01'::timestamptz
        ),
        coalesce(
          (
            select max(estimate.checked_at)
            from public.self_host_app_resource_estimates estimate
            join public.self_host_apps estimate_app on estimate_app.id = estimate.app_id
            where estimate_app.published = true
              and estimate_app.self_hosting_status = 'self_hostable'
          ),
          '1970-01-01'::timestamptz
        ),
        coalesce(
          (
            select max(option.checked_at)
            from public.self_host_app_install_options option
            join public.self_host_apps option_app on option_app.id = option.app_id
            where option_app.published = true
              and option_app.self_hosting_status = 'self_hostable'
          ),
          '1970-01-01'::timestamptz
        )
      ) as modified_at
    `,
  );

  const value = result.rows[0]?.modified_at;

  if (!value) {
    return null;
  }

  const date = new Date(value);

  return date.getUTCFullYear() === 1970 ? null : date;
}

const DIRECTORY_APP_INDEX_CACHE_TTL_MS = 60_000;
const DIRECTORY_APP_INDEX_BATCH_SIZE = 750;
let directoryAppIndexCache: { value: DirectoryAppIndex[]; expiresAt: number } | null = null;
let directoryAppIndexRequest: Promise<DirectoryAppIndex[]> | null = null;

type DirectoryAppIndexRow = Omit<DirectoryAppIndex, "categories" | "install_methods"> & {
  categories: unknown;
  install_methods: unknown;
};

async function loadDirectoryAppIndexBatch(
  limit: number,
  offset: number,
): Promise<DirectoryAppIndex[]> {
  const result = await getPool().query<DirectoryAppIndexRow>(
    `
      select
        app.slug,
        app.name,
        app.summary,
        app.icon_url,
        app.license,
        app.license_spdx_id,
        app.source_model,
        app.pricing_model,
        app.publisher_name,
        app.maintenance_status,
        app.release_published_at,
        coalesce(github_project.last_commit_at, app.source_last_commit_at, app.github_last_commit_at) as github_last_commit_at,
        app.docker_support,
        app.compose_support,
        app.requires_database,
        app.ram_min_mb,
        app.ram_recommended_mb,
        app.ram_default_limit_mb,
        coalesce(
          (app.technical_fact_status -> 'ram' ->> 'status') in ('published', 'not_published'),
          false
        ) as ram_researched,
        app.storage_profile,
        app.storage_min_gb::float8 as storage_min_gb,
        coalesce(
          (app.technical_fact_status -> 'storage' ->> 'status') in ('published', 'not_published'),
          false
        ) as storage_researched,
        app.popularity_score::float8 as popularity_score,
        app.surfaces,
        resource_estimate.ram_estimate_min_mb::float8 as ram_estimate_min_mb,
        resource_estimate.storage_estimate_min_gb::float8 as storage_estimate_min_gb,
        coalesce(
          array(
            select distinct install_method.value ->> 'method'
            from jsonb_array_elements(coalesce(install_option.options, '[]'::jsonb)) install_method(value)
            where install_method.value ->> 'method' is not null
            order by install_method.value ->> 'method'
          ),
          '{}'::text[]
        ) as install_methods,
        coalesce(category_set.categories, '[]'::jsonb) as categories
      from public.self_host_apps app
      left join public.github_projects github_project on github_project.id = app.github_project_id
      left join public.self_host_app_resource_estimates resource_estimate on resource_estimate.app_id = app.id
      left join public.self_host_app_install_options install_option on install_option.app_id = app.id
      left join lateral (
        select coalesce(
          jsonb_agg(
            jsonb_build_object(
              'name', category.name,
              'slug', category.slug,
              'icon_key', category.icon_key
            )
            order by category.sort_order, category.name
          ),
          '[]'::jsonb
        ) as categories
        from public.self_host_app_category_links app_category
        join public.self_host_app_categories category on category.id = app_category.category_id
        where app_category.app_id = app.id
      ) category_set on true
      where app.published = true
        and app.self_hosting_status = 'self_hostable'
      order by app.name asc, app.slug asc
      limit $1
      offset $2
    `,
    [limit, offset],
  );

  return result.rows.map((app) => ({
    ...app,
    categories: normalizeCategories(app.categories),
    install_methods: normalizeStringArray(app.install_methods),
  }));
}

async function loadDirectoryAppIndex(): Promise<DirectoryAppIndex[]> {
  const countResult = await getPool().query<{ app_count: number | string }>(
    `
      select count(*) as app_count
      from public.self_host_apps app
      where app.published = true
        and app.self_hosting_status = 'self_hostable'
    `,
  );
  const appCount = Number(countResult.rows[0]?.app_count ?? 0);
  const batchCount = Math.ceil(appCount / DIRECTORY_APP_INDEX_BATCH_SIZE);
  const batches = await Promise.all(
    Array.from({ length: batchCount }, (_, batchIndex) =>
      loadDirectoryAppIndexBatch(
        DIRECTORY_APP_INDEX_BATCH_SIZE,
        batchIndex * DIRECTORY_APP_INDEX_BATCH_SIZE,
      ),
    ),
  );

  return batches.flat();
}

export async function getDirectoryAppIndex(): Promise<DirectoryAppIndex[]> {
  const now = Date.now();
  if (directoryAppIndexCache && directoryAppIndexCache.expiresAt > now) {
    return directoryAppIndexCache.value;
  }

  if (!directoryAppIndexRequest) {
    directoryAppIndexRequest = loadDirectoryAppIndex()
      .then((value) => {
        directoryAppIndexCache = {
          value,
          expiresAt: Date.now() + DIRECTORY_APP_INDEX_CACHE_TTL_MS,
        };
        return value;
      })
      .finally(() => {
        directoryAppIndexRequest = null;
      });
  }

  return directoryAppIndexRequest;
}

async function loadDirectoryAppsBySlugs(slugs: string[]): Promise<DirectoryApp[]> {
  const result = await getPool().query<
    Omit<DirectoryApp, "categories"> & { categories: unknown }
  >(
    `
      select
        app.slug,
        app.name,
        app.summary,
        app.icon_url,
        app.icon_source_url,
        app.website_url,
        app.source_code_url,
        app.source_code_host,
        app.docs_url,
        app.install_docs_url,
        app.docker_url,
        app.license,
        app.license_type,
        app.license_spdx_id,
        app.source_model,
        app.publisher_name,
        app.publisher_type,
        app.publisher_url,
        app.pricing_model,
        app.self_hosting_status,
        app.maintenance_status,
        coalesce(github_project.owner, app.github_owner) as github_owner,
        coalesce(github_project.repo, app.github_repo) as github_repo,
        coalesce(github_project.stars, app.source_stars, app.github_stars) as github_stars,
        coalesce(github_project.forks, app.source_forks, app.github_forks) as github_forks,
        coalesce(github_project.primary_language, app.source_primary_language, app.github_primary_language) as github_primary_language,
        case
          when cardinality(coalesce(github_project.topics, '{}')) > 0 then github_project.topics
          when cardinality(app.source_topics) > 0 then app.source_topics
          else app.github_topics
        end as github_topics,
        coalesce(github_project.created_at, app.source_created_at, app.github_created_at) as github_created_at,
        coalesce(github_project.pushed_at, app.source_pushed_at, app.github_pushed_at) as github_pushed_at,
        coalesce(github_project.latest_release, app.source_latest_release, app.github_latest_release) as github_latest_release,
        coalesce(github_project.latest_release_at, app.source_latest_release_at, app.github_latest_release_at) as github_latest_release_at,
        coalesce(github_project.last_commit_at, app.source_last_commit_at, app.github_last_commit_at) as github_last_commit_at,
        coalesce(github_project.checked_at, app.source_checked_at, app.github_checked_at) as github_checked_at,
        app.docker_support,
        app.deployment_methods,
        app.docker_image,
        app.compose_support,
        app.compose_url,
        app.requires_database,
        app.database_types,
        app.ram_mb,
        app.ram_min_mb,
        app.ram_recommended_mb,
        app.ram_default_limit_mb,
        coalesce(
          (app.technical_fact_status -> 'ram' ->> 'status') in ('published', 'not_published'),
          false
        ) as ram_researched,
        app.storage_profile,
        app.storage_min_gb::float8 as storage_min_gb,
        app.persistent_storage,
        coalesce(
          (app.technical_fact_status -> 'storage' ->> 'status') in ('published', 'not_published'),
          false
        ) as storage_researched,
        coalesce(
          (app.technical_fact_status -> 'database' ->> 'status') in ('published', 'not_published'),
          false
        ) as database_researched,
        coalesce(
          (app.technical_fact_status -> 'docker' ->> 'status') in ('published', 'not_published'),
          false
        ) as docker_researched,
        coalesce(
          (app.technical_fact_status -> 'docker_image' ->> 'status') in ('published', 'not_published'),
          false
        ) as docker_image_researched,
        coalesce(
          (app.technical_fact_status -> 'compose' ->> 'status') in ('published', 'not_published'),
          false
        ) as compose_researched,
        app.resource_requirement_kind,
        app.technical_facts_checked_at,
        resource_estimate_set.resource_estimates,
        install_option_set.install_options,
        app.popularity_score,
        app.popularity_basis,
        app.popularity_checked_at,
        app.release_version,
        app.release_published_at,
        app.release_checked_at,
        app.release_url,
        app.surfaces,
        app.summary_source,
        app.summary_confidence,
        category_set.categories
      from public.self_host_apps app
      left join public.github_projects github_project on github_project.id = app.github_project_id
      ${categoryJoin}
      ${resourceEstimateJoin}
      ${installOptionJoin}
      where app.slug = any($1::text[])
        and app.published = true
        and app.self_hosting_status = 'self_hostable'
    `,
    [slugs],
  );

  return result.rows.map((app) => ({
    ...app,
    resource_estimates: normalizeResourceEstimates(app.resource_estimates),
    install_options: normalizeInstallOptions(app.install_options),
    categories: normalizeCategories(app.categories),
  }));
}

export async function getDirectoryAppsBySlugs(slugs: string[]): Promise<DirectoryApp[]> {
  if (slugs.length === 0) {
    return [];
  }

  const apps = await loadDirectoryAppsBySlugs(slugs);
  const appsBySlug = new Map(apps.map((app) => [app.slug, app]));

  return slugs
    .map((slug) => appsBySlug.get(slug))
    .filter((app): app is DirectoryApp => Boolean(app));
}

export async function getDirectoryLicenseCounts(): Promise<DirectoryLicenseCount[]> {
  const result = await getPool().query<{
    count: number | string;
    license: string | null;
    license_spdx_id: string | null;
  }>(
    `
      select
        app.license,
        app.license_spdx_id,
        count(*) as count
      from public.self_host_apps app
      where app.published = true
        and app.self_hosting_status = 'self_hostable'
      group by app.license, app.license_spdx_id
      order by count(*) desc
    `,
  );

  return result.rows.map((row) => ({
    count: Number(row.count),
    license: row.license,
    license_spdx_id: row.license_spdx_id,
  }));
}
