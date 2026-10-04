import { Scale } from "lucide-react";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { BreakEvenMrrCalculator } from "./break-even-mrr-calculator";

export default async function BreakEvenMrrCalculatorPage() {
  const toolPage = await getRequiredToolPage("break-even-mrr-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<Scale strokeWidth={2.2} />} toolPage={toolPage} />
        <BreakEvenMrrCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
