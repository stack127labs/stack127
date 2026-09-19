import { Ruler } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../app-shell";
import { PageCanvas } from "../../../page-canvas";
import { KdpBookSetupCalculator } from "./kdp-book-setup-calculator";

export default async function KdpBookSetupCalculatorPage() {
  const toolPage = await getRequiredToolPage("kdp-book-setup-calculator");
  return (
    <AppShell mainLabel="KDP book setup calculator">
      <PageCanvas>
        <ToolPageHeader icon={<Ruler strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpBookSetupCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
