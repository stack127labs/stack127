import { HardDrive } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { StorageToolsSidebar } from "../../storage-tools/storage-tools-sidebar";
import snapshotData from "./data/drive-reliability-snapshot.json";
import styles from "./drive-reliability.module.css";
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
      <div className={styles.page}>
        <header className={styles.pageHeader}>
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
        </header>
        <DriveReliabilityExplorer
          initialState={firstValue(params.state)}
          snapshot={snapshotData as DriveReliabilitySnapshot}
        />
        <DriveReliabilityGuide />
      </div>
    </AppShell>
  );
}
