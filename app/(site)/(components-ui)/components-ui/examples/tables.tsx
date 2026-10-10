import { ContentTable } from "@/app/ui/content-elements";
import { UiDataTable } from "@/app/ui/display";
import { Example } from "../gallery";

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
    </>
  );
}
