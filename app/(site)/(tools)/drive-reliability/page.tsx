import { HardDrive } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { PageHeader } from "../../../page-header";
import { PageCanvas } from "../../../page-canvas";
import { StorageToolsSidebar } from "../../(catalogs)/storage-tools/storage-tools-sidebar";
import snapshotData from "./data/drive-reliability-snapshot.json";
import { DriveReliabilityExplorer } from "./drive-reliability";
import { DriveReliabilityGuide } from "./drive-reliability-guide";
import type { DriveReliabilitySnapshot } from "@/lib/drive-reliability";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function DriveReliabilityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="Drive reliability explorer"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="drive-reliability" />}
      sidebarLabel="Storage tools sidebar"
    >
      <PageCanvas>
        <PageHeader>
          <h1>
            <PageTitleIcon>
              <HardDrive strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Drive reliability <mark>explorer</mark>
          </h1>
          <p>
            Use published Backblaze drive data to inspect an exact model or compare up to three
            cohorts. The explorer returns observed AFR and the exposure behind it, not a personal
            failure forecast for a home NAS.
          </p>
        </PageHeader>
        <DriveReliabilityExplorer
          initialState={firstValue(params.state)}
          snapshot={snapshotData as DriveReliabilitySnapshot}
        />
        <DriveReliabilityGuide />
      </PageCanvas>
    </AppShell>
  );
}
