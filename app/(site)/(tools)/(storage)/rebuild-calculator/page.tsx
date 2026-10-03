import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { HardDrive } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { RebuildCalculator } from "./rebuild-calculator";

export default async function RebuildCalculatorPage() {
  const toolPage = await getRequiredToolPage("rebuild-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<HardDrive strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <RebuildCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
