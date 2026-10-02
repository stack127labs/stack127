import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ShieldCheck } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { Backup321CalculatorFromUrl } from "./backup-321-calculator-from-url";

export default async function Backup321CalculatorPage() {
  const toolPage = await getRequiredToolPage("backup-321-calculator");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<ShieldCheck strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <Backup321CalculatorFromUrl />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
