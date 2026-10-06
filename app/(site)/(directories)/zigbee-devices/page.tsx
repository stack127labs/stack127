import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { DirectoryPageTitle, DirectoryPageContent } from "@/app/ui/directories/directory-page-content";
import { PageMeta } from "@/app/ui/site/page-meta";
import { ContentMarkdown } from "@/app/ui/content-markdown";
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
  const directoryPage = await getRequiredDirectoryPage("zigbee-devices");
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
            <h1><PageTitleIcon><RadioTower strokeWidth={2.2} /></PageTitleIcon>{" "}<DirectoryPageTitle title={directoryPage.title} /></h1>
            <PageMeta updatedAt={directoryPage.updated_at} />
            <ContentMarkdown markdown={directoryPage.intro_markdown} />
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
            <DirectoryPageContent page={directoryPage} section="copy-1" />
          </section>
        </PageCanvas>
      </AppShell>
    </DirectoryQueryProvider>
  );
}
