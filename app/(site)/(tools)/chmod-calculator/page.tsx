import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Terminal } from "lucide-react";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { ChmodCalculator } from "./chmod-calculator";

export default async function ChmodCalculatorPage() {
  const toolPage = await getRequiredToolPage("chmod-calculator");
  return (
    <AppShell mainLabel="chmod calculator">
      <PageCanvas>
        <ToolPageHeader
          icon={<Terminal strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <ChmodCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
