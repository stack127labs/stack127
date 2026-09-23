import { Image as ImageIcon } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpImageDpiChecker } from "./kdp-image-dpi-checker";

export default async function KdpImageDpiCheckerPage() {
  const toolPage = await getRequiredToolPage("kdp-image-dpi-checker");
  return (
    <AppShell mainLabel="KDP image DPI checker">
      <PageCanvas>
        <ToolPageHeader icon={<ImageIcon strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpImageDpiChecker />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
