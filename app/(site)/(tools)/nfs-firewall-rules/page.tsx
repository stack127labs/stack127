import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ShieldCheck } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageCanvas } from "../../../page-canvas";
import { NfsFirewallRulesPlanner } from "./nfs-firewall-rules-planner";

export default async function NfsFirewallRulesPage() {
  const toolPage = await getRequiredToolPage("nfs-firewall-rules");
  return (
    <AppShell mainLabel="NFS Firewall Rules Planner">
      <PageCanvas>
        <ToolPageHeader
          icon={<ShieldCheck strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <NfsFirewallRulesPlanner />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
