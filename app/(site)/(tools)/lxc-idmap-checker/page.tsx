import { FileCheck2 } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { LxcIdmapChecker } from "./lxc-idmap-checker";

export default async function LxcIdmapCheckerPage() {
  const toolPage = await getRequiredToolPage("lxc-idmap-checker");
  return (
    <AppShell mainLabel="LXC ID mapping checker">
      <PageCanvas>
        <ToolPageHeader icon={<FileCheck2 strokeWidth={2.2} />} toolPage={toolPage} />
        <LxcIdmapChecker />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
