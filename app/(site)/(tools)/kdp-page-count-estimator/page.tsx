import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { BookOpen } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpPageCountEstimator } from "./kdp-page-count-estimator";

export default async function KdpPageCountEstimatorPage() {
  const toolPage = await getRequiredToolPage("kdp-page-count-estimator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<BookOpen strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpPageCountEstimator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
