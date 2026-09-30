import { Coins } from "lucide-react";
import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { BurnMultipleCalculator } from "./burn-multiple-calculator";

export default async function BurnMultipleCalculatorPage() {
  const toolPage = await getRequiredToolPage("burn-multiple-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<Coins aria-hidden="true" strokeWidth={2.2} />} toolPage={toolPage} />
        <BurnMultipleCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
