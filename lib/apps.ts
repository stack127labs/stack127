import { pool } from "./db";

export type Screenshot = {
  url: string;
  type?: string;
  caption?: string;
  source?: string;
};

export type ClientApp = {
  platform: string;
  url: string;
  official?: boolean;
};

export type HardwareRecommendation = {
  type?: string;
  label: string;
  reason: string;
  affiliate_url?: string | null;
  image_url?: string | null;
  price_note?: string | null;
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
  category_name: string | null;
  category_slug: string | null;
};

export type DirectoryApp = AppSummary & {
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
  github_checked_at: Date | null;
  last_checked_at: Date | null;
  client_apps: ClientApp[];
};

export type AppDetail = AppSummary & {
  screenshots: Screenshot[];
  youtube_video_url: string | null;
  get_started: string | null;
  verdict: string | null;
  known_issues: string[];
  website_url: string | null;
  source_code_url: string | null;
  demo_url: string | null;
  docker_url: string | null;
  install_docs_url: string | null;
  docs_url: string | null;
  compose_support: boolean | null;
  requires_database: boolean | null;
  database_types: string[];
  requires_redis: boolean | null;
  requires_object_storage: boolean | null;
  ram_required_mb: number | null;
  ram_recommended_mb: number | null;
  storage_required_gb: string | null;
  storage_and_data_notes: string | null;
  cpu_notes: string | null;
  gpu_notes: string | null;
  backup_details: string | null;
  backup_difficulty: string | null;
  backup_criticality: string | null;
  raid_notes: string | null;
  actively_maintained: boolean | null;
  maintenance_status: string | null;
  github_owner: string | null;
  github_repo: string | null;
  github_stars: number | null;
  github_forks: number | null;
  github_open_issues: number | null;
  github_latest_release: string | null;
  github_latest_release_at: Date | null;
  github_last_commit_at: Date | null;
  github_commit_count_90d: number | null;
  github_release_count_90d: number | null;
  github_release_count: number | null;
  github_checked_at: Date | null;
  replaces_apps: string[];
  client_apps: ClientApp[];
  hardware_recommendations: HardwareRecommendation[];
  last_checked_at: Date | null;
  alternatives: AppSummary[];
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
  category.name as category_name,
  category.slug as category_slug
`;

function normalizeJsonArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export async function getPublishedApps(): Promise<AppSummary[]> {
  const result = await pool.query<AppSummary>(
    `
      select ${summaryColumns}
      from public.self_host_apps app
      left join public.categories category on category.id = app.category_id
      where app.published = true
      order by app.name asc
    `,
  );

  return result.rows;
}

export async function getDirectoryApps(): Promise<DirectoryApp[]> {
  const result = await pool.query<Omit<DirectoryApp, "client_apps"> & { client_apps: unknown }>(
    `
      select
        ${summaryColumns},
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
        app.github_checked_at,
        app.last_checked_at,
        app.client_apps
      from public.self_host_apps app
      left join public.categories category on category.id = app.category_id
      where app.published = true
      order by app.name asc
    `,
  );

  return result.rows.map((app) => ({
    ...app,
    client_apps: normalizeJsonArray<ClientApp>(app.client_apps),
  }));
}

export async function getAppBySlug(slug: string): Promise<AppDetail | null> {
  const result = await pool.query<Omit<AppDetail, "alternatives">>(
    `
      select
        ${summaryColumns},
        app.screenshots,
        app.youtube_video_url,
        app.get_started,
        app.verdict,
        app.known_issues,
        app.website_url,
        app.source_code_url,
        app.demo_url,
        app.docker_url,
        app.install_docs_url,
        app.docs_url,
        app.compose_support,
        app.requires_database,
        app.database_types,
        app.requires_redis,
        app.requires_object_storage,
        app.ram_required_mb,
        app.ram_recommended_mb,
        app.storage_required_gb,
        app.storage_and_data_notes,
        app.cpu_notes,
        app.gpu_notes,
        app.backup_details,
        app.backup_difficulty,
        app.backup_criticality,
        app.raid_notes,
        app.actively_maintained,
        app.maintenance_status,
        app.github_owner,
        app.github_repo,
        app.github_stars,
        app.github_forks,
        app.github_open_issues,
        app.github_latest_release,
        app.github_latest_release_at,
        app.github_last_commit_at,
        app.github_commit_count_90d,
        app.github_release_count_90d,
        app.github_release_count,
        app.github_checked_at,
        app.replaces_apps,
        app.client_apps,
        app.hardware_recommendations,
        app.last_checked_at,
        app.alternative_app_ids
      from public.self_host_apps app
      left join public.categories category on category.id = app.category_id
      where app.slug = $1
      limit 1
    `,
    [slug],
  );

  const app = result.rows[0];

  if (!app) {
    return null;
  }

  const alternativeIds = (app as unknown as { alternative_app_ids?: string[] })
    .alternative_app_ids;
  let alternatives: AppSummary[] = [];

  if (alternativeIds && alternativeIds.length > 0) {
    const alternativesResult = await pool.query<AppSummary>(
      `
        select ${summaryColumns}
        from public.self_host_apps app
        left join public.categories category on category.id = app.category_id
        where app.id = any($1::uuid[])
        order by app.name asc
      `,
      [alternativeIds],
    );

    alternatives = alternativesResult.rows;
  }

  return {
    ...app,
    screenshots: normalizeJsonArray<Screenshot>(app.screenshots),
    client_apps: normalizeJsonArray<ClientApp>(app.client_apps),
    hardware_recommendations: normalizeJsonArray<HardwareRecommendation>(
      app.hardware_recommendations,
    ),
    alternatives,
  };
}
