import { Calculator } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { PageHeader } from "../../../page-header";
import { PageCanvas } from "../../../page-canvas";
import { StorageToolsSidebar } from "../../(catalogs)/storage-tools/storage-tools-sidebar";
import { StorageGrowthGuide } from "./storage-growth-planner-guide";
import { StorageGrowthPlanner } from "./storage-growth-planner";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function StorageGrowthPlannerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="Storage growth planner"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="storage-growth" />}
      sidebarLabel="Storage tools sidebar"
    >
      <PageCanvas>
        <PageHeader>
          <h1>
            <PageTitleIcon>
              <Calculator strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Storage Growth and TCO <mark>Planner</mark>
          </h1>
          <p>
            Plan a local storage purchase against your data growth and cost assumptions. The planner shows capacity after reserve, the first shortfall year, and a modeled total cost; it is not installed filesystem free space.
          </p>
        </PageHeader>
        <StorageGrowthPlanner initialState={firstValue(params.state)} />
        <StorageGrowthGuide />
      </PageCanvas>
    </AppShell>
  );
}
