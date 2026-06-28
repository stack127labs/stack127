import { pool } from "./db";

export type ClientApp = {
  platform: string;
  url: string;
  official?: boolean;
};

export type AppCategory = {
  name: string;
  slug: string;
  icon_key: string | null;
};

export type AppSummary = {
  slug: string;
  name: string;
  description: string;
  icon_url: string | null;
  good_fit: string[];
  watch_outs: string[];
  supported_platforms: string[];
  deployment_methods: string[];
  docker_support: string | null;
  categories: AppCategory[];
};

export type DirectoryApp = AppSummary & {
  license: string | null;
  compose_support: boolean | null;
  requires_database: boolean | null;
  database_types: string[];
  ram_recommended_mb: number | null;
  backup_difficulty: string | null;
  backup_criticality: string | null;
  actively_maintained: boolean | null;
  maintenance_status: string | null;
  github_stars: number | null;
  github_latest_release: string | null;
  github_latest_release_at: Date | null;
  github_last_commit_at: Date | null;
  github_updated_at: Date | null;
  github_checked_at: Date | null;
  last_checked_at: Date | null;
  client_apps: ClientApp[];
};

const summaryColumns = `
  app.slug,
  app.name,
  app.description,
  app.icon_url,
  app.good_fit,
  app.watch_outs,
  app.supported_platforms,
  app.deployment_methods,
  app.docker_support,
  category_set.categories
`;

const categoryJoin = `
  left join lateral (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'name', category.name,
          'slug', category.slug,
          'icon_key', category.icon_key
        )
        order by category.name
      ),
      '[]'::jsonb
    ) as categories
    from public.self_host_app_categories app_category
    join public.categories category on category.id = app_category.category_id
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

export async function getDirectoryApps(): Promise<DirectoryApp[]> {
  const result = await pool.query<
    Omit<DirectoryApp, "categories" | "client_apps"> & {
      categories: unknown;
      client_apps: unknown;
    }
  >(
    `
      select
        ${summaryColumns},
        app.license,
        app.compose_support,
        app.requires_database,
        app.database_types,
        app.ram_recommended_mb,
        app.backup_difficulty,
        app.backup_criticality,
        app.actively_maintained,
        app.maintenance_status,
        app.github_stars,
        app.github_latest_release,
        app.github_latest_release_at,
        app.github_last_commit_at,
        app.github_updated_at,
        app.github_checked_at,
        app.last_checked_at,
        app.client_apps
      from public.self_host_apps app
      ${categoryJoin}
      where app.published = true
      order by app.name asc
    `,
  );

  return result.rows.map((app) => ({
    ...app,
    categories: normalizeCategories(app.categories),
    client_apps: normalizeJsonArray<ClientApp>(app.client_apps),
  }));
}
