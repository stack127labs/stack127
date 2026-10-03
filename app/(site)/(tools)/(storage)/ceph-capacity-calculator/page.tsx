import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ServerCog } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { CephCapacityCalculatorFromUrl } from "./ceph-capacity-calculator-from-url";

export default async function CephCapacityCalculatorPage() {
  const toolPage = await getRequiredToolPage("ceph-capacity-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<ServerCog strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <CephCapacityCalculatorFromUrl />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
