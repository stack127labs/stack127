import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { FileSearch } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageCanvas } from "../../../page-canvas";
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
