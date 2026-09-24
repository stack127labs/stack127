import type { ReactNode } from "react";
import { AppShell } from "@/app/ui/site/app-shell";
import { StorageToolsSidebar } from "@/app/(site)/(catalogs)/storage-tools/storage-tools-sidebar";

export default function StorageToolLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell mainLabel="Storage tool content" menuLabel="Storage tools" sidebar={<StorageToolsSidebar />} sidebarLabel="Storage tools sidebar">
      {children}
    </AppShell>
  );
}
