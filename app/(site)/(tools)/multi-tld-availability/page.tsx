import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import "../../(catalogs)/domain-tools/domain-tools.css";
import { Layers } from "lucide-react";
import { AppShell } from "../../../ui/site/app-shell";
import { DomainToolsSidebar } from "../../(catalogs)/domain-tools/domain-tools-sidebar";
import { MultiTldTool } from "./multi-tld-tool";

export default async function MultiTldAvailabilityPage() {
  const toolPage = await getRequiredToolPage("multi-tld-availability");
  return (
    <AppShell
      mainLabel="Multi-TLD Availability"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="multi-tld" />}
      sidebarLabel="Domain tools sidebar"
    >
      <PageCanvas as="main" className="domain-tool-main">
        <ToolPageHeader
          icon={<Layers strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <MultiTldTool />

        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
