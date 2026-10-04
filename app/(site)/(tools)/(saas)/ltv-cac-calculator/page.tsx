import { ChartColumn } from "lucide-react";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { LtvCacCalculator } from "./ltv-cac-calculator";

export default async function LtvCacCalculatorPage() {
  const toolPage = await getRequiredToolPage("ltv-cac-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<ChartColumn strokeWidth={2.2} />} toolPage={toolPage} />
        <LtvCacCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
