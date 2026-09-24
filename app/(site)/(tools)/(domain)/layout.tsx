import type { ReactNode } from "react";
import { AppShell } from "@/app/ui/site/app-shell";
import { DomainToolsSidebar } from "@/app/(site)/(catalogs)/domain-tools/domain-tools-sidebar";
import "@/app/(site)/(catalogs)/domain-tools/domain-tools.css";

export default function DomainToolLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell mainLabel="Domain tool content" menuLabel="Domain tools" sidebar={<DomainToolsSidebar />} sidebarLabel="Domain tools sidebar">
      {children}
    </AppShell>
  );
}
