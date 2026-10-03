import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { HardDrive } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import snapshotData from "./data/drive-reliability-snapshot.json";
import { DriveReliabilityFromUrl } from "./drive-reliability-from-url";
import type { DriveReliabilitySnapshot } from "@/lib/drive-reliability";

export default async function DriveReliabilityPage() {
  const toolPage = await getRequiredToolPage("drive-reliability");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<HardDrive strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <DriveReliabilityFromUrl snapshot={snapshotData as DriveReliabilitySnapshot} />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
