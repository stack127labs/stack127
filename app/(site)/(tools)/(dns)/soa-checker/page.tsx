import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { FileClock } from "lucide-react";
import { SoaCheckerFromUrl } from "./soa-checker-from-url";
import styles from "./soa-checker.module.css";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function SoaCheckerPage() {
  const toolPage = await getRequiredToolPage("soa-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className={styles.main}>
        <ToolPageHeader
          icon={<FileClock strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />
        <SoaCheckerFromUrl />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
