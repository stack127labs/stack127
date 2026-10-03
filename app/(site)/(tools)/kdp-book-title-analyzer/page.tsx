import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { BookSearch } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpBookTitleAnalyzer } from "./kdp-book-title-analyzer";

export default async function KdpBookTitleAnalyzerPage() {
  const toolPage = await getRequiredToolPage("kdp-book-title-analyzer");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<BookSearch strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpBookTitleAnalyzer />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
