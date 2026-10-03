import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Languages } from "lucide-react";
import { PunycodeTool } from "./punycode-tool";

export default async function PunycodeConverterPage() {
  const toolPage = await getRequiredToolPage("punycode-converter");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className="domain-tool-main">
        <ToolPageHeader
          icon={<Languages strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <PunycodeTool />

        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
