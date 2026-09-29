import { Tags } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpBackendKeywordsBuilder } from "./kdp-backend-keywords-builder";

export default async function KdpBackendKeywordsBuilderPage() {
  const toolPage = await getRequiredToolPage("kdp-backend-keywords-builder");
  return (
    <AppShell mainLabel="KDP backend keywords builder">
      <PageCanvas>
        <ToolPageHeader icon={<Tags strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpBackendKeywordsBuilder />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
