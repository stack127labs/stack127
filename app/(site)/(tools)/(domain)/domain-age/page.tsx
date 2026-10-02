import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { CalendarClock } from "lucide-react";
import { DomainAgeFromUrl } from "./domain-age-from-url";
import styles from "./domain-age-content.module.css";

export default async function DomainAgePage() {
  const toolPage = await getRequiredToolPage("domain-age");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className="domain-tool-main">
        <ToolPageHeader
          icon={<CalendarClock strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DomainAgeFromUrl />

        <div className={styles.guide}>
          <ToolPageMarkdown toolPage={toolPage} />
        </div>
      </PageCanvas>
    </ToolPageShell>
  );
}
