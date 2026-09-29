import { FileText } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpBookDescriptionFormatter } from "./kdp-book-description-formatter";

export default async function KdpBookDescriptionFormatterPage() {
  const toolPage = await getRequiredToolPage("kdp-book-description-formatter");
  return (
    <AppShell mainLabel="KDP book description formatter and preview">
      <PageCanvas>
        <ToolPageHeader icon={<FileText strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpBookDescriptionFormatter />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
