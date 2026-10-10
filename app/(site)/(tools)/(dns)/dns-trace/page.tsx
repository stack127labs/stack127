import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Route } from "lucide-react";
import { DnsTraceFromUrl } from "./dns-trace-from-url";
import styles from "./dns-trace.module.css";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function DnsTracePage() {
  const toolPage = await getRequiredToolPage("dns-trace");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className={styles.main}>
        <ToolPageHeader
          icon={<Route strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />

        <DnsTraceFromUrl />

        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
