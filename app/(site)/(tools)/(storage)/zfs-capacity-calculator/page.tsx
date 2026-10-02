import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Database } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { ZfsCapacityCalculatorFromUrl } from "./zfs-capacity-calculator-from-url";

export default async function ZfsCapacityCalculatorPage() {
  const toolPage = await getRequiredToolPage("zfs-capacity-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<Database strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <ZfsCapacityCalculatorFromUrl />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
