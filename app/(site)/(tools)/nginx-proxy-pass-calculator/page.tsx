import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Route } from "lucide-react";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { NginxProxyPassCalculator } from "./nginx-proxy-pass-calculator";

export default async function NginxProxyPassCalculatorPage() {
  const toolPage = await getRequiredToolPage("nginx-proxy-pass-calculator");
  return (
    <AppShell mainLabel="NGINX proxy_pass URI Calculator">
      <PageCanvas>
        <ToolPageHeader
          icon={<Route strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <NginxProxyPassCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
