import type { ZigbeeDevice } from "@/lib/zigbee-devices";
import { hardwareCardName } from "@/lib/hardware-directories/card-name";

export type ZigbeeSearchParams = Record<string, string | string[] | undefined>;

export const zigbeeSortValues = ["name", "vendor", "capabilities", "newest"] as const;
export type ZigbeeSort = (typeof zigbeeSortValues)[number];

export function getValues(params: ZigbeeSearchParams, key: string) {
  const value = params[key];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function getString(params: ZigbeeSearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function getPage(params: ZigbeeSearchParams) {
  const value = Number(getString(params, "page"));
  return Number.isInteger(value) && value > 1 ? value : 1;
}

export function getSort(params: ZigbeeSearchParams): ZigbeeSort {
  const value = getString(params, "sort");
  return zigbeeSortValues.includes(value as ZigbeeSort) ? value as ZigbeeSort : "name";
}

function matchesSearch(device: ZigbeeDevice, query: string) {
  if (!query) return true;

  const haystack = [
    device.vendor,
    device.name,
    device.model,
    ...device.zigbee_models,
    ...device.fingerprints.flatMap((fingerprint) => [
      fingerprint.manufacturer_name,
      fingerprint.model_id,
    ]),
    ...device.zigbee2mqtt_capabilities,
    ...device.zha_reported_capabilities,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export function filterDevices(devices: ZigbeeDevice[], params: ZigbeeSearchParams) {
  const query = getString(params, "q").trim();
  const categories = new Set(getValues(params, "category"));
  const vendors = new Set(getValues(params, "vendor"));
  const capabilities = new Set(getValues(params, "capability"));
  const ota = getString(params, "ota");
  const battery = getString(params, "battery");

  return devices.filter((device) => {
    if (!matchesSearch(device, query)) return false;
    if (categories.size > 0 && !categories.has(device.category)) return false;
    if (vendors.size > 0 && !vendors.has(device.vendor)) return false;
    if (
      capabilities.size > 0
      && ![...capabilities].some((capability) =>
        device.zigbee2mqtt_capabilities.includes(capability),
      )
    ) return false;
    if (ota === "yes" && !device.ota) return false;
    if (battery === "yes" && !device.battery_reporting) return false;
    return true;
  });
}

export function sortDevices(devices: ZigbeeDevice[], sort: ZigbeeSort | string) {
  return [...devices].sort((left, right) => {
    if (sort === "vendor") {
      return left.vendor.localeCompare(right.vendor)
        || left.model.localeCompare(right.model);
    }

    if (sort === "capabilities") {
      return right.zigbee2mqtt_capabilities.length - left.zigbee2mqtt_capabilities.length
        || hardwareCardName(left.name, left.vendor, left.model).localeCompare(hardwareCardName(right.name, right.vendor, right.model))
        || left.model.localeCompare(right.model);
    }

    if (sort === "newest") {
      return String(right.date_added ?? "").localeCompare(String(left.date_added ?? ""))
        || hardwareCardName(left.name, left.vendor, left.model).localeCompare(hardwareCardName(right.name, right.vendor, right.model));
    }

    return hardwareCardName(left.name, left.vendor, left.model).localeCompare(hardwareCardName(right.name, right.vendor, right.model))
      || left.vendor.localeCompare(right.vendor)
      || left.model.localeCompare(right.model);
  });
}



export function pageHref(params: ZigbeeSearchParams, page: number) {
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === "page") continue;
    for (const current of Array.isArray(value) ? value : value ? [value] : []) {
      next.append(key, current);
    }
  }

  if (page > 1) next.set("page", String(page));
  const query = next.toString();
  return query ? `/zigbee-devices?${query}` : "/zigbee-devices";
}
