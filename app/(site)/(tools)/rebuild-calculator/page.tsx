import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { HardDrive } from "lucide-react";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { StorageToolsSidebar } from "../../(catalogs)/storage-tools/storage-tools-sidebar";
import { RebuildCalculator } from "./rebuild-calculator";

export default async function RebuildCalculatorPage() {
  const toolPage = await getRequiredToolPage("rebuild-calculator");
  return (
    <AppShell
      mainLabel="Rebuild exposure calculator"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="rebuild" />}
      sidebarLabel="Rebuild calculator sidebar"
    >
      <PageCanvas>
        <ToolPageHeader
          icon={<HardDrive strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <RebuildCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
