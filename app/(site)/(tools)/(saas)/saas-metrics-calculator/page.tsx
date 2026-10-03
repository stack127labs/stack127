
import { CircleDollarSign } from "lucide-react";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { SaaSMetricsCalculator } from "./saas-metrics-calculator";

export default async function SaaSMetricsCalculatorPage() {
  const toolPage = await getRequiredToolPage("saas-metrics-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<CircleDollarSign strokeWidth={2.2} />} toolPage={toolPage} />
        <SaaSMetricsCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
