import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Database } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { ZfsCapacityCalculator } from "./zfs-capacity-calculator";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ZfsCapacityCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const toolPage = await getRequiredToolPage("zfs-capacity-calculator");
  const params = await searchParams;
  return (
    <PageCanvas>
      <ToolPageHeader
        icon={<Database strokeWidth={2.2} />}
        toolPage={toolPage}
      />
      <ZfsCapacityCalculator initialState={firstValue(params.state)} />
      <ToolPageMarkdown toolPage={toolPage} />
    </PageCanvas>
  );
}
