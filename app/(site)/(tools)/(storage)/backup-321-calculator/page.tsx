import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ShieldCheck } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { Backup321Calculator } from "./backup-321-calculator";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function Backup321CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const toolPage = await getRequiredToolPage("backup-321-calculator");
  const params = await searchParams;

  return (
    <PageCanvas>
      <ToolPageHeader
        icon={<ShieldCheck strokeWidth={2.2} />}
        toolPage={toolPage}
      />
      <Backup321Calculator initialState={firstValue(params.state)} />
      <ToolPageMarkdown toolPage={toolPage} />
    </PageCanvas>
  );
}
