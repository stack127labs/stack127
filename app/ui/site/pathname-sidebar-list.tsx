"use client";

import { usePathname } from "next/navigation";
import { SidebarList, type SidebarListItem } from "./sidebar-list";

export function PathnameSidebarList({ items }: { items: SidebarListItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarList
      items={items.map((item) => ({ ...item, active: pathname === item.href }))}
    />
  );
}
