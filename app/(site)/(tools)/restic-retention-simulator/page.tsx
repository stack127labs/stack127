import { FileCheck2 } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../app-shell";
import { PageCanvas } from "../../../page-canvas";
import { ResticRetentionSimulator } from "./restic-retention-simulator";

export default async function ResticRetentionSimulatorPage() {
  const toolPage = await getRequiredToolPage("restic-retention-simulator");
  return (
    <AppShell mainLabel="Restic retention simulator">
      <PageCanvas>
        <ToolPageHeader icon={<FileCheck2 strokeWidth={2.2} />} toolPage={toolPage} />
        <ResticRetentionSimulator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
