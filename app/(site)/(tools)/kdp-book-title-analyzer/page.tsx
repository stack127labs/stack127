import { BookSearch } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpBookTitleAnalyzer } from "./kdp-book-title-analyzer";

export default async function KdpBookTitleAnalyzerPage() {
  const toolPage = await getRequiredToolPage("kdp-book-title-analyzer");
  return (
    <AppShell mainLabel="KDP book title analyzer">
      <PageCanvas>
        <ToolPageHeader icon={<BookSearch strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpBookTitleAnalyzer />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
