import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { FileKey } from "lucide-react";
import { CaaCheckerFromUrl } from "./caa-checker-from-url";
import styles from "@/app/ui/tools/dns/dns-diagnostics.module.css";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function CaaCheckerPage() {
  const toolPage = await getRequiredToolPage("caa-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas className={styles.main}>
        <ToolPageHeader
          icon={<FileKey strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />

        <CaaCheckerFromUrl />

        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
