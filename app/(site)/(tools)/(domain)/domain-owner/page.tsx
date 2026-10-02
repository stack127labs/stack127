import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { UserSearch } from "lucide-react";
import { DomainOwnerFromUrl } from "./domain-owner-from-url";

export default async function DomainOwnerPage() {
  const toolPage = await getRequiredToolPage("domain-owner");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className="domain-tool-main">
        <ToolPageHeader
          icon={<UserSearch strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DomainOwnerFromUrl />

        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
