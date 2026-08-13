import { ChevronsRight, Columns3, Database, HardDrive } from "lucide-react";
import { SidebarLabel } from "../../app-shell";
import { SidebarList } from "../../sidebar-list";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "../../sidebar-panel";
import styles from "./storage-tools.module.css";

type StorageToolsSidebarProps = {
  active: "hub" | "raid" | "zfs" | "zfs-padding" | "raidz-expansion";
};

const iconProps = { size: 15, strokeWidth: 2.2 } as const;

const availableStorageTools = [
  { href: "/raid-calculator", icon: <HardDrive {...iconProps} />, id: "raid", label: "RAID calculator" },
  { href: "/zfs-capacity-calculator", icon: <Database {...iconProps} />, id: "zfs", label: "ZFS calculator" },
  { href: "/zfs-padding-calculator", icon: <Columns3 {...iconProps} />, id: "zfs-padding", label: "ZFS padding" },
  { href: "/raidz-expansion-planner", icon: <ChevronsRight {...iconProps} />, id: "raidz-expansion", label: "RAIDZ expansion" },
] as const;

/** How many storage tools exist now; the home page card shows this count. */
export const storageToolCount = availableStorageTools.length;

export function StorageToolsSidebar({ active }: StorageToolsSidebarProps) {
  return (
    <div className={`${sidebarPanelClassName} ${styles.sidebarPanel}`}>
      <div className={sidebarPanelHeadingClassName}>
        <SidebarLabel>Storage tools</SidebarLabel>
      </div>
      <nav aria-label="Storage tools">
        <SidebarList
          items={availableStorageTools.map((tool) => ({
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
