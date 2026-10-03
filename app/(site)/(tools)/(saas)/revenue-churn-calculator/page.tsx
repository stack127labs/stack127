import { TrendingDown } from "lucide-react";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { RevenueChurnCalculator } from "./revenue-churn-calculator";

export default async function RevenueChurnCalculatorPage() {
  const toolPage = await getRequiredToolPage("revenue-churn-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<TrendingDown strokeWidth={2.2} />} toolPage={toolPage} />
        <RevenueChurnCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
