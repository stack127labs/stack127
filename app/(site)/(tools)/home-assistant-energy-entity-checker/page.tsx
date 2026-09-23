import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Gauge } from "lucide-react";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { HomeAssistantEnergyEntityChecker } from "./home-assistant-energy-entity-checker";

export default async function HomeAssistantEnergyEntityCheckerPage() {
  const toolPage = await getRequiredToolPage("home-assistant-energy-entity-checker");
  return (
    <AppShell mainLabel="Home Assistant Energy Entity Eligibility Checker">
      <PageCanvas>
        <ToolPageHeader
          icon={<Gauge strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <HomeAssistantEnergyEntityChecker />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
