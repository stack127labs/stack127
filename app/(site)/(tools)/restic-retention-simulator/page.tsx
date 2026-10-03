import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { FileCheck2 } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { ResticRetentionSimulator } from "./restic-retention-simulator";

export default async function ResticRetentionSimulatorPage() {
  const toolPage = await getRequiredToolPage("restic-retention-simulator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<FileCheck2 strokeWidth={2.2} />} toolPage={toolPage} />
        <ResticRetentionSimulator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
