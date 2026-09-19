import { CircleDollarSign } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../app-shell";
import { PageCanvas } from "../../../page-canvas";
import { KdpRoyaltyCalculator } from "./kdp-royalty-calculator";

export default async function KdpRoyaltyCalculatorPage() {
  const toolPage = await getRequiredToolPage("kdp-royalty-calculator");
  return (
    <AppShell mainLabel="KDP royalty calculator">
      <PageCanvas>
        <ToolPageHeader icon={<CircleDollarSign strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpRoyaltyCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
