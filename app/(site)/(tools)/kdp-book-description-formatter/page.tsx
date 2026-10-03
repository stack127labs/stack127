import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { FileText } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpBookDescriptionFormatter } from "./kdp-book-description-formatter";

export default async function KdpBookDescriptionFormatterPage() {
  const toolPage = await getRequiredToolPage("kdp-book-description-formatter");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<FileText strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpBookDescriptionFormatter />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
