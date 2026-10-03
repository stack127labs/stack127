import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { Network } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { IpAsnLookupFromUrl } from "./ip-asn-lookup-from-url";
import "./ip-asn-lookup.css";

export default async function IpAsnLookupPage() {
  const toolPage = await getRequiredToolPage("ip-asn-lookup");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main">
        <ToolPageHeader icon={<Network strokeWidth={2.2} />} toolPage={toolPage} />
        <IpAsnLookupFromUrl />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
