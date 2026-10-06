import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { ContentMarkdown } from "../content-markdown";
import { DirectoryPageTitle, DirectoryPageContent } from "./directory-page-content";
import { PageMeta } from "@/app/ui/site/page-meta";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import type { ReactNode } from "react";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { PageHeader } from "@/app/ui/site/page-header";
import { DirectoryTitleIcon } from "./directory-title-icon";
import { proseClassName, proseFlowClassName } from "@/app/ui/site/prose";
import type { HardwareDirectorySnapshot } from "@/lib/hardware-directories";
import type { DirectoryFilterOption as FilterOption } from "./directory-filters";
import type { DirectoryIndexSource } from "./directory-index";
import { DirectoryQueryProvider } from "./directory-query";
import { hardwareIndexRecord, hardwarePageSize, sortHardwareRecords, type HardwareIndexRecord } from "./hardware-directory-filters";
import { HardwareDirectoryFilters, HardwareDirectoryResults } from "./hardware-directory-view";
import styles from "./hardware-directory-page.module.css";

export type HardwareDirectoryConfig = {
  detailFilterLabel: string;
  icon: ReactNode;
  route: string;
  searchPlaceholder: string;
  sidebarLabel: string;
  title: string;
};

// Small lists ship with the page. Larger ones load from a cached JSON route
// the first time someone filters, so the default page stays light.
const inlineIndexLimit = 300;

export async function HardwareDirectoryPage({ config, snapshot }: { config: HardwareDirectoryConfig; snapshot: HardwareDirectorySnapshot }) {
  const directoryPage = await getRequiredDirectoryPage(config.route.slice(1));
  const records = snapshot.records;
  const firstPage = sortHardwareRecords(records, "name").slice(0, hardwarePageSize).map(hardwareIndexRecord);
  const index: DirectoryIndexSource<HardwareIndexRecord> = records.length <= inlineIndexLimit
    ? { records: records.map(hardwareIndexRecord) }
    : { url: `/api/hardware-directory${config.route}` };

  const optionList = (key: "category" | "vendor" | "features"): FilterOption[] => {
    const counts = new Map<string, number>();
    for (const record of records) {
      const values = key === "features" ? record.features : [record[key]];
      for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts].map(([value, count]) => ({ count, label: value, value })).sort((a, b) => a.label.localeCompare(b.label));
  };

  const sidebar = (
    <HardwareDirectoryFilters
      categoryOptions={optionList("category")}
      detailFilterLabel={config.detailFilterLabel}
      featureOptions={optionList("features")}
      heading={<SidebarLabel>{config.sidebarLabel}</SidebarLabel>}
      route={config.route}
      searchPlaceholder={config.searchPlaceholder}
      vendorOptions={optionList("vendor")}
    />
  );

  const snapshotDate = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(snapshot.meta.generated_at));
  return (
    <DirectoryQueryProvider route={config.route}>
      <AppShell mainLabel={config.title} menuLabel="Filters" sidebar={sidebar} sidebarLabel={`${config.sidebarLabel} filters`}>
        <PageCanvas as="div" flow className="directory-results">
          <PageHeader bordered>
            <h1><DirectoryTitleIcon iconKey={directoryPage.card_icon_key} fallback={config.icon} />{" "}<DirectoryPageTitle title={directoryPage.title} /></h1>
            <PageMeta updatedAt={directoryPage.updated_at} />
            <ContentMarkdown markdown={directoryPage.intro_markdown} />
          </PageHeader>

          <HardwareDirectoryResults
            detailFilterLabel={config.detailFilterLabel}
            firstPage={firstPage}
            index={index}
            route={config.route}
            snapshotDate={snapshotDate}
            title={config.title}
            total={records.length}
          />

          <section className={`${proseClassName} ${proseFlowClassName} ${styles.guide}`}>
            <DirectoryPageContent page={directoryPage} />
          </section>
        </PageCanvas>
      </AppShell>
    </DirectoryQueryProvider>
  );
}
