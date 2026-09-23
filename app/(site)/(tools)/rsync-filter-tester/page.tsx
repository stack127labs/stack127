import { FileCheck2 } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { RsyncFilterTester } from "./rsync-filter-tester";

export default async function RsyncFilterTesterPage() {
  const toolPage = await getRequiredToolPage("rsync-filter-tester");
  return (
    <AppShell mainLabel="Rsync filter tester">
      <PageCanvas>
        <ToolPageHeader icon={<FileCheck2 strokeWidth={2.2} />} toolPage={toolPage} />
        <RsyncFilterTester />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
