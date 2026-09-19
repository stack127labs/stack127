import { FileSearch } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../app-shell";
import { PageCanvas } from "../../../page-canvas";
import { KdpPdfPreflightChecker } from "./kdp-pdf-preflight-checker";

export default async function KdpPdfPreflightCheckerPage() {
  const toolPage = await getRequiredToolPage("kdp-pdf-preflight-checker");
  return (
    <AppShell mainLabel="KDP PDF preflight checker">
      <PageCanvas>
        <ToolPageHeader icon={<FileSearch strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpPdfPreflightChecker />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
