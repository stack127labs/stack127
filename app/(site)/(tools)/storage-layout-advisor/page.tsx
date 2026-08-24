import { HardDrive } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { StorageToolsSidebar } from "../../storage-tools/storage-tools-sidebar";
import styles from "./storage-layout-advisor.module.css";
import { StorageLayoutAdvisor } from "./storage-layout-advisor";
import { StorageLayoutAdvisorGuide } from "./storage-layout-advisor-guide";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function StorageLayoutAdvisorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="Storage Layout Advisor"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="layout-advisor" />}
      sidebarLabel="Storage layout advisor sidebar"
    >
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1>
            <PageTitleIcon>
              <HardDrive strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Storage layout <mark>advisor</mark>
          </h1>
          <p>
            Compare layouts from the drives you have, a minimum protected-failure target, and a
            workload preference. The result is a theoretical capacity and topology model, not
            live filesystem space or a guarantee about a running array.
          </p>
        </header>
        <StorageLayoutAdvisor initialState={firstValue(params.state)} />
        <StorageLayoutAdvisorGuide />
      </div>
    </AppShell>
  );
}
