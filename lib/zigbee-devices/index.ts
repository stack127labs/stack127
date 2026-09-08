import snapshot from "./data/devices.json" with { type: "json" };
import type { AmazonProductMatch } from "@/lib/amazon-affiliate";

export type ZigbeeFingerprint = {
  manufacturer_name: string | null;
  model_id: string | null;
};

export type ZigbeeDevice = {
  amazon?: AmazonProductMatch;
  battery_reporting: boolean;
  blakadder_url: string;
  card?: {
    compatibility: { label: string; status: "confirmed" | "reported" | "limited" | "not-applicable"; value: string };
    facts: Array<{ label: string; value: string }>;
  };
  category: string;
  date_added: string | null;
  detail_sections?: Array<{ facts: Array<{ label: string; value: string }>; heading: string }>;
  fingerprints: ZigbeeFingerprint[];
  image_path: string;
  image_quality?: string;
  image_source_url: string;
  model: string;
  name: string;
  ota: boolean;
  provenance?: Array<{ field: string; source: string; url: string }>;
  slug: string;
  vendor: string;
  zha_reported_capabilities: string[];
  zigbee_models: string[];
  zigbee2mqtt_capabilities: string[];
  zigbee2mqtt_url: string;
};

export type ZigbeeDeviceSnapshot = {
  meta: {
    blakadder: {
      commit: string;
      license_urls: string[];
      source_url: string;
    };
    device_count: number;
    coverage?: {
      blakadder_device_total: number;
      detail_total: number;
      eligible_total: number;
      excluded_total: number;
      failures: Array<Record<string, unknown>>;
      image_total: number;
      overlap_total: number;
      record_total: number;
      source_total: number;
      white_label_total: number;
      zigbee2mqtt_marketed_total: number;
    };
    excluded: {
      coordinators: number;
    };
    generated_at: string;
    matching_rule: string;
    ready_for_publication?: boolean;
    zigbee2mqtt: {
      license: string;
      package: string;
      source_url: string;
      version: string;
      website_commit?: string;
    };
  };
  devices: ZigbeeDevice[];
};

const catalog = snapshot as ZigbeeDeviceSnapshot;

export const zigbeeCategoryLabels = new Map([
  ["sensor", "Sensors"],
  ["light", "Lights"],
  ["switch", "Switches and dimmers"],
  ["remote", "Remotes"],
  ["plug", "Plugs"],
  ["climate", "Heating and climate"],
  ["cover", "Covers"],
  ["lock", "Locks"],
  ["router", "Routers"],
  ["other", "Other"],
]);

export const featuredZigbeeCapabilities = [
  "action",
  "battery",
  "brightness",
  "climate",
  "contact",
  "cover",
  "energy",
  "humidity",
  "light",
  "lock",
  "occupancy",
  "power",
  "smoke",
  "switch",
  "temperature",
] as const;

export function getZigbeeDevices() {
  return catalog.devices;
}

export function getZigbeeDeviceSnapshotMeta() {
  return catalog.meta;
}
