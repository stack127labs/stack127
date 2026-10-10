import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Server } from "lucide-react";
import { NameserverCheckerFromUrl } from "./nameserver-checker-from-url";
import styles from "./nameserver-checker.module.css";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function NameserverCheckerPage() {
  const toolPage = await getRequiredToolPage("nameserver-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas className={styles.main}>
        <ToolPageHeader
          icon={<Server strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />
        <NameserverCheckerFromUrl />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
