import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { FileCheck2 } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { DockerComposeChecker } from "./docker-compose-checker";

export default async function DockerComposeCheckerPage() {
  const toolPage = await getRequiredToolPage("docker-compose-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<FileCheck2 strokeWidth={2.2} />} toolPage={toolPage} />
        <DockerComposeChecker />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
