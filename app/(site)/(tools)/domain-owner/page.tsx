import "@/app/ui/tools/domain/domain-tools.css";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { UserSearch } from "lucide-react";
import { DomainOwnerFromUrl } from "./domain-owner-from-url";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function DomainOwnerPage() {
  const toolPage = await getRequiredToolPage("domain-owner");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas className="domain-tool-main">
        <ToolPageHeader
          icon={<UserSearch strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />

        <DomainOwnerFromUrl />

        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
