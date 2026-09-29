import { BookOpenText } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KindleUnlimitedKenpEarningsCalculator } from "./kindle-unlimited-kenp-earnings-calculator";

export default async function KindleUnlimitedKenpEarningsCalculatorPage() {
  const toolPage = await getRequiredToolPage("kindle-unlimited-kenp-earnings-calculator");
  return (
    <AppShell mainLabel="Kindle Unlimited KENP earnings calculator">
      <PageCanvas>
        <ToolPageHeader icon={<BookOpenText strokeWidth={2.2} />} toolPage={toolPage} />
        <KindleUnlimitedKenpEarningsCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
