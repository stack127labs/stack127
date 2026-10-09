import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ShieldCheck } from "lucide-react";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { NfsFirewallRulesPlanner } from "./nfs-firewall-rules-planner";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function NfsFirewallRulesPage() {
  const toolPage = await getRequiredToolPage("nfs-firewall-rules");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<ShieldCheck strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />
        <NfsFirewallRulesPlanner />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
