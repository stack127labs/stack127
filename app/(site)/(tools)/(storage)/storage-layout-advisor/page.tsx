import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { HardDrive } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { StorageLayoutAdvisorFromUrl } from "./storage-layout-advisor-from-url";

export default async function StorageLayoutAdvisorPage() {
  const toolPage = await getRequiredToolPage("storage-layout-advisor");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<HardDrive strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <StorageLayoutAdvisorFromUrl />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
