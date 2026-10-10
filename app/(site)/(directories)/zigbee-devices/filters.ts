import type { featuredZigbeeCapabilities, ZigbeeDevice } from "@/lib/zigbee-devices";
import { hardwareCardName } from "@/lib/hardware-directories/card-name";
import { pageParamHref, paramPage, paramString, paramValues, type DirectoryParams } from "@/app/ui/directories/directory-params";

export const zigbeePageSize = 30;

export type ZigbeeSearchParams = DirectoryParams;

export const zigbeeSortValues = ["name", "vendor", "capabilities", "newest"] as const;
export type ZigbeeSort = (typeof zigbeeSortValues)[number];

type FilterableDevice = Pick<ZigbeeDevice,
  | "vendor" | "name" | "model" | "category" | "zigbee_models" | "fingerprints"
  | "zigbee2mqtt_capabilities" | "zha_reported_capabilities" | "ota" | "battery_reporting">;
type SortableDevice = Pick<ZigbeeDevice, "vendor" | "name" | "model" | "zigbee2mqtt_capabilities" | "zha_reported_capabilities" | "date_added">;
type CapabilityDevice = Pick<ZigbeeDevice, "zigbee2mqtt_capabilities" | "zha_reported_capabilities"> & { category?: string };

// Zigbee2MQTT field names match the featured capabilities directly. Blakadder
// writes free-text feature names, so each featured capability lists the
// Blakadder names that mean the same thing.
const reportedCapabilityPatterns: Record<(typeof featuredZigbeeCapabilities)[number], RegExp> = {
  action: /\baction|click|\bhold\b|release|^single$|^double$/,
  battery: /^battery/,
  brightness: /^brightness$|^level$|dimmable/,
  climate: /thermostat|setpoint|heating|cooling|climate/,
  contact: /contact|door opened/,
  cover: /^cover|position|tilt|^open$|^close$|^stop$/,
  energy: /energy|meter(ing)?$|power meter/,
  humidity: /humidity/,
  light: /^colou?r|^colotemp|^light/,
  lock: /^lock|^unlock$/,
  occupancy: /occupancy|motion$/,
  power: /^power$|power (measurement|monitoring|meter)|electrical measurement/,
  smoke: /smoke/,
  switch: /on\/off|on_off$|^switch$|^state$/,
  temperature: /^temperature$|local temperature/,
};

/** Featured capabilities from both sources, so Blakadder-only records can match too. */
export function deviceCapabilities(device: CapabilityDevice) {
  const capabilities = new Set(device.zigbee2mqtt_capabilities);
  for (const reported of device.zha_reported_capabilities) {
    const value = reported.trim().toLowerCase();
    for (const [capability, pattern] of Object.entries(reportedCapabilityPatterns)) {
      // A tilt or position sensor reports the same words as a blind motor. Only covers move.
      if (capability === "cover" && device.category === "sensor") continue;
      if (pattern.test(value)) capabilities.add(capability);
    }
  }
  return capabilities;
}

function featuredCapabilityCount(device: CapabilityDevice) {
  const capabilities = deviceCapabilities(device);
  return Object.keys(reportedCapabilityPatterns).filter((capability) => capabilities.has(capability)).length;
}

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
    if (capabilities.size > 0) {
      const listed = deviceCapabilities(device);
      if (![...capabilities].some((capability) => listed.has(capability))) return false;
    }
    if (ota === "yes" && !device.ota) return false;
    if (battery === "yes" && !device.battery_reporting) return false;
    return true;
  });
}

export function sortDevices<T extends SortableDevice>(devices: T[], sort: ZigbeeSort | string) {
  const featureCounts = new Map<T, number>();
  if (sort === "capabilities") for (const device of devices) featureCounts.set(device, featuredCapabilityCount(device));
  return [...devices].sort((left, right) => {
    if (sort === "vendor") {
      return left.vendor.localeCompare(right.vendor)
        || left.model.localeCompare(right.model);
    }

    if (sort === "capabilities") {
      return (featureCounts.get(right) ?? 0) - (featureCounts.get(left) ?? 0)
        || right.zigbee2mqtt_capabilities.length - left.zigbee2mqtt_capabilities.length
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
