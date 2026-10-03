import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { FileCheck2 } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { RsyncFilterTester } from "./rsync-filter-tester";

export default async function RsyncFilterTesterPage() {
  const toolPage = await getRequiredToolPage("rsync-filter-tester");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<FileCheck2 strokeWidth={2.2} />} toolPage={toolPage} />
        <RsyncFilterTester />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
