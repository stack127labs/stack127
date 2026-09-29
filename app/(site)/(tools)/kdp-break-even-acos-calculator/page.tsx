import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { Gauge } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpBreakEvenAcosCalculator } from "./kdp-break-even-acos-calculator";

export default async function KdpBreakEvenAcosCalculatorPage() {
  const toolPage = await getRequiredToolPage("kdp-break-even-acos-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<Gauge strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpBreakEvenAcosCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
