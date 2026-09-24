import { HardDrive } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { SelfHostedAppResourcePlanner } from "./self-hosted-app-resource-planner";

export default async function SelfHostedAppResourcePlannerPage() {
  const toolPage = await getRequiredToolPage("self-hosted-app-resource-planner");

  return (
    <AppShell mainLabel="Self-hosted app resource planner">
      <PageCanvas>
        <ToolPageHeader icon={<HardDrive strokeWidth={2.2} />} toolPage={toolPage} />
        <SelfHostedAppResourcePlanner />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
