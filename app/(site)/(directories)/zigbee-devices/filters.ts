import type { ZigbeeDevice } from "@/lib/zigbee-devices";
import { hardwareCardName } from "@/lib/hardware-directories/card-name";
import { pageParamHref, paramPage, paramString, paramValues, type DirectoryParams } from "@/app/ui/directories/directory-params";

export const zigbeePageSize = 30;

export type ZigbeeSearchParams = DirectoryParams;

export const zigbeeSortValues = ["name", "vendor", "capabilities", "newest"] as const;
export type ZigbeeSort = (typeof zigbeeSortValues)[number];

type FilterableDevice = Pick<ZigbeeDevice,
  | "vendor" | "name" | "model" | "category" | "zigbee_models" | "fingerprints"
  | "zigbee2mqtt_capabilities" | "zha_reported_capabilities" | "ota" | "battery_reporting">;
type SortableDevice = Pick<ZigbeeDevice, "vendor" | "name" | "model" | "zigbee2mqtt_capabilities" | "date_added">;


export { zigbeeIndexRecord, type ZigbeeIndexRecord } from "@/lib/zigbee-devices/search-index";

export const getValues = paramValues;
export const getString = paramString;
export const getPage = paramPage;

export function getSort(params: ZigbeeSearchParams): ZigbeeSort {
  const value = getString(params, "sort");
  return zigbeeSortValues.includes(value as ZigbeeSort) ? value as ZigbeeSort : "name";
}

function matchesSearch(device: FilterableDevice, query: string) {
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

export function filterDevices<T extends FilterableDevice>(devices: T[], params: ZigbeeSearchParams) {
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

export function sortDevices<T extends SortableDevice>(devices: T[], sort: ZigbeeSort | string) {
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
  return pageParamHref("/zigbee-devices", params, page);
}

/** Builds the compact record. Category labels come from the server so the browser never loads the device file. */
