import { FileCheck2 } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { MqttDiscoveryChecker } from "./mqtt-discovery-checker";

export default async function MqttDiscoveryCheckerPage() {
  const toolPage = await getRequiredToolPage("mqtt-discovery-checker");
  return (
    <AppShell mainLabel="MQTT discovery checker">
      <PageCanvas>
        <ToolPageHeader icon={<FileCheck2 strokeWidth={2.2} />} toolPage={toolPage} />
        <MqttDiscoveryChecker />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
