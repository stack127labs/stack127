import { CalendarDays } from "lucide-react";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { MrrWaterfallCalculator } from "./mrr-waterfall-calculator";

export default async function MrrWaterfallCalculatorPage() {
  const toolPage = await getRequiredToolPage("mrr-waterfall-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<CalendarDays strokeWidth={2.2} />} toolPage={toolPage} />
        <MrrWaterfallCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
