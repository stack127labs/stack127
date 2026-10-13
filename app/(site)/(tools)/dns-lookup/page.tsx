import "@/app/ui/tools/dns/dns-tools.css";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Search } from "lucide-react";
import { DnsLookupFromUrl } from "./dns-lookup-from-url";
import styles from "./dns-lookup-content.module.css";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function DnsLookupPage() {
  const toolPage = await getRequiredToolPage("dns-lookup");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas className="dns-lookup-main">
        <ToolPageHeader
          icon={<Search strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />

        <DnsLookupFromUrl />

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
