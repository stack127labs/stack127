import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ServerCog } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { CephCapacityCalculator } from "./ceph-capacity-calculator";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function CephCapacityCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const toolPage = await getRequiredToolPage("ceph-capacity-calculator");
  const params = await searchParams;
  return (
    <PageCanvas>
      <ToolPageHeader
        icon={<ServerCog strokeWidth={2.2} />}
        toolPage={toolPage}
      />
      <CephCapacityCalculator initialState={firstValue(params.state)} />
      <ToolPageMarkdown toolPage={toolPage} />
    </PageCanvas>
  );
}
