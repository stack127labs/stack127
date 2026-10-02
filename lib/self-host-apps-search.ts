import type { DirectoryApp, DirectoryAppIndex } from "./apps";
import { directoryAppCard, type DirectoryAppCardData } from "./apps-card.ts";
import { findDirectoryLicenseId, licenses } from "./software-licenses.ts";

export const SELF_HOST_APPS_PAGE_SIZE = 24;
export const selfHostAppsSorts = ["popular", "name", "lowest-ram", "healthy"] as const;
const ramTiers = ["under 1gb", "1-2gb", "2-4gb", "4gb+"];
const storageTiers = ["tiny", "low", "medium", "high", "depends"];
const installMethods = [
  ["docker", "Docker image"], ["compose", "Docker Compose"], ["truenas_scale", "TrueNAS SCALE"],
  ["umbrel", "Umbrel"], ["unraid", "Unraid"], ["yunohost", "YunoHost"], ["casaos", "CasaOS"],
  ["runtipi", "Runtipi"], ["cosmos", "Cosmos"], ["openmediavault", "openmediavault"],
  ["synology", "Synology"], ["qnap", "QNAP"], ["proxmox", "Proxmox"],
  ["home_assistant_os", "Home Assistant OS"], ["kubernetes", "Kubernetes"], ["helm", "Helm"],
  ["native", "Native"], ["binary", "Binary"], ["package", "System package"],
];
const multiValues: Record<string, readonly string[]> = {
  license: licenses.map(license => license.id),
  source: ["open_source", "source_available", "closed_source", "unknown"],
  docker: ["supported"],
  install: installMethods.map(([value]) => value),
  maintenance: ["active", "slow", "stale", "archived", "unknown"],
  signal: ["mobile", "database", "compose"],
};
const queryKeys = new Set(["q", "sort", "page", "app", "category", "ram", "storage", ...Object.keys(multiValues)]);

export type SelfHostAppsSearchParams = {
  q: string;
  sort: typeof selfHostAppsSorts[number];
  page: number;
  app: string;
  category: string[];
  license: string[];
  source: string[];
  docker: string[];
  install: string[];
  ram: string;
  storage: string;
  maintenance: string[];
  signal: string[];
};

export type SelfHostAppsFacetOption = { value: string; label: string; count?: number; iconKey?: string | null };
export type SelfHostAppsSearchFacets = {
  categories: SelfHostAppsFacetOption[];
  licenses: SelfHostAppsFacetOption[];
  installMethods: SelfHostAppsFacetOption[];
};
export type SelfHostAppsSearchResponse = {
  apps: DirectoryAppCardData[];
  detailApps: DirectoryApp[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  facets: SelfHostAppsSearchFacets;
};

export class SelfHostAppsSearchInputError extends Error {}

export function parseSelfHostAppsSearchParams(params: URLSearchParams): SelfHostAppsSearchParams {
  if (params.size > 100 || params.toString().length > 8_192) {
    throw new SelfHostAppsSearchInputError("Too many search parameters.");
  }
  for (const key of params.keys()) {
    if (!queryKeys.has(key)) throw new SelfHostAppsSearchInputError(`Unknown parameter: ${key}.`);
  }
  const single = (key: string, allowed?: readonly string[]) => {
    const values = params.getAll(key);
    if (values.length > 1) throw new SelfHostAppsSearchInputError(`Use one ${key} value.`);
    const value = values[0] ?? "";
    if (value && allowed && !allowed.includes(value)) throw new SelfHostAppsSearchInputError(`Invalid ${key} value.`);
    return value;
  };
  const multiple = (key: string, allowed?: readonly string[]) => {
    const values = [...new Set(params.getAll(key).filter(Boolean))];
    if (values.some(value => allowed ? !allowed.includes(value) : !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || value.length > 120)) {
      throw new SelfHostAppsSearchInputError(`Invalid ${key} value.`);
    }
    return values;
  };
  const q = single("q").trim();
  if (q.length > 200 || /[\u0000-\u001f\u007f]/.test(q)) throw new SelfHostAppsSearchInputError("Search must be at most 200 characters with no control characters.");
  const rawPage = single("page");
  if (rawPage && (!/^[1-9]\d*$/.test(rawPage) || !Number.isSafeInteger(Number(rawPage)))) {
    throw new SelfHostAppsSearchInputError("Page must be a positive integer.");
  }
  const app = single("app");
  if (app && (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(app) || app.length > 120)) throw new SelfHostAppsSearchInputError("Invalid app value.");
  return {
    q, sort: (single("sort", selfHostAppsSorts) || "popular") as SelfHostAppsSearchParams["sort"],
    page: Math.min(Number(rawPage || 1), 1_000_000), app,
    category: multiple("category"), license: multiple("license", multiValues.license),
    source: multiple("source", multiValues.source), docker: multiple("docker", multiValues.docker),
    install: multiple("install", multiValues.install), ram: single("ram", ramTiers),
    storage: single("storage", storageTiers), maintenance: multiple("maintenance", multiValues.maintenance),
    signal: multiple("signal", multiValues.signal),
  };
}

function ramTier(app: DirectoryAppIndex) {
  const ram = app.ram_estimate_min_mb;
  return ram === null ? "estimate unavailable" : ram < 1024 ? ramTiers[0] : ram <= 2048 ? ramTiers[1] : ram <= 4096 ? ramTiers[2] : ramTiers[3];
}
function storageTier(app: DirectoryAppIndex) {
  const storage = app.storage_estimate_min_gb;
  return storage === null ? "estimate unavailable" : storage < 1 ? "tiny" : storage < 10 ? "low" : storage < 100 ? "medium" : "high";
}
function matchesTier(order: string[], tier: string, selected: string) {
  return !selected || (order.indexOf(tier) >= 0 && order.indexOf(tier) <= order.indexOf(selected));
}
function compareTier(order: string[], left: string, right: string) {
  const a = order.indexOf(left);
  const b = order.indexOf(right);
  return a < 0 ? b < 0 ? 0 : 1 : b < 0 ? -1 : b - a;
}

export function selfHostAppsFacets(apps: DirectoryAppIndex[]): SelfHostAppsSearchFacets {
  const categories = new Map<string, SelfHostAppsFacetOption>();
  const licenseCounts = new Map<string, number>();
  const installCounts = new Map<string, number>();
  for (const app of apps) {
    for (const category of app.categories) {
      categories.set(category.slug, { value: category.slug, label: category.name, iconKey: category.icon_key });
    }
    const license = findDirectoryLicenseId(app.license_spdx_id, app.license);
    if (license) licenseCounts.set(license, (licenseCounts.get(license) ?? 0) + 1);
    for (const method of app.install_methods) installCounts.set(method, (installCounts.get(method) ?? 0) + 1);
  }
  return {
    categories: [...categories.values()].sort((a, b) => a.label.localeCompare(b.label)),
    licenses: licenses.filter(license => licenseCounts.has(license.id)).map(license => ({
      value: license.id, label: license.sidebarLabel, count: licenseCounts.get(license.id) ?? 0,
    })).sort((a, b) => a.label.localeCompare(b.label)),
    installMethods: installMethods.filter(([value]) => installCounts.has(value)).map(([value, label]) => ({
      value, label, count: installCounts.get(value) ?? 0,
    })),
  };
}

export function selectSelfHostApps(apps: DirectoryAppIndex[], params: SelfHostAppsSearchParams) {
  const categories = new Set(apps.flatMap(app => app.categories.map(category => category.slug)));
  if (params.category.some(category => !categories.has(category))) throw new SelfHostAppsSearchInputError("Unknown category.");
  const needle = params.q.toLowerCase();
  const filtered = apps.filter(app => {
    if (needle && ![app.name, app.summary, app.publisher_name, ...app.categories.map(category => category.name)].filter(Boolean).join(" ").toLowerCase().includes(needle)) return false;
    if (params.category.length && !app.categories.some(category => params.category.includes(category.slug))) return false;
    const license = findDirectoryLicenseId(app.license_spdx_id, app.license);
    if (params.license.length && (!license || !params.license.includes(license))) return false;
    if (params.source.length && !params.source.includes(app.source_model)) return false;
    if (params.docker.length && !["official", "community"].includes(app.docker_support)) return false;
    if (params.install.length && !app.install_methods.some(method => params.install.includes(method))) return false;
    if (!matchesTier(ramTiers, ramTier(app), params.ram) || !matchesTier(storageTiers, storageTier(app), params.storage)) return false;
    if (params.maintenance.length && !params.maintenance.includes(app.maintenance_status)) return false;
    if (params.signal.includes("mobile") && !app.surfaces.some(surface => surface === "ios" || surface === "android")) return false;
    if (params.signal.includes("database") && !app.requires_database) return false;
    if (params.signal.includes("compose") && !app.compose_support) return false;
    return true;
  }).sort((a, b) => {
    if (params.sort !== "lowest-ram" && params.ram) {
      const order = compareTier(ramTiers, ramTier(a), ramTier(b));
      if (order) return order;
    }
    if (params.storage) {
      const order = compareTier(storageTiers, storageTier(a), storageTier(b));
      if (order) return order;
    }
    if (params.sort === "name") return a.name.localeCompare(b.name);
    if (params.sort === "lowest-ram") return (a.ram_estimate_min_mb ?? Number.MAX_SAFE_INTEGER) - (b.ram_estimate_min_mb ?? Number.MAX_SAFE_INTEGER);
    if (params.sort === "healthy") return Number(b.maintenance_status === "active") - Number(a.maintenance_status === "active") || b.popularity_score - a.popularity_score;
    return b.popularity_score - a.popularity_score || a.name.localeCompare(b.name);
  });
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / SELF_HOST_APPS_PAGE_SIZE));
  const currentPage = Math.min(params.page, totalPages);
  const pageApps = filtered.slice((currentPage - 1) * SELF_HOST_APPS_PAGE_SIZE, currentPage * SELF_HOST_APPS_PAGE_SIZE);
  return { apps: pageApps.map(directoryAppCard), total, totalPages, currentPage, pageSize: SELF_HOST_APPS_PAGE_SIZE };
}
