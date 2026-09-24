import { unstable_cache } from "next/cache";
import { getPool } from "@/lib/db";
import type {
  ResourcePlannerCatalogue,
  ResourcePlannerCatalogueEntry,
} from "./engine";
import { normalizeResourcePlannerRange, type RawResourcePlannerRange } from "./catalogue";

type PlannerRow = {
  slug: string;
  name: string;
  ram: RawResourcePlannerRange | null;
  storage: RawResourcePlannerRange | null;
};

export type ResourcePlannerAppSummary = {
  slug: string;
  name: string;
  hasRam: boolean;
  hasStorage: boolean;
};

async function loadSelfHostedAppResourcePlannerIndex(): Promise<ResourcePlannerAppSummary[]> {
  const result = await getPool().query<{
    slug: string;
    name: string;
    has_ram: boolean;
    has_storage: boolean;
  }>(`
    select app.slug, app.name,
      resource.ram_estimate_min_mb is not null as has_ram,
      resource.storage_estimate_min_gb is not null as has_storage
    from public.self_host_apps app
    left join public.self_host_app_resource_estimates resource on resource.app_id = app.id
    where app.published = true and app.self_hosting_status = 'self_hostable'
    order by app.name asc, app.slug asc
  `);
  return result.rows.map((row) => ({
    slug: row.slug, name: row.name, hasRam: row.has_ram, hasStorage: row.has_storage,
  }));
}

export const getSelfHostedAppResourcePlannerIndex = unstable_cache(loadSelfHostedAppResourcePlannerIndex, ["stack127-resource-planner-index"], {
  revalidate: 604800,
  tags: ["stack127-self-host-apps"],
});

const plannerFields = `
      app.slug,
      app.name,
      case when resource.ram_estimate_min_mb is not null then jsonb_build_object(
        'min', resource.ram_estimate_min_mb,
        'max', resource.ram_estimate_max_mb,
        'kind', resource.ram_estimate_kind,
        'confidence', resource.ram_estimate_confidence,
        'basis', resource.ram_estimate_basis,
        'source_urls', resource.ram_source_urls,
        'note', resource.ram_note,
        'checked_at', resource.checked_at
      ) end as ram,
      case when resource.storage_estimate_min_gb is not null then jsonb_build_object(
        'min', resource.storage_estimate_min_gb,
        'max', resource.storage_estimate_max_gb,
        'kind', resource.storage_estimate_kind,
        'confidence', resource.storage_estimate_confidence,
        'basis', resource.storage_estimate_basis,
        'source_urls', resource.storage_source_urls,
        'note', resource.storage_note,
        'checked_at', resource.checked_at
      ) end as storage
`;

function toCatalogueEntry(row: PlannerRow): ResourcePlannerCatalogueEntry {
  return {
    slug: row.slug,
    name: row.name,
    ram: normalizeResourcePlannerRange(row.ram, "ram"),
    storage: normalizeResourcePlannerRange(row.storage, "storage"),
  };
}

export async function getSelfHostedAppResourcePlannerEntry(slug: string): Promise<ResourcePlannerCatalogueEntry | null> {
  const result = await getPool().query<PlannerRow>(`
    select ${plannerFields}
    from public.self_host_apps app
    left join public.self_host_app_resource_estimates resource on resource.app_id = app.id
    where app.published = true and app.self_hosting_status = 'self_hostable' and app.slug = $1
    limit 1
  `, [slug]);
  return result.rows[0] ? toCatalogueEntry(result.rows[0]) : null;
}

export async function getSelfHostedAppResourcePlannerCatalogue(): Promise<ResourcePlannerCatalogue> {
  const result = await getPool().query<PlannerRow>(`
    select ${plannerFields}
    from public.self_host_apps app
    left join public.self_host_app_resource_estimates resource on resource.app_id = app.id
    where app.published = true
      and app.self_hosting_status = 'self_hostable'
    order by app.name asc, app.slug asc
  `);

  const entries = result.rows.map(toCatalogueEntry);
  return Object.fromEntries(entries.map((entry) => [entry.slug, entry]));
}
