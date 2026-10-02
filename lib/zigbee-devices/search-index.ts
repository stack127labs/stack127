import type { ZigbeeDevice } from "./index";

export type ZigbeeIndexRecord = Pick<ZigbeeDevice,
  | "vendor" | "name" | "model" | "category" | "zigbee_models" | "fingerprints"
  | "zigbee2mqtt_capabilities" | "zha_reported_capabilities" | "ota" | "battery_reporting"
  | "date_added" | "slug" | "image_path"> & {
  amazon: boolean;
  cardFacts: Array<{ label: string; value: string }>;
  compatibility: NonNullable<ZigbeeDevice["card"]>["compatibility"];
};

export function zigbeeIndexRecord(device: ZigbeeDevice, categoryLabels: Map<string, string>): ZigbeeIndexRecord {
  return {
    amazon: Boolean(device.amazon),
    battery_reporting: device.battery_reporting,
    cardFacts: device.card?.facts ?? [
      { label: "Type", value: categoryLabels.get(device.category) ?? "Other" },
      { label: "Capabilities", value: device.zigbee2mqtt_capabilities.slice(0, 4).join(", ") || "Not listed" },
    ],
    category: device.category,
    compatibility: device.card?.compatibility ?? { label: "Works with", status: "confirmed", value: "Zigbee2MQTT + ZHA" },
    date_added: device.date_added,
    fingerprints: device.fingerprints,
    image_path: device.image_path,
    model: device.model,
    name: device.name,
    ota: device.ota,
    slug: device.slug,
    vendor: device.vendor,
    zha_reported_capabilities: device.zha_reported_capabilities,
    zigbee2mqtt_capabilities: device.zigbee2mqtt_capabilities,
    zigbee_models: device.zigbee_models,
  };
}
