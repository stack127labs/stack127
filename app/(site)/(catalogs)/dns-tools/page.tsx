import { Network } from "lucide-react";
import { AppShell } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { siteSpotDnsToolsArt } from "../../art/site--spot-dns-tools";
import { caaArt } from "../_components/art/caa";
import { dnsChangeArt } from "../_components/art/dns-change";
import { dnsLookupArt } from "../_components/art/dns-lookup";
import { dnsTraceArt } from "../_components/art/dns-trace";
import { dnssecArt } from "../_components/art/dnssec";
import { nameserverArt } from "../_components/art/nameserver";
import { soaArt } from "../_components/art/soa";
import { ToolCatalog, type CatalogTool } from "../../../ui/catalogs/tool-catalog";
import { ToolCatalogSidebar } from "../../../ui/catalogs/tool-catalog-sidebar";

const tools: CatalogTool[] = [
  {
    href: "/dns-lookup",
    name: "DNS lookup",
    description: "See the records returned by a public resolver or the domain's authoritative nameserver.",
    art: dnsLookupArt,
  },
  {
    href: "/dns-trace",
    name: "DNS trace",
    description: "Follow referrals from the root servers to find where a lookup stops.",
    art: dnsTraceArt,
  },
  {
    href: "/dns-change-checker",
    name: "DNS change checker",
    description: "Compare the authoritative answer with the copies still held by public resolver caches.",
    art: dnsChangeArt,
  },
  {
    href: "/nameserver-checker",
    name: "Nameserver checker",
    description: "Check the parent handoff, glue records, and whether every nameserver answers.",
    art: nameserverArt,
  },
  {
    href: "/dnssec-checker",
    name: "DNSSEC checker",
    description: "Validate the signed chain from the root to one DNS answer.",
    art: dnssecArt,
  },
  {
    href: "/soa-checker",
    name: "SOA checker",
    description: "Compare the serial and timing values served by every nameserver.",
    art: soaArt,
  },
  {
    href: "/caa-checker",
    name: "CAA checker",
    description: "Find which certificate authorities may issue normal and wildcard certificates.",
    art: caaArt,
  },
];

export default function DnsToolsPage() {
  return (
    <AppShell
      mainLabel="DNS tools"
      menuLabel="Tool catalogs"
      sidebar={<ToolCatalogSidebar active="dns-tools" />}
      sidebarLabel="Tool catalogs sidebar"
    >
      <EntryHero art={siteSpotDnsToolsArt}>
        <PageHeader>
          <h1>
            <PageTitleIcon>
              <Network strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            DNS <mark>tools</mark> to check records and find what broke
          </h1>
          <p>
            Look up current records, trace referrals, compare cached answers, and check the DNS
            settings that affect websites, email, and certificates.
          </p>
        </PageHeader>
      </EntryHero>
      <PageCanvas>
        <ToolCatalog heading="Choose a DNS check" tools={tools} />
      </PageCanvas>
    </AppShell>
  );
}
