import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { BookSearch } from "lucide-react";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpBookTitleAnalyzer } from "./kdp-book-title-analyzer";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function KdpBookTitleAnalyzerPage() {
  const toolPage = await getRequiredToolPage("kdp-book-title-analyzer");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<BookSearch strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <KdpBookTitleAnalyzer />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
