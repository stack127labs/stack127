import { FileCheck2 } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../app-shell";
import { PageCanvas } from "../../../page-canvas";
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
