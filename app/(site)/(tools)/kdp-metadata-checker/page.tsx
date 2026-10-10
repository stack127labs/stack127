import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { Tags } from "lucide-react";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpMetadataChecker } from "./kdp-metadata-checker";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function KdpMetadataCheckerPage() {
  const toolPage = await getRequiredToolPage("kdp-metadata-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<Tags strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <KdpMetadataChecker />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
