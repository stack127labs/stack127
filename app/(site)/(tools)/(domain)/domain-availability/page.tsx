import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { BadgeCheck } from "lucide-react";
import { DomainAvailabilityFromUrl } from "./domain-availability-from-url";

export default async function DomainAvailabilityPage() {
  const toolPage = await getRequiredToolPage("domain-availability");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className="domain-tool-main">
        <ToolPageHeader
          icon={<BadgeCheck strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DomainAvailabilityFromUrl />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
