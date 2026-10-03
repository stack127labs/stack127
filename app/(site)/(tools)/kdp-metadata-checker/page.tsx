import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { Tags } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpMetadataChecker } from "./kdp-metadata-checker";

export default async function KdpMetadataCheckerPage() {
  const toolPage = await getRequiredToolPage("kdp-metadata-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<Tags strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpMetadataChecker />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
