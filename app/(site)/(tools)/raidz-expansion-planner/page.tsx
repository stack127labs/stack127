import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ChevronsRight } from "lucide-react";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { RaidzExpansionPlannerFromUrl } from "./raidz-expansion-planner-from-url";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function RaidzExpansionPlannerPage() {
  const toolPage = await getRequiredToolPage("raidz-expansion-planner");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<ChevronsRight strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />
        <RaidzExpansionPlannerFromUrl />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
