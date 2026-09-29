import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ChevronsRight } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { RaidzExpansionPlanner } from "./raidz-expansion-planner";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function RaidzExpansionPlannerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("raidz-expansion-planner");
  const params = await searchParams;
  const state = Array.isArray(params.state) ? params.state[0] ?? "" : params.state ?? "";
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<ChevronsRight strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <RaidzExpansionPlanner initialState={state} />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
