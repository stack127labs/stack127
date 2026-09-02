import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Calculator } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageCanvas } from "../../../page-canvas";
import { StorageToolsSidebar } from "../../(catalogs)/storage-tools/storage-tools-sidebar";
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
  const toolPage = await getRequiredToolPage("storage-growth-planner");
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="Storage growth planner"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="storage-growth" />}
      sidebarLabel="Storage tools sidebar"
    >
      <PageCanvas>
        <ToolPageHeader
          icon={<Calculator strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <StorageGrowthPlanner initialState={firstValue(params.state)} />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
