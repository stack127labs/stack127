import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import "../../(catalogs)/domain-tools/domain-tools.css";
import { CalendarX } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../../(catalogs)/domain-tools/domain-tools-sidebar";
import { DomainExpiryTool } from "./domain-expiry-tool";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export default async function DomainExpiryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("domain-expiry");
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="Domain Expiry Checker"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="expiry" />}
      sidebarLabel="Domain tools sidebar"
    >
      <main className="domain-tool-main">
        <ToolPageHeader
          icon={<CalendarX strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DomainExpiryTool initialName={first(params.name)} />

        <ToolPageMarkdown toolPage={toolPage} />
      </main>
    </AppShell>
  );
}
