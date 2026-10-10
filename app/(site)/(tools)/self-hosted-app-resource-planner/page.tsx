import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { HardDrive } from "lucide-react";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { SelfHostedAppResourcePlanner } from "./self-hosted-app-resource-planner";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function SelfHostedAppResourcePlannerPage() {
  const toolPage = await getRequiredToolPage("self-hosted-app-resource-planner");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<HardDrive strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <SelfHostedAppResourcePlanner />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
