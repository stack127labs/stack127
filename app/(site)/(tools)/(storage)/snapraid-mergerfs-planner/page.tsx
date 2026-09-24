import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { HardDrive } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { SnapraidMergerfsPlanner } from "./snapraid-mergerfs-planner";

export default async function SnapraidMergerfsPlannerPage() {
  const toolPage = await getRequiredToolPage("snapraid-mergerfs-planner");
  return (
    <PageCanvas>
      <ToolPageHeader
        icon={<HardDrive strokeWidth={2.2} />}
        toolPage={toolPage}
      />
      <SnapraidMergerfsPlanner />
      <ToolPageMarkdown toolPage={toolPage} />
    </PageCanvas>
  );
}
