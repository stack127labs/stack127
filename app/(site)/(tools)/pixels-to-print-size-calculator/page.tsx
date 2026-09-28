import { Ruler } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { PixelsToPrintSizeCalculator } from "./pixels-to-print-size-calculator";

export default async function PixelsToPrintSizeCalculatorPage() {
  const toolPage = await getRequiredToolPage("pixels-to-print-size-calculator");
  return (
    <AppShell mainLabel="Pixels to print size calculator">
      <PageCanvas>
        <ToolPageHeader icon={<Ruler strokeWidth={2.2} />} toolPage={toolPage} />
        <PixelsToPrintSizeCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
