import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { BookOpen } from "lucide-react";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpPageCountEstimator } from "./kdp-page-count-estimator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function KdpPageCountEstimatorPage() {
  const toolPage = await getRequiredToolPage("kdp-page-count-estimator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<BookOpen strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <KdpPageCountEstimator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
