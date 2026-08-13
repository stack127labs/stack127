import { ChevronsRight } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { StorageToolsSidebar } from "../../storage-tools/storage-tools-sidebar";
import styles from "./raidz-expansion-planner.module.css";
import { RaidzExpansionGuide } from "./raidz-expansion-guide";
import { RaidzExpansionPlanner } from "./raidz-expansion-planner";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function RaidzExpansionPlannerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const state = Array.isArray(params.state) ? params.state[0] ?? "" : params.state ?? "";
  return (
    <AppShell
      mainLabel="RAIDZ expansion planner"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="raidz-expansion" />}
      sidebarLabel="RAIDZ expansion planner sidebar"
    >
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1>
            <PageTitleIcon><ChevronsRight strokeWidth={2.2} /></PageTitleIcon>{" "}
            RAIDZ expansion <mark>planner</mark>
          </h1>
          <p>
            Plan how one existing, never-expanded RAIDZ vdev changes as you add disks one at a
            time. Enter the current and final widths, smallest member size, current physical
            allocation, representative block size, and <code>ashift</code> to compare modeled
            capacity now, immediately after each step, and at fresh final-width geometry. Capacity
            reported by <code>zfs list</code> or <code>df</code>{" "}remains unknown.
          </p>
        </header>
        <RaidzExpansionPlanner initialState={state} />
        <RaidzExpansionGuide />
      </div>
    </AppShell>
  );
}
