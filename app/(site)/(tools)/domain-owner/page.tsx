import { PageCanvas } from "@/app/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import "../../(catalogs)/domain-tools/domain-tools.css";
import { UserSearch } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../../(catalogs)/domain-tools/domain-tools-sidebar";
import { DomainOwnerTool } from "./domain-owner-tool";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export default async function DomainOwnerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("domain-owner");
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="Domain Registrant Lookup"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="owner" />}
      sidebarLabel="Domain tools sidebar"
    >
      <PageCanvas as="main" className="domain-tool-main">
        <ToolPageHeader
          icon={<UserSearch strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DomainOwnerTool initialName={first(params.name)} />

        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
