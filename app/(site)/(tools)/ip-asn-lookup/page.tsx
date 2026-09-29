import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { Network } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { IpAsnLookupTool } from "./ip-asn-lookup-tool";
import "./ip-asn-lookup.css";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));
export default async function IpAsnLookupPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("ip-asn-lookup");
  const params = await searchParams;
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main">
        <ToolPageHeader icon={<Network strokeWidth={2.2} />} toolPage={toolPage} />
        <IpAsnLookupTool initialQuery={first(params.query)} />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
