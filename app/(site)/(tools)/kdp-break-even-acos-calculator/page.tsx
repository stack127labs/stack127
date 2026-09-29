import { Gauge } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpBreakEvenAcosCalculator } from "./kdp-break-even-acos-calculator";

export default async function KdpBreakEvenAcosCalculatorPage() {
  const toolPage = await getRequiredToolPage("kdp-break-even-acos-calculator");
  return (
    <AppShell mainLabel="KDP break-even ACoS calculator">
      <PageCanvas>
        <ToolPageHeader icon={<Gauge strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpBreakEvenAcosCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
