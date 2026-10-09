import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { Tags } from "lucide-react";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpBackendKeywordsBuilder } from "./kdp-backend-keywords-builder";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function KdpBackendKeywordsBuilderPage() {
  const toolPage = await getRequiredToolPage("kdp-backend-keywords-builder");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<Tags strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <KdpBackendKeywordsBuilder />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
