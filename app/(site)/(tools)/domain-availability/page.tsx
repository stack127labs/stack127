import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import "../../(catalogs)/domain-tools/domain-tools.css";
import { BadgeCheck } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../../(catalogs)/domain-tools/domain-tools-sidebar";
import { DomainAvailabilityTool } from "./domain-availability-tool";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export default async function DomainAvailabilityPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("domain-availability");
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="Domain Availability Checker"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="availability" />}
      sidebarLabel="Domain tools sidebar"
    >
      <main className="domain-tool-main">
        <ToolPageHeader
          icon={<BadgeCheck strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DomainAvailabilityTool initialName={first(params.name)} />
        <ToolPageMarkdown toolPage={toolPage} />
      </main>
    </AppShell>
  );
}
