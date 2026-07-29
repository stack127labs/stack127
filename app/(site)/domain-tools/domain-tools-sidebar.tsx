import { SidebarLabel } from "../../app-shell";
import { SidebarList } from "../../sidebar-list";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "../../sidebar-panel";

export type DomainToolId =
  | "hub"
  | "lookup"
  | "age"
  | "expiry"
  | "availability"
  | "owner"
  | "registrar"
  | "status-codes"
  | "transfer"
  | "report"
  | "punycode"
  | "tlds"
  | "multi-tld";

/** Routes that exist now. No planned entries, disabled links, or coming-soon labels. */
const tools = [
  { href: "/domain-tools/domain-lookup", id: "lookup", label: "Domain Registration Lookup" },
  { href: "/domain-tools/domain-age", id: "age", label: "Domain Age Checker" },
  { href: "/domain-tools/domain-expiry", id: "expiry", label: "Domain Expiry Checker" },
  { href: "/domain-tools/domain-availability", id: "availability", label: "Domain Availability Checker" },
  { href: "/domain-tools/multi-tld-availability", id: "multi-tld", label: "Multi-TLD Availability" },
  { href: "/domain-tools/domain-owner", id: "owner", label: "Domain Registrant Lookup" },
  { href: "/domain-tools/domain-registrar", id: "registrar", label: "Registrar Lookup" },
  { href: "/domain-tools/transfer-readiness", id: "transfer", label: "Domain Transfer Readiness" },
  { href: "/domain-tools/domain-report", id: "report", label: "Domain Registration Report" },
  { href: "/domain-tools/epp-status-codes", id: "status-codes", label: "Domain status codes" },
  { href: "/domain-tools/punycode-converter", id: "punycode", label: "Punycode and IDN Converter" },
  { href: "/domain-tools/tld-directory", id: "tlds", label: "TLD Directory" },
] as const;

export function DomainToolsSidebar({ active }: { active: DomainToolId }) {
  return (
    <div className={sidebarPanelClassName}>
      <div className={sidebarPanelHeadingClassName}>
        <SidebarLabel>Domain tools</SidebarLabel>
      </div>
      <nav aria-label="Domain tools">
        <SidebarList
          items={tools.map((tool) => ({
            active: active === tool.id,
            href: tool.href,
            label: tool.label,
          }))}
        />
      </nav>
    </div>
  );
}
