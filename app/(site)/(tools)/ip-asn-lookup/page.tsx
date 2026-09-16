import { PageCanvas } from "@/app/page-canvas";
import { Network } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../app-shell";
import { IpAsnLookupSidebar } from "./ip-asn-lookup-sidebar";
import { IpAsnLookupTool } from "./ip-asn-lookup-tool";
import "./ip-asn-lookup.css";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));
export default async function IpAsnLookupPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("ip-asn-lookup");
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="IP and ASN registration lookup"
      menuLabel="Related lookups"
      sidebar={<IpAsnLookupSidebar />}
      sidebarLabel="Related lookups sidebar"
    >
      <PageCanvas as="main">
        <ToolPageHeader icon={<Network strokeWidth={2.2} />} toolPage={toolPage} />
        <IpAsnLookupTool initialQuery={first(params.query)} />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
