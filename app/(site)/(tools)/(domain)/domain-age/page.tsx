import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { CalendarClock } from "lucide-react";
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
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className="domain-tool-main">
        <ToolPageHeader
          icon={<CalendarClock strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DomainAgeTool initialName={first(params.name)} />

        <div className={styles.guide}>
          <ToolPageMarkdown toolPage={toolPage} />
        </div>
      </PageCanvas>
    </ToolPageShell>
  );
}
