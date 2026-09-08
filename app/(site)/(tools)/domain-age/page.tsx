import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import "../../(catalogs)/domain-tools/domain-tools.css";
import { CalendarClock } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../../(catalogs)/domain-tools/domain-tools-sidebar";
import { DomainAgeTool } from "./domain-age-tool";
import styles from "./domain-age-content.module.css";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

export default async function DomainAgePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const toolPage = await getRequiredToolPage("domain-age");
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="Domain Age Checker"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="age" />}
      sidebarLabel="Domain tools sidebar"
    >
      <main className="domain-tool-main">
        <ToolPageHeader
          icon={<CalendarClock strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DomainAgeTool initialName={first(params.name)} />

        <hr className="domain-divider" />

        <div className={styles.guide}>
          <ToolPageMarkdown toolPage={toolPage} />
        </div>
      </main>
    </AppShell>
  );
}
