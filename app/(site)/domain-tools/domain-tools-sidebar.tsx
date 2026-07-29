import {
  ArrowLeftRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CalendarX,
  ClipboardList,
  FileSearch,
  Globe,
  Languages,
  Layers,
  ListChecks,
  UserSearch,
} from "lucide-react";
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

const iconProps = { size: 15, strokeWidth: 2.2 } as const;

/** Routes that exist now. No planned entries, disabled links, or coming-soon labels. */
const tools = [
  { href: "/domain-tools/domain-lookup", icon: <FileSearch {...iconProps} />, id: "lookup", label: "Domain Registration Lookup" },
  { href: "/domain-tools/domain-age", icon: <CalendarClock {...iconProps} />, id: "age", label: "Domain Age Checker" },
  { href: "/domain-tools/domain-expiry", icon: <CalendarX {...iconProps} />, id: "expiry", label: "Domain Expiry Checker" },
  { href: "/domain-tools/domain-availability", icon: <BadgeCheck {...iconProps} />, id: "availability", label: "Domain Availability Checker" },
  { href: "/domain-tools/multi-tld-availability", icon: <Layers {...iconProps} />, id: "multi-tld", label: "Multi-TLD Availability" },
  { href: "/domain-tools/domain-owner", icon: <UserSearch {...iconProps} />, id: "owner", label: "Domain Registrant Lookup" },
  { href: "/domain-tools/domain-registrar", icon: <Building2 {...iconProps} />, id: "registrar", label: "Registrar Lookup" },
  { href: "/domain-tools/transfer-readiness", icon: <ArrowLeftRight {...iconProps} />, id: "transfer", label: "Domain Transfer Readiness" },
  { href: "/domain-tools/domain-report", icon: <ClipboardList {...iconProps} />, id: "report", label: "Domain Registration Report" },
  { href: "/domain-tools/epp-status-codes", icon: <ListChecks {...iconProps} />, id: "status-codes", label: "Domain status codes" },
  { href: "/domain-tools/punycode-converter", icon: <Languages {...iconProps} />, id: "punycode", label: "Punycode and IDN Converter" },
  { href: "/domain-tools/tld-directory", icon: <Globe {...iconProps} />, id: "tlds", label: "TLD Directory" },
] as const;

/** How many domain tools exist now; the home page card shows this count. */
export const domainToolCount = tools.length;

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
            icon: tool.icon,
            label: tool.label,
          }))}
        />
      </nav>
    </div>
  );
}
