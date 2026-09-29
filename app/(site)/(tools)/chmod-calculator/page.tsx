import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Terminal } from "lucide-react";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { ChmodCalculator } from "./chmod-calculator";

export default async function ChmodCalculatorPage() {
  const toolPage = await getRequiredToolPage("chmod-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<Terminal strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <ChmodCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
