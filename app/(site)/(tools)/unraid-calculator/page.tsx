import { HardDrive } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { PageHeader } from "../../../page-header";
import { PageCanvas } from "../../../page-canvas";
import { StorageToolsSidebar } from "../../(catalogs)/storage-tools/storage-tools-sidebar";
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
      <PageCanvas>
        <PageHeader>
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
        </PageHeader>
        <UnraidCalculator initialState={firstValue(params.state)} />
        <UnraidCalculatorGuide />
      </PageCanvas>
    </AppShell>
  );
}
