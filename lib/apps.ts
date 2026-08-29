import { getPool } from "./db";

export type AppCategory = {
  name: string;
  slug: string;
  icon_key: string | null;
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
  storage_profile: string;
  storage_min_gb: number | null;
  resource_requirement_kind: string;
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

export async function getSelfHostAppsStats(): Promise<SelfHostAppsStats> {
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

export async function getDirectoryApps(): Promise<DirectoryApp[]> {
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
        app.github_owner,
        app.github_repo,
        coalesce(app.source_stars, app.github_stars) as github_stars,
        coalesce(app.source_forks, app.github_forks) as github_forks,
        coalesce(app.source_primary_language, app.github_primary_language) as github_primary_language,
        case
          when cardinality(app.source_topics) > 0 then app.source_topics
          else app.github_topics
        end as github_topics,
        coalesce(app.source_created_at, app.github_created_at) as github_created_at,
        coalesce(app.source_pushed_at, app.github_pushed_at) as github_pushed_at,
        coalesce(app.source_latest_release, app.github_latest_release) as github_latest_release,
        coalesce(app.source_latest_release_at, app.github_latest_release_at) as github_latest_release_at,
        coalesce(app.source_last_commit_at, app.github_last_commit_at) as github_last_commit_at,
        coalesce(app.source_checked_at, app.github_checked_at) as github_checked_at,
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
        app.storage_profile,
        app.storage_min_gb::float8 as storage_min_gb,
        app.resource_requirement_kind,
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
      ${categoryJoin}
      where app.published = true
        and app.self_hosting_status = 'self_hostable'
      order by app.name asc
    `,
  );

  return result.rows.map((app) => ({
    ...app,
    categories: normalizeCategories(app.categories),
  }));
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
