import type { DirectoryApp } from "./apps";

export type DirectoryAppCardData = Pick<DirectoryApp,
  "slug" | "name" | "summary" | "icon_url" | "categories" | "maintenance_status" |
  "license" | "license_spdx_id" | "source_model" | "pricing_model" |
  "ram_min_mb" | "ram_recommended_mb" | "ram_default_limit_mb" | "ram_researched" |
  "storage_min_gb" | "storage_profile" | "storage_researched" |
  "release_published_at" | "github_last_commit_at"
> & {
  ram_estimate_min_mb: number | null;
  storage_estimate_min_gb: number | null;
  ram_estimated: boolean;
  storage_estimated: boolean;
};

export function directoryAppCard(app: DirectoryApp): DirectoryAppCardData {
  const ram = app.resource_estimates?.ram;
  const storage = app.resource_estimates?.storage;
  return {
    slug: app.slug,
    name: app.name,
    summary: app.summary,
    icon_url: app.icon_url,
    categories: app.categories,
    maintenance_status: app.maintenance_status,
    license: app.license,
    license_spdx_id: app.license_spdx_id,
    source_model: app.source_model,
    pricing_model: app.pricing_model,
    ram_min_mb: app.ram_min_mb,
    ram_recommended_mb: app.ram_recommended_mb,
    ram_default_limit_mb: app.ram_default_limit_mb,
    ram_researched: app.ram_researched,
    storage_min_gb: app.storage_min_gb,
    storage_profile: app.storage_profile,
    storage_researched: app.storage_researched,
    release_published_at: app.release_published_at,
    github_last_commit_at: app.github_last_commit_at,
    ram_estimate_min_mb: ram ? ram.estimate_min * (ram.unit === "gb" ? 1024 : 1) : null,
    storage_estimate_min_gb: storage?.estimate_min ?? null,
    ram_estimated: app.ram_min_mb === null && app.ram_recommended_mb === null && app.ram_default_limit_mb === null && Boolean(ram),
    storage_estimated: app.storage_min_gb === null && Boolean(storage),
  };
}
