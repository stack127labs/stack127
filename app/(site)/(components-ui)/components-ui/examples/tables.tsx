import { ContentMarkdown } from "@/app/ui/content-markdown";
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

      <Example components={["ContentMarkdown", "TableFrame"]} note="Markdown tables get the same scroll frame. Use TableFrame directly when a page builds its own wide table." source="app/ui/content-markdown.tsx, app/ui/table-frame.tsx" title="Markdown table">
        <ContentMarkdown markdown={[
          "| Plan | Price | Storage | Users | Backups | Support |",
          "| --- | ---: | ---: | ---: | --- | --- |",
          "| Starter | $5 | 50 GB | 1 | Daily | Email |",
          "| Team | $20 | 500 GB | 10 | Hourly | Email and chat |",
          "| Business | $60 | 2 TB | 50 | Hourly | Priority |",
        ].join("\n")} />
      </Example>
    </>
  );
}
