import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { HardDrive } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { UnraidCalculatorFromUrl } from "./unraid-calculator-from-url";

export default async function UnraidCalculatorPage() {
  const toolPage = await getRequiredToolPage("unraid-calculator");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<HardDrive strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <UnraidCalculatorFromUrl />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
