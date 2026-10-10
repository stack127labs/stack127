import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Layers } from "lucide-react";
import { MultiTldTool } from "./multi-tld-tool";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function MultiTldAvailabilityPage() {
  const toolPage = await getRequiredToolPage("multi-tld-availability");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas className="domain-tool-main">
        <ToolPageHeader
          icon={<Layers strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />

        <MultiTldTool />

        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
