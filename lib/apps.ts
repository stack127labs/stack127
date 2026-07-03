import { pool } from "./db";

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
  repository_url: string | null;
  docs_url: string | null;
  install_docs_url: string | null;
  docker_url: string | null;
  license: string | null;
  publisher_name: string | null;
  publisher_type: string;
  publisher_url: string | null;
  maintenance_status: string;
  github_owner: string | null;
  github_repo: string | null;
  github_stars: number | null;
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
  platforms: string[];
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
    from public.self_host_apps_categories_join_table app_category
    join public.self_host_apps_categories category on category.id = app_category.category_id
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
  const result = await pool.query<{
    active_count: number | string;
    app_count: number | string;
    category_count: number | string;
    docker_count: number | string;
  }>(
    `
      select
        count(*) filter (where app.published = true) as app_count,
        (
          select count(*)
          from public.self_host_apps_categories category
          where exists (
            select 1
            from public.self_host_apps_categories_join_table app_category
            join public.self_host_apps joined_app on joined_app.id = app_category.app_id
            where app_category.category_id = category.id
              and joined_app.published = true
          )
        ) as category_count,
        count(*) filter (
          where app.published = true
            and app.docker_support = 'supported'
        ) as docker_count,
        count(*) filter (
          where app.published = true
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
  const result = await pool.query<{ modified_at: Date | string | null }>(
    `
      select greatest(
        coalesce(
          (
            select max(app.updated_at)
            from public.self_host_apps app
            where app.published = true
          ),
          '1970-01-01'::timestamptz
        ),
        coalesce(
          (
            select max(category.updated_at)
            from public.self_host_apps_categories category
            where exists (
              select 1
              from public.self_host_apps_categories_join_table app_category
              join public.self_host_apps app on app.id = app_category.app_id
              where app_category.category_id = category.id
                and app.published = true
            )
          ),
          '1970-01-01'::timestamptz
        ),
        coalesce(
          (
            select max(app_category.created_at)
            from public.self_host_apps_categories_join_table app_category
            join public.self_host_apps app on app.id = app_category.app_id
            where app.published = true
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
  const result = await pool.query<
    Omit<DirectoryApp, "categories"> & { categories: unknown }
  >(
    `
      select
        app.slug,
        app.name,
        app.summary,
        app.icon_url,
        app.website_url,
        app.repository_url,
        app.docs_url,
        app.install_docs_url,
        app.docker_url,
        app.license,
        app.publisher_name,
        app.publisher_type,
        app.publisher_url,
        app.maintenance_status,
        app.github_owner,
        app.github_repo,
        app.github_stars,
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
        app.platforms,
        app.summary_source,
        app.summary_confidence,
        category_set.categories
      from public.self_host_apps app
      ${categoryJoin}
      where app.published = true
      order by app.name asc
    `,
  );

  return result.rows.map((app) => ({
    ...app,
    categories: normalizeCategories(app.categories),
  }));
}
