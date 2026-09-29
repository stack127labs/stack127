import { BookOpenCheck } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpPriceProfitCalculator } from "./kdp-price-profit-calculator";

export default async function KdpPriceProfitCalculatorPage() {
  const toolPage = await getRequiredToolPage("kdp-price-profit-calculator");
  return (
    <AppShell mainLabel="KDP price and profit calculator">
      <PageCanvas>
        <ToolPageHeader icon={<BookOpenCheck strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpPriceProfitCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
