import { HardDrive } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { StorageToolsSidebar } from "../../storage-tools/storage-tools-sidebar";
import { RebuildCalculator } from "./rebuild-calculator";
import { RebuildCalculatorGuide } from "./rebuild-calculator-guide";
import styles from "./rebuild-calculator.module.css";

export default function RebuildCalculatorPage() {
  return (
    <AppShell
      mainLabel="Rebuild exposure calculator"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="rebuild" />}
      sidebarLabel="Rebuild calculator sidebar"
    >
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1>
            <PageTitleIcon>
              <HardDrive strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Rebuild window and read-error exposure <mark>calculator</mark>
          </h1>
          <p>
            Estimate how long one simplified rebuild keeps an array degraded, how much source media it reads, and the modeled chance of a specified read error. Use standard RAID inputs. This is an exposure model, not a data-loss guarantee.
          </p>
        </header>
        <RebuildCalculator />
        <RebuildCalculatorGuide />
      </div>
    </AppShell>
  );
}
