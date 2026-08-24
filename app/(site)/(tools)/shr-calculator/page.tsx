import { HardDrive } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { StorageToolsSidebar } from "../../storage-tools/storage-tools-sidebar";
import { ShrGuide } from "./shr-guide";
import { ShrCalculator } from "./shr-calculator";
import styles from "./shr-calculator.module.css";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ShrCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="Synology SHR capacity calculator"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="shr" />}
      sidebarLabel="SHR calculator sidebar"
    >
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1>
            <PageTitleIcon>
              <HardDrive strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Synology SHR capacity <mark>calculator</mark> for mixed drives
          </h1>
          <p>
            Enter individual drive capacities, choose SHR-1 or SHR-2, and get an estimated fresh-pool
            capacity with protection and unused tiers kept separate. Inputs stay in your browser;
            this page does not model expansion history or filesystem free space.
          </p>
        </header>
        <ShrCalculator initialState={firstValue(params.state)} />
        <ShrGuide />
      </div>
    </AppShell>
  );
}
