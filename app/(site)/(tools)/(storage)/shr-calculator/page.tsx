import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { HardDrive } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { ShrCalculatorFromUrl } from "./shr-calculator-from-url";

export default async function ShrCalculatorPage() {
  const toolPage = await getRequiredToolPage("shr-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<HardDrive strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <ShrCalculatorFromUrl />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
