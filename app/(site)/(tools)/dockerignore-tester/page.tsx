import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { FileSearch } from "lucide-react";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { DockerignoreTester } from "./dockerignore-tester";

export default async function DockerignoreTesterPage() {
  const toolPage = await getRequiredToolPage("dockerignore-tester");
  return (
    <AppShell mainLabel=".dockerignore pattern tester">
      <PageCanvas>
        <ToolPageHeader
          icon={<FileSearch strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <DockerignoreTester />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
