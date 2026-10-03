import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ArrowLeftRight } from "lucide-react";
import { TransferReadinessFromUrl } from "./transfer-readiness-from-url";

export default async function TransferReadinessPage() {
  const toolPage = await getRequiredToolPage("transfer-readiness");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className="domain-tool-main">
        <ToolPageHeader
          icon={<ArrowLeftRight strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <TransferReadinessFromUrl />

        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
