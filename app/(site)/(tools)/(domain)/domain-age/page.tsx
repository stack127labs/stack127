import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { CalendarClock } from "lucide-react";
import { DomainAgeFromUrl } from "./domain-age-from-url";
import styles from "./domain-age-content.module.css";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function DomainAgePage() {
  const toolPage = await getRequiredToolPage("domain-age");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas className="domain-tool-main">
        <ToolPageHeader
          icon={<CalendarClock strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />

        <DomainAgeFromUrl />

        <div className={styles.guide}>
          <ToolPageArticle>
            <Usage />
            <Article />
          </ToolPageArticle>
        </div>
      </PageCanvas>
    </ToolPageShell>
  );
}
