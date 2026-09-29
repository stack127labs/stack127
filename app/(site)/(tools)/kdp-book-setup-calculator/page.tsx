import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { Ruler } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpBookSetupCalculator } from "./kdp-book-setup-calculator";

export default async function KdpBookSetupCalculatorPage() {
  const toolPage = await getRequiredToolPage("kdp-book-setup-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<Ruler strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpBookSetupCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
