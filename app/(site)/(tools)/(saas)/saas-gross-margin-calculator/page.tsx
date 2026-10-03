import { CircleDollarSign } from "lucide-react";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { SaaSGrossMarginCalculator } from "./saas-gross-margin-calculator";

export default async function SaaSGrossMarginCalculatorPage() {
  const toolPage = await getRequiredToolPage("saas-gross-margin-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<CircleDollarSign strokeWidth={2.2} />} toolPage={toolPage} />
        <SaaSGrossMarginCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
