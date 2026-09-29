import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { FileSearch } from "lucide-react";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { DockerignoreTester } from "./dockerignore-tester";

export default async function DockerignoreTesterPage() {
  const toolPage = await getRequiredToolPage("dockerignore-tester");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<FileSearch strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <DockerignoreTester />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
