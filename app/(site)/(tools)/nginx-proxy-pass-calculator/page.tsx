import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Route } from "lucide-react";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { NginxProxyPassCalculator } from "./nginx-proxy-pass-calculator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function NginxProxyPassCalculatorPage() {
  const toolPage = await getRequiredToolPage("nginx-proxy-pass-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<Route strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />
        <NginxProxyPassCalculator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
