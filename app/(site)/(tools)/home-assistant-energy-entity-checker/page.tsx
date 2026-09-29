import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Gauge } from "lucide-react";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { HomeAssistantEnergyEntityChecker } from "./home-assistant-energy-entity-checker";

export default async function HomeAssistantEnergyEntityCheckerPage() {
  const toolPage = await getRequiredToolPage("home-assistant-energy-entity-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<Gauge strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <HomeAssistantEnergyEntityChecker />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
