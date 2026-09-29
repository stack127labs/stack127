import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { BookOpenText } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KindleUnlimitedKenpEarningsCalculator } from "./kindle-unlimited-kenp-earnings-calculator";

export default async function KindleUnlimitedKenpEarningsCalculatorPage() {
  const toolPage = await getRequiredToolPage("kindle-unlimited-kenp-earnings-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<BookOpenText strokeWidth={2.2} />} toolPage={toolPage} />
        <KindleUnlimitedKenpEarningsCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
