import { unstable_cache } from "next/cache";
import { getPool } from "./db";
import {
  isValidTerminalCategory,
  terminalAppCategories,
  terminalAppCategoryBySlug,
  terminalAppTypeLabels,
  terminalAppTypes,
  type TerminalAppType,
} from "./terminal-app-taxonomy";

export {
  isValidTerminalCategory,
  terminalAppCategories,
  terminalAppCategoryBySlug,
  terminalAppTypeLabels,
  terminalAppTypes,
};
export type { TerminalAppType } from "./terminal-app-taxonomy";

export type TerminalApp = {
  slug: string;
  name: string;
  aliases: string[];
  summary: string;
  primary_type: TerminalAppType;
  additional_types: string[];
  categories: string[];
  platforms: string[];
  language: string | null;
  install_methods: string[];
  website_url: string | null;
  docs_url: string | null;
  repository_url: string | null;
  source_model: "open_source" | "source_available" | "closed_source" | "freeware" | "unknown";
  pricing_model: "free" | "freemium" | "paid" | "subscription" | "usage_based" | "unknown";
  license: string | null;
  latest_version: string | null;
  latest_release_at: Date | null;
  stars: number | null;
  last_commit_at: Date | null;
  maintenance_status: "active" | "slow" | "stale" | "archived" | "unknown";
  icon_url: string | null;
  screenshot_url: string | null;
  last_verified_at: Date | null;
};

async function loadTerminalApps(): Promise<TerminalApp[]> {
  const result = await getPool().query<TerminalApp>(
    `
      select
        app.slug,
        app.name,
        app.aliases,
        app.summary,
        app.primary_type,
        app.additional_types,
        app.categories,
        app.platforms,
        app.language,
        app.install_methods,
        app.website_url,
        app.docs_url,
        app.repository_url,
        app.source_model,
        app.pricing_model,
        app.license,
        coalesce(app.latest_version, github.latest_release) as latest_version,
        coalesce(app.latest_release_at, github.latest_release_at) as latest_release_at,
        coalesce(github.stars, app.stars) as stars,
        coalesce(github.last_commit_at, app.last_commit_at) as last_commit_at,
        case when github.archived then 'archived' else coalesce(app.maintenance_status, 'unknown') end as maintenance_status,
        app.icon_url,
        app.screenshot_url,
        app.last_verified_at
      from public.terminal_apps app
      left join public.github_projects github on github.id = app.github_project_id
      where app.published = true
      order by app.name asc
    `,
  );

  return result.rows;
}

export const getTerminalApps = unstable_cache(loadTerminalApps, ["stack127-terminal-apps"], {
  revalidate: 604800,
  tags: ["stack127-terminal-apps"],
});
