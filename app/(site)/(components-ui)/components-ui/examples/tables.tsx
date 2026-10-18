import { ContentTable } from "@/app/ui/content-elements";
import { UiDataTable } from "@/app/ui/display";
import { Example } from "../gallery";
import { NetworkLadder } from "@/app/ui/ad-networks/network-ladder";
import { NichesTable } from "@/app/ui/ad-networks/niches-table";
import { SiteNetworksTable } from "@/app/ui/ad-networks/site-view";
import { SitesTableDemo } from "./ad-network-demos";

export function TablesExamples() {
  return (
    <>
      <Example components={["UiDataTable"]} note="The first column is the row header. Number columns align right. On small screens each row turns into labeled lines." source="app/ui/display.tsx" title="Data table">
        <UiDataTable
          ariaLabel="Nameserver addresses"
          caption="Addresses returned by the authoritative nameservers."
          columns={[
            { id: "address", label: "Address" },
            { id: "network", label: "Network" },
            { id: "provider", label: "Provider" },
            { id: "asn", label: "ASN" },
            { id: "ttl", label: "TTL (s)", align: "right" },
          ]}
          rows={[
            { id: "one", cells: { address: "108.162.195.210", network: "108.162.195.0/24", provider: "Cloudflare", asn: "AS13335", ttl: "86,400" } },
            { id: "two", cells: { address: "2606:4700:58::a29f:c2d2", network: "2606:4700:50::/44", provider: "Cloudflare", asn: "AS13335", ttl: "86,400" } },
            { id: "three", cells: { address: "172.64.34.110", network: "172.64.32.0/22", provider: "Cloudflare", asn: "AS13335", ttl: "300" } },
          ]}
        />
      </Example>

      <Example
        components={["ContentTable", "TableFrame"]}
        note="A Markdown table in MDX gets a scroll frame and stops at reading width. Use TableFrame directly when a page builds its own wide table."
        source="app/ui/content-elements.tsx, app/ui/table-frame.tsx"
        title="Content table"
        usage={{ label: "MDX", code: `| Plan | Price | Storage | Users |
| --- | --- | --- | --- |
| Starter | $5 | 50 GB | 1 |
| Team | $20 | 500 GB | 10 |` }}
      >
        <ContentTable>
          <thead><tr><th>Plan</th><th>Price</th><th>Storage</th><th>Users</th><th>Backups</th><th>Support</th></tr></thead>
          <tbody>
            <tr><td>Starter</td><td>$5</td><td>50 GB</td><td>1</td><td>Daily</td><td>Email</td></tr>
            <tr><td>Team</td><td>$20</td><td>500 GB</td><td>10</td><td>Hourly</td><td>Email and chat</td></tr>
            <tr><td>Business</td><td>$60</td><td>2 TB</td><td>50</td><td>Hourly</td><td>Priority</td></tr>
          </tbody>
        </ContentTable>
      </Example>
      <Example
        components={["SitesTable"]}
        note="A long list of ad network sites (mockup table.sites). The server renders the first page; search, filters, sort, and pages load from the cached /api/ad-networks/sites route and keep their state in the URL (?q=&niche=&page=). Pass columns and sorts to show; the API's availableColumns, availableSorts, and availableFilters hide anything with no data yet. On phones each row becomes a two-line block. The first page here is sample data."
        source="app/ui/ad-networks/sites-table.tsx"
        title="Sites table"
      >
        <SitesTableDemo />
      </Example>
      <Example
        components={["NichesTable"]}
        note="Every niche with its count, share of all sites, top three networks, and the easiest of those to join. Search narrows by name. The network filter swaps the share column for that network's share and sorts by it. Columns with no data hide. On phones rows become small blocks."
        source="app/ui/ad-networks/niches-table.tsx"
        title="Niches table"
      >
        <NichesTable
          description="The three networks used most in each niche, and the easiest of those three to join."
          id="niches-demo"
          networks={[{ value: "mediavine", label: "Mediavine" }, { value: "raptive", label: "Raptive" }, { value: "ezoic", label: "Ezoic" }]}
          rows={[
            { slug: "food", name: "Food", href: "/components-ui/tables", sites: 6320, live: 5878, share: 0.18, top: [{ name: "Mediavine", share: 0.41 }, { name: "Raptive", share: 0.22 }, { name: "Journey", share: 0.18 }], easiest: { name: "Journey", rule: "1,000 sessions a month" }, networkShares: { mediavine: 0.41, raptive: 0.22, ezoic: 0.09 } },
            { slug: "home-diy", name: "Home & DIY", sites: 3410, live: 3205, share: 0.097, top: [{ name: "Mediavine", share: 0.33 }, { name: "Raptive", share: 0.21 }, { name: "Journey", share: 0.19 }], easiest: { name: "Journey", rule: "1,000 sessions a month" }, networkShares: { mediavine: 0.33, raptive: 0.21, ezoic: 0.11 } },
            { slug: "gaming", name: "Gaming", sites: 1840, live: 1702, share: 0.052, top: [{ name: "Playwire", share: 0.21 }, { name: "NitroPay", share: 0.18 }, { name: "Ezoic", share: 0.15 }], easiest: { name: "NitroPay", rule: "No traffic minimum" }, networkShares: { mediavine: 0.03, raptive: 0.04, ezoic: 0.15 } },
          ]}
          title="Which ad networks does each niche use?"
        />
      </Example>
      <Example
        components={["NetworkLadder"]}
        note="Every network on a niche's sites with its count, share of the niche, and what it takes to join. The switch orders by most used or easiest to join, and hides when no network has a rule. On phones the share column hides."
        source="app/ui/ad-networks/network-ladder.tsx"
        title="Network ladder"
      >
        <NetworkLadder
          countLabel="food sites"
          description="Every network that runs on food sites, with what it takes to join."
          id="ladder-demo"
          rows={[
            { name: "Mediavine", href: "/components-ui/tables", sites: 2591, rule: "50,000 sessions a month", ruleRank: 50000 },
            { name: "Raptive", sites: 1390, rule: "100,000 pageviews a month", ruleRank: 100000 },
            { name: "Journey", sites: 1138, rule: "1,000 sessions a month", ruleRank: 1000 },
            { name: "Ezoic", sites: 569, rule: "No traffic minimum", ruleRank: 0 },
            { name: "SHE Media", sites: 126, rule: null, ruleRank: null },
            { name: "AdPushup", sites: 25, rule: "$2,000 ad revenue a month", ruleRank: 200000 },
          ]}
          shareLabel="share of food sites"
          title="Which ad networks do food sites use?"
          total={6320}
        />
      </Example>
      <Example
        components={["SiteNetworksTable"]}
        note="The networks on one site, with what its ads.txt says and whether the network's own seller list agrees. Confirmed rows get a filled dot. On phones each row becomes a small block."
        source="app/ui/ad-networks/site-view.tsx"
        title="Site networks table"
      >
        <SiteNetworksTable caption="Ad networks on tinykitchenlab.com" rows={[
          { name: "Mediavine", href: "/components-ui/tables", logo: { src: "/ad-networks/logos/mediavine.png" }, says: "Names it as the ad manager", status: "Confirmed live", confirmed: true, since: "Mar 2021" },
          { name: "Amazon APS", logo: { src: "/ad-networks/logos/amazon-publisher-services.png" }, says: "Allows it to sell ad space", status: "Confirmed live", confirmed: true, since: "Jun 2022" },
          { name: "Google AdSense", logo: { src: "/ad-networks/logos/google-adsense.png" }, says: "Allows it to sell ad space", status: "Not in Google's seller list", confirmed: false, since: "Jan 2019" },
        ]} />
      </Example>
    </>
  );
}
