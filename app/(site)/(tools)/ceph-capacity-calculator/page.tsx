import { ServerCog } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { StorageToolsSidebar } from "../../storage-tools/storage-tools-sidebar";
import styles from "./ceph-capacity-calculator.module.css";
import { CephCapacityCalculator } from "./ceph-capacity-calculator";
import { CephCapacityGuide } from "./ceph-capacity-guide";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function CephCapacityCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="Ceph capacity planner"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="ceph" />}
      sidebarLabel="Ceph planner sidebar"
    >
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1>
            <PageTitleIcon>
              <ServerCog strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Ceph capacity and failure-domain <mark>planner</mark>
          </h1>
          <p>
            Plan a Ceph inventory by protection profile and named failure domain. The planner
            returns raw capacity, modeled usable capacity, reserve, and the effect of losing the
            largest modeled domain. It is a local planning model, not a live CRUSH or pool
            inspection.
          </p>
        </header>
        <CephCapacityCalculator initialState={firstValue(params.state)} />
        <CephCapacityGuide />
      </div>
    </AppShell>
  );
}
