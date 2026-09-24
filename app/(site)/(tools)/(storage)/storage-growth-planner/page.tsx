import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Calculator } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
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
    <PageCanvas>
      <ToolPageHeader
        icon={<Calculator strokeWidth={2.2} />}
        toolPage={toolPage}
      />
      <StorageGrowthPlanner initialState={firstValue(params.state)} />
      <ToolPageMarkdown toolPage={toolPage} />
    </PageCanvas>
  );
}
