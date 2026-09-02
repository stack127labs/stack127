import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import "../../(catalogs)/dns-tools/dns-tools.css";
import { Search } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { DnsToolsSidebar } from "../../(catalogs)/dns-tools/dns-tools-sidebar";
import { DnsLookupTool } from "./dns-lookup-tool";
import type { DnsResolver, DnsSelection } from "@/lib/dns/types.ts";
import { isDnsResolver } from "@/lib/dns/resolvers.ts";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function initialSelection(value: string): DnsSelection {
  const allowed = new Set(["all", "A", "AAAA", "CNAME", "MX", "NS", "TXT", "CAA", "SOA", "SRV", "DS", "DNSKEY", "PTR"]);
  const normalized = value === "all" || value === "common" ? "all" : value.toUpperCase();
  return allowed.has(normalized) ? normalized as DnsSelection : "all";
}

export default async function DnsLookupPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("dns-lookup");
  const params = await searchParams;
  const resolverValue = firstValue(params.resolver);
  const resolver: DnsResolver = isDnsResolver(resolverValue) ? resolverValue : "cloudflare";

  return (
    <AppShell
      mainLabel="DNS lookup"
      menuLabel="DNS tools"
      sidebar={<DnsToolsSidebar active="lookup" />}
      sidebarLabel="DNS lookup sidebar"
    >
      <main className="dns-lookup-main">
        <ToolPageHeader
          icon={<Search strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DnsLookupTool
          initialName={firstValue(params.name)}
          initialResolver={resolver}
          initialSelection={initialSelection(firstValue(params.type))}
        />

        <ToolPageMarkdown toolPage={toolPage} />
      </main>
    </AppShell>
  );
}
