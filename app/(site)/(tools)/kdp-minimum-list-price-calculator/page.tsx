import { Tag } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpMinimumListPriceCalculator } from "./kdp-minimum-list-price-calculator";

export default async function KdpMinimumListPriceCalculatorPage() {
  const toolPage = await getRequiredToolPage("kdp-minimum-list-price-calculator");
  return (
    <AppShell mainLabel="KDP minimum list price calculator">
      <PageCanvas>
        <ToolPageHeader icon={<Tag strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpMinimumListPriceCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
