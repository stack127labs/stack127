import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { FileSearch } from "lucide-react";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { DockerignoreTester } from "./dockerignore-tester";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function DockerignoreTesterPage() {
  const toolPage = await getRequiredToolPage("dockerignore-tester");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<FileSearch strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />
        <DockerignoreTester />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
