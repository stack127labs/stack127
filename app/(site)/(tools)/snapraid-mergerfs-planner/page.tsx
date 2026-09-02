import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { HardDrive } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageCanvas } from "../../../page-canvas";
import { StorageToolsSidebar } from "../../(catalogs)/storage-tools/storage-tools-sidebar";
import { SnapraidMergerfsPlanner } from "./snapraid-mergerfs-planner";

export default async function SnapraidMergerfsPlannerPage() {
  const toolPage = await getRequiredToolPage("snapraid-mergerfs-planner");
  return (
    <AppShell
      mainLabel="SnapRAID and mergerfs config planner"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="snapraid-mergerfs" />}
      sidebarLabel="Storage tools sidebar"
    >
      <PageCanvas>
        <ToolPageHeader
          icon={<HardDrive strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <SnapraidMergerfsPlanner />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
