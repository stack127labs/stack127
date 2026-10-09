import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { FileSearch } from "lucide-react";
import { DomainLookupFromUrl } from "./domain-lookup-from-url";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function DomainLookupPage() {
  const toolPage = await getRequiredToolPage("domain-lookup");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className="domain-tool-main">
        <ToolPageHeader
          icon={<FileSearch strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />

        <DomainLookupFromUrl />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
