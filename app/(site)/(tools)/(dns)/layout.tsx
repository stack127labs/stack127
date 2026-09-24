import type { ReactNode } from "react";
import { AppShell } from "@/app/ui/site/app-shell";
import { DnsToolsSidebar } from "@/app/(site)/(catalogs)/dns-tools/dns-tools-sidebar";
import "@/app/(site)/(catalogs)/dns-tools/dns-tools.css";

export default function DnsToolLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell mainLabel="DNS tool content" menuLabel="DNS tools" sidebar={<DnsToolsSidebar />} sidebarLabel="DNS tools sidebar">
      {children}
    </AppShell>
  );
}
