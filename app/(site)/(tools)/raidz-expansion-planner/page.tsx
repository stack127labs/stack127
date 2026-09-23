import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ChevronsRight } from "lucide-react";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { StorageToolsSidebar } from "../../(catalogs)/storage-tools/storage-tools-sidebar";
import { RaidzExpansionPlanner } from "./raidz-expansion-planner";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function RaidzExpansionPlannerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("raidz-expansion-planner");
  const params = await searchParams;
  const state = Array.isArray(params.state) ? params.state[0] ?? "" : params.state ?? "";
  return (
    <AppShell
      mainLabel="RAIDZ expansion planner"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="raidz-expansion" />}
      sidebarLabel="RAIDZ expansion planner sidebar"
    >
      <PageCanvas>
        <ToolPageHeader
          icon={<ChevronsRight strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <RaidzExpansionPlanner initialState={state} />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
