import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { FileText } from "lucide-react";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpBookDescriptionFormatter } from "./kdp-book-description-formatter";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function KdpBookDescriptionFormatterPage() {
  const toolPage = await getRequiredToolPage("kdp-book-description-formatter");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<FileText strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <KdpBookDescriptionFormatter />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
