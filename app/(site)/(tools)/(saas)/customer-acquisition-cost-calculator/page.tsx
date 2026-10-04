import { UserPlus } from "lucide-react";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { CustomerAcquisitionCostCalculator } from "./customer-acquisition-cost-calculator";

export default async function CustomerAcquisitionCostCalculatorPage() {
  const toolPage = await getRequiredToolPage("customer-acquisition-cost-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<UserPlus strokeWidth={2.2} />} toolPage={toolPage} />
        <CustomerAcquisitionCostCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
