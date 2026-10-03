import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { FileCheck2 } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { LxcIdmapChecker } from "./lxc-idmap-checker";

export default async function LxcIdmapCheckerPage() {
  const toolPage = await getRequiredToolPage("lxc-idmap-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<FileCheck2 strokeWidth={2.2} />} toolPage={toolPage} />
        <LxcIdmapChecker />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
