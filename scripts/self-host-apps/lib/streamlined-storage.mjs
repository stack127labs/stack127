const methodColumns = new Map([
  ["docker", "docker_urls"],
  ["compose", "compose_urls"],
  ["truenas_scale", "truenas_scale_urls"],
  ["unraid", "unraid_urls"],
  ["umbrel", "umbrel_urls"],
  ["yunohost", "yunohost_urls"],
  ["casaos", "casaos_urls"],
  ["runtipi", "runtipi_urls"],
  ["cosmos", "cosmos_urls"],
  ["openmediavault", "openmediavault_urls"],
  ["synology", "synology_urls"],
  ["qnap", "qnap_urls"],
  ["proxmox", "proxmox_urls"],
  ["home_assistant_os", "home_assistant_os_urls"],
  ["kubernetes", "kubernetes_urls"],
  ["helm", "helm_urls"],
  ["native", "native_urls"],
  ["binary", "binary_urls"],
  ["package", "package_urls"],
  ["other", "other_urls"],
]);

export const installMethods = [...methodColumns.keys()];
export const installMethodColumns = Object.fromEntries(methodColumns);

function cleanUrl(value) {
  const url = String(value ?? "").trim();
  return /^https?:\/\//i.test(url) ? url : null;
}

function cleanArray(value) {
  return [...new Set((Array.isArray(value) ? value : []).map(cleanUrl).filter(Boolean))];
}

export function normalizeInstallOptions(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((option) => option && typeof option === "object")
    .map((option) => ({
      method: String(option.method ?? "other"),
      label: String(option.label ?? option.method ?? "Install"),
      url: cleanUrl(option.url),
      image: option.image ? String(option.image) : null,
      support_level: ["official", "community", "third_party"].includes(option.support_level)
        ? option.support_level
        : "third_party",
      source_url: cleanUrl(option.source_url),
      note: option.note ? String(option.note) : null,
      sort_order: Number.isFinite(Number(option.sort_order)) ? Number(option.sort_order) : 0,
    }))
    .filter((option) => installMethods.includes(option.method) && option.url);
}

export function installOptionsToRow(options, { catalogSources = [], checkedAt = null } = {}) {
  const normalized = normalizeInstallOptions(options);
  const row = {
    options: normalized,
    catalog_sources: Array.isArray(catalogSources) ? catalogSources : [],
    source_urls: [...new Set(normalized.map((option) => option.source_url).filter(Boolean))],
    checked_at: checkedAt,
  };

  for (const method of installMethods) row[methodColumns.get(method)] = [];
  row.docker_images = [];

  for (const option of normalized) {
    row[methodColumns.get(option.method)].push(option.url);
    if (option.method === "docker" && option.image) row.docker_images.push(option.image);
  }

  for (const method of installMethods) row[methodColumns.get(method)] = cleanArray(row[methodColumns.get(method)]);
  row.docker_images = [...new Set(row.docker_images)];
  return row;
}

export function rowToInstallOptions(row) {
  const options = normalizeInstallOptions(row?.options);
  if (options.length > 0) return options;

  const fallback = [];
  for (const method of installMethods) {
    const urls = cleanArray(row?.[methodColumns.get(method)]);
    for (const [index, url] of urls.entries()) {
      fallback.push({
        method,
        label: method.replaceAll("_", " "),
        url,
        image: method === "docker" ? row?.docker_images?.[index] ?? row?.docker_images?.[0] ?? null : null,
        support_level: "third_party",
        source_url: null,
        note: null,
        sort_order: index,
      });
    }
  }
  return fallback;
}

export function resourceEstimatesToRow(records, { checkedAt = null } = {}) {
  const byKind = new Map((Array.isArray(records) ? records : []).map((record) => [record.resource_kind, record]));
  const ram = byKind.get("ram");
  const storage = byKind.get("storage");
  const row = {
    ram_estimate_min_mb: ram?.estimate_min ?? null,
    ram_estimate_max_mb: ram?.estimate_max ?? null,
    ram_estimate_kind: ram?.estimate_kind ?? null,
    ram_estimate_confidence: ram?.confidence ?? null,
    ram_estimate_basis: ram?.basis ?? null,
    ram_source_urls: cleanArray(ram?.source_urls),
    ram_note: ram?.note ?? null,
    storage_estimate_min_gb: storage?.estimate_min ?? null,
    storage_estimate_max_gb: storage?.estimate_max ?? null,
    storage_estimate_kind: storage?.estimate_kind ?? null,
    storage_estimate_confidence: storage?.confidence ?? null,
    storage_estimate_basis: storage?.basis ?? null,
    storage_source_urls: cleanArray(storage?.source_urls),
    storage_note: storage?.note ?? null,
    checked_at: checkedAt,
  };
  return row;
}

export function rowToResourceEstimates(row) {
  if (!row) return {};
  const result = {};
  if (row.ram_estimate_min_mb !== null && row.ram_estimate_min_mb !== undefined) {
    result.ram = {
      estimate_min: Number(row.ram_estimate_min_mb),
      estimate_max: Number(row.ram_estimate_max_mb),
      unit: "mb",
      estimate_kind: row.ram_estimate_kind,
      confidence: row.ram_estimate_confidence,
      basis: row.ram_estimate_basis,
      source_urls: cleanArray(row.ram_source_urls),
      note: row.ram_note ?? null,
      checked_at: row.checked_at ?? "",
    };
  }
  if (row.storage_estimate_min_gb !== null && row.storage_estimate_min_gb !== undefined) {
    result.storage = {
      estimate_min: Number(row.storage_estimate_min_gb),
      estimate_max: Number(row.storage_estimate_max_gb),
      unit: "gb",
      estimate_kind: row.storage_estimate_kind,
      confidence: row.storage_estimate_confidence,
      basis: row.storage_estimate_basis,
      source_urls: cleanArray(row.storage_source_urls),
      note: row.storage_note ?? null,
      checked_at: row.checked_at ?? "",
    };
  }
  return result;
}
