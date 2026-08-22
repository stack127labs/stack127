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

export async function getTerminalApps(): Promise<TerminalApp[]> {
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
        app.latest_version,
        app.latest_release_at,
        app.stars,
        app.last_commit_at,
        app.maintenance_status,
        app.icon_url,
        app.screenshot_url,
        app.last_verified_at
      from public.terminal_apps app
      where app.published = true
      order by app.name asc
    `,
  );

  return result.rows;
}
