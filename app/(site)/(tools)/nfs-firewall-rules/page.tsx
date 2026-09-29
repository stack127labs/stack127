import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ShieldCheck } from "lucide-react";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { NfsFirewallRulesPlanner } from "./nfs-firewall-rules-planner";

export default async function NfsFirewallRulesPage() {
  const toolPage = await getRequiredToolPage("nfs-firewall-rules");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<ShieldCheck strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <NfsFirewallRulesPlanner />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
