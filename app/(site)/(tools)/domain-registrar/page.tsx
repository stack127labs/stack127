import { PageCanvas } from "@/app/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import "../../(catalogs)/domain-tools/domain-tools.css";
import { Building2 } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../../(catalogs)/domain-tools/domain-tools-sidebar";
import { DomainRegistrarTool } from "./domain-registrar-tool";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export default async function DomainRegistrarPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("domain-registrar");
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="Registrar Lookup"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="registrar" />}
      sidebarLabel="Domain tools sidebar"
    >
      <PageCanvas as="main" className="domain-tool-main">
        <ToolPageHeader
          icon={<Building2 strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DomainRegistrarTool initialName={first(params.name)} />

        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
