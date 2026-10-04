import { Layers } from "lucide-react";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { CustomerLifetimeValueCalculator } from "./customer-lifetime-value-calculator";

export default async function CustomerLifetimeValueCalculatorPage() {
  const toolPage = await getRequiredToolPage("customer-lifetime-value-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<Layers strokeWidth={2.2} />} toolPage={toolPage} />
        <CustomerLifetimeValueCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
