import { HardDrive } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { StorageToolsSidebar } from "../../storage-tools/storage-tools-sidebar";
import styles from "./unraid-calculator.module.css";
import { UnraidCalculator } from "./unraid-calculator";
import { UnraidCalculatorGuide } from "./unraid-calculator-guide";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function UnraidCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="Unraid Main Array calculator"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="unraid" />}
      sidebarLabel="Storage tools sidebar"
    >
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1>
            <PageTitleIcon>
              <HardDrive strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Unraid Main Array <mark>calculator</mark>
          </h1>
          <p>
            Plan a Main Array for a homelab from explicit parity and data roles you already know,
            then see array-level data capacity and one future drive&apos;s parity boundary.
            Filesystem-visible space remains unknown, and the calculator stops at that planning
            boundary.
          </p>
        </header>
        <UnraidCalculator initialState={firstValue(params.state)} />
        <UnraidCalculatorGuide />
      </div>
    </AppShell>
  );
}
