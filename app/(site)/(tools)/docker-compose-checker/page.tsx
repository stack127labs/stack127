import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { FileCheck2 } from "lucide-react";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { DockerComposeChecker } from "./docker-compose-checker";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function DockerComposeCheckerPage() {
  const toolPage = await getRequiredToolPage("docker-compose-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<FileCheck2 strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <DockerComposeChecker />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
