import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { RefreshCw } from "lucide-react";
import { DnsChangeCheckerFromUrl } from "./dns-change-checker-from-url";
import styles from "./dns-change-checker.module.css";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function DnsChangeCheckerPage() {
  const toolPage = await getRequiredToolPage("dns-change-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas className={styles.main}>
        <ToolPageHeader
          icon={<RefreshCw strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />
        <DnsChangeCheckerFromUrl />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
