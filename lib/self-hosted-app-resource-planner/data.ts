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

export async function getSelfHostedAppResourcePlannerCatalogue(): Promise<ResourcePlannerCatalogue> {
  const result = await getPool().query<PlannerRow>(`
    select
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
    from public.self_host_apps app
    left join public.self_host_app_resource_estimates resource on resource.app_id = app.id
    where app.published = true
      and app.self_hosting_status = 'self_hostable'
    order by app.name asc, app.slug asc
  `);

  const entries = result.rows.map((row): ResourcePlannerCatalogueEntry => ({
    slug: row.slug,
    name: row.name,
    ram: normalizeResourcePlannerRange(row.ram, "ram"),
    storage: normalizeResourcePlannerRange(row.storage, "storage"),
  }));
  return Object.fromEntries(entries.map((entry) => [entry.slug, entry]));
}
