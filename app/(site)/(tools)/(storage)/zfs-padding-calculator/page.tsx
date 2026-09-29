import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Columns3 } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { ZfsPaddingCalculator } from "./zfs-padding-calculator";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ZfsPaddingCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const toolPage = await getRequiredToolPage("zfs-padding-calculator");
  const params = await searchParams;
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<Columns3 strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <ZfsPaddingCalculator initialState={firstValue(params.state)} />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
