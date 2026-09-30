import { Activity } from "lucide-react";
import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { NetRevenueRetentionCalculator } from "./net-revenue-retention-calculator";

export default async function NetRevenueRetentionCalculatorPage() {
  const toolPage = await getRequiredToolPage("net-revenue-retention-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<Activity strokeWidth={2.2} />} toolPage={toolPage} />
        <NetRevenueRetentionCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
