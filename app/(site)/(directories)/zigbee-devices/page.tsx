import { PageCanvas } from "@/app/ui/site/page-canvas";
import { RadioTower } from "lucide-react";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import {
  proseClassName,
  proseFlowClassName,
} from "@/app/ui/site/prose";
import {
  featuredZigbeeCapabilities,
  getZigbeeDeviceSnapshotMeta,
  getZigbeeDevices,
  zigbeeCategoryLabels,
} from "@/lib/zigbee-devices";
import { addAmazonMatches } from "@/lib/amazon-affiliate/server";
import type { DirectoryFilterOption as FilterOption } from "../../../ui/directories/directory-filters";
import { DirectoryQueryProvider } from "../../../ui/directories/directory-query";
import { sortDevices, zigbeeIndexRecord, zigbeePageSize } from "./filters";
import { ZigbeeDeviceFilters, ZigbeeDeviceResults } from "./zigbee-device-view";
import styles from "./zigbee-devices.module.css";

export default async function ZigbeeDevicesPage() {
  const devices = getZigbeeDevices();
  const meta = getZigbeeDeviceSnapshotMeta();
  const firstPageDevices = await addAmazonMatches("zigbee-devices", sortDevices(devices, "name").slice(0, zigbeePageSize));

  const categoryCounts = new Map<string, number>();
  const vendorCounts = new Map<string, number>();
  for (const device of devices) {
    categoryCounts.set(device.category, (categoryCounts.get(device.category) ?? 0) + 1);
    vendorCounts.set(device.vendor, (vendorCounts.get(device.vendor) ?? 0) + 1);
  }

  const categoryOptions: FilterOption[] = [...categoryCounts.entries()]
    .map(([value, count]) => ({ count, label: zigbeeCategoryLabels.get(value) ?? "Other", value }))
    .sort((left, right) => left.label.localeCompare(right.label));
  const categoryLabels = Object.fromEntries(categoryOptions.map((option) => [option.value, option.label]));
  const vendorOptions: FilterOption[] = [...vendorCounts.entries()]
    .map(([value, count]) => ({ count, label: value, value }))
    .sort((left, right) => left.label.localeCompare(right.label));
  const capabilityOptions: FilterOption[] = featuredZigbeeCapabilities
    .map((value) => ({
      count: devices.filter((device) => device.zigbee2mqtt_capabilities.includes(value)).length,
      label: value.replaceAll("_", " "),
      value,
    }))
    .filter((option) => option.count > 0);

  const snapshotDate = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(meta.generated_at));

  const sidebar = (
    <ZigbeeDeviceFilters
      capabilityOptions={capabilityOptions}
      categoryOptions={categoryOptions}
      heading={<SidebarLabel>Zigbee devices</SidebarLabel>}
      vendorOptions={vendorOptions}
    />
  );

  return (
    <DirectoryQueryProvider route="/zigbee-devices">
      <AppShell mainLabel="Zigbee devices directory" menuLabel="Filters" sidebar={sidebar} sidebarLabel="Zigbee device filters">
        <PageCanvas as="div" flow className="directory-results">
          <PageHeader bordered>
            <h1>
              <PageTitleIcon><RadioTower strokeWidth={2.2} /></PageTitleIcon>{" "}
              Zigbee compatible devices for <mark>Zigbee2MQTT and ZHA</mark>
            </h1>
            <p>
              Check whether a device is listed for Zigbee2MQTT, has a community report for ZHA, or both. Each card shows its device type and main features.
            </p>
          </PageHeader>

          <ZigbeeDeviceResults
            categoryLabels={categoryLabels}
            details={firstPageDevices}
            firstPage={firstPageDevices.map((device) => zigbeeIndexRecord(device, zigbeeCategoryLabels))}
            index={{ url: "/api/hardware-directory/zigbee-devices" }}
            snapshotDate={snapshotDate}
            total={devices.length}
          />

          <section className={`${proseClassName} ${proseFlowClassName} ${styles.guide}`}>
            <h2>Before you buy</h2>
            <p>A device listed for Zigbee2MQTT is not automatically confirmed for ZHA. Support can also differ between hardware revisions.</p>

            <h2>The exact model matters more than the product name</h2>
            <p>
              Manufacturers sometimes reuse a product name across different hardware. Tuya devices can also
              share generic Zigbee identifiers such as <code>TS0601</code> while using different manufacturer
              fingerprints and data points. This directory shares evidence only when the marketed model matches
              exactly. For Tuya devices, check the manufacturer and model fingerprint as well as the product name.
            </p>

            <h2>Check for support updates</h2>
            <p>
              Support changes with converter releases, Home Assistant updates, device firmware, and hardware
              revisions. Open the compatibility links in the device details and check the notes for your exact model.
            </p>
          </section>
        </PageCanvas>
      </AppShell>
    </DirectoryQueryProvider>
  );
}
