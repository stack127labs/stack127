import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { CalendarX } from "lucide-react";
import { DomainExpiryFromUrl } from "./domain-expiry-from-url";

export default async function DomainExpiryPage() {
  const toolPage = await getRequiredToolPage("domain-expiry");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className="domain-tool-main">
        <ToolPageHeader
          icon={<CalendarX strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DomainExpiryFromUrl />

        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
