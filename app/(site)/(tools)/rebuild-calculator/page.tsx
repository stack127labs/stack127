import { HardDrive } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { PageHeader } from "../../../page-header";
import { PageCanvas } from "../../../page-canvas";
import { StorageToolsSidebar } from "../../(catalogs)/storage-tools/storage-tools-sidebar";
import { RebuildCalculator } from "./rebuild-calculator";
import { RebuildCalculatorGuide } from "./rebuild-calculator-guide";

export default function RebuildCalculatorPage() {
  return (
    <AppShell
      mainLabel="Rebuild exposure calculator"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="rebuild" />}
      sidebarLabel="Rebuild calculator sidebar"
    >
      <PageCanvas>
        <PageHeader>
          <h1>
            <PageTitleIcon>
              <HardDrive strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Rebuild window and read-error exposure <mark>calculator</mark>
          </h1>
          <p>
            Estimate how long one simplified rebuild keeps an array degraded, how much source media it reads, and the modeled chance of a specified read error. Use standard RAID inputs. This is an exposure model, not a data-loss guarantee.
          </p>
        </PageHeader>
        <RebuildCalculator />
        <RebuildCalculatorGuide />
      </PageCanvas>
    </AppShell>
  );
}
