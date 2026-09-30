import { UsersRound } from "lucide-react";
import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { CustomerChurnCalculator } from "./customer-churn-calculator";

export default async function CustomerChurnCalculatorPage() {
  const toolPage = await getRequiredToolPage("customer-churn-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<UsersRound strokeWidth={2.2} />} toolPage={toolPage} />
        <CustomerChurnCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
