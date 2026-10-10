import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { Image as ImageIcon } from "lucide-react";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpImageDpiChecker } from "./kdp-image-dpi-checker";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function KdpImageDpiCheckerPage() {
  const toolPage = await getRequiredToolPage("kdp-image-dpi-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<ImageIcon strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <KdpImageDpiChecker />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
