import { UsersRound } from "lucide-react";
import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ArpuArpaCalculator } from "./arpu-arpa-calculator";

export default async function ArpuArpaCalculatorPage() {
  const toolPage = await getRequiredToolPage("arpu-arpa-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<UsersRound strokeWidth={2.2} />} toolPage={toolPage} />
        <ArpuArpaCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
