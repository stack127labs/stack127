import { BookOpen } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../app-shell";
import { PageCanvas } from "../../../page-canvas";
import { KdpPageCountEstimator } from "./kdp-page-count-estimator";

export default async function KdpPageCountEstimatorPage() {
  const toolPage = await getRequiredToolPage("kdp-page-count-estimator");
  return (
    <AppShell mainLabel="KDP page count estimator">
      <PageCanvas>
        <ToolPageHeader icon={<BookOpen strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpPageCountEstimator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
