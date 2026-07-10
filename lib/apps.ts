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
  website_url: string | null;
  source_code_url: string | null;
  source_code_host: string;
  docs_url: string | null;
  install_docs_url: string | null;
  docker_url: string | null;
  license: string | null;
  license_type: string;
  license_spdx_id: string | null;
  publisher_name: string | null;
  publisher_type: string;
  publisher_url: string | null;
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
  compose_support: boolean | null;
  requires_database: boolean | null;
  database_types: string[];
  ram_mb: number | null;
  storage_profile: string;
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
    from public.open_project_categories_join_table app_category
    join public.open_project_categories category on category.id = app_category.category_id
    where app_category.project_id = app.id
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
          from public.open_project_categories category
          where exists (
            select 1
            from public.open_project_categories_join_table app_category
            join public.open_projects joined_app on joined_app.id = app_category.project_id
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
      from public.open_projects app
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
            from public.open_projects app
            where app.published = true
              and app.self_hosting_status = 'self_hostable'
          ),
          '1970-01-01'::timestamptz
        ),
        coalesce(
          (
            select max(category.updated_at)
            from public.open_project_categories category
            where exists (
              select 1
              from public.open_project_categories_join_table app_category
              join public.open_projects app on app.id = app_category.project_id
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
            from public.open_project_categories_join_table app_category
            join public.open_projects app on app.id = app_category.project_id
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
        app.website_url,
        app.source_code_url,
        app.source_code_host,
        app.docs_url,
        app.install_docs_url,
        app.docker_url,
        app.license,
        app.license_type,
        app.license_spdx_id,
        app.publisher_name,
        app.publisher_type,
        app.publisher_url,
        app.self_hosting_status,
        app.maintenance_status,
        app.github_owner,
        app.github_repo,
        app.github_stars,
        app.github_forks,
        app.github_primary_language,
        app.github_topics,
        app.github_created_at,
        app.github_pushed_at,
        app.github_latest_release,
        app.github_latest_release_at,
        app.github_last_commit_at,
        app.github_checked_at,
        app.docker_support,
        app.compose_support,
        app.requires_database,
        app.database_types,
        app.ram_mb,
        app.storage_profile,
        app.surfaces,
        app.summary_source,
        app.summary_confidence,
        category_set.categories
      from public.open_projects app
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
