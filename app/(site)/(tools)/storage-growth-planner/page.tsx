import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Calculator } from "lucide-react";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { StorageGrowthPlannerFromUrl } from "./storage-growth-planner-from-url";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function StorageGrowthPlannerPage() {
  const toolPage = await getRequiredToolPage("storage-growth-planner");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<Calculator strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />
        <StorageGrowthPlannerFromUrl />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
