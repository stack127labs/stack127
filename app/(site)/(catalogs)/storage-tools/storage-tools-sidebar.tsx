import {
  Activity,
  ChevronsRight,
  Columns3,
  Database,
  GitBranch,
  HardDrive,
  LayoutGrid,
  RefreshCw,
  Server,
  ServerCog,
  TrendingUp,
} from "lucide-react";
import { SidebarLabel } from "@/app/app-shell";
import { SidebarList } from "@/app/sidebar-list";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "@/app/sidebar-panel";
import styles from "./storage-tools.module.css";

type StorageToolId =
  | "hub"
  | "raid"
  | "zfs"
  | "zfs-padding"
  | "raidz-expansion"
  | "shr"
  | "unraid"
  | "snapraid-mergerfs"
  | "drive-reliability"
  | "rebuild"
  | "ceph"
  | "storage-growth"
  | "layout-advisor";

type StorageToolsSidebarProps = {
  active: StorageToolId;
};

const iconProps = { size: 15, strokeWidth: 2.2 } as const;

const availableStorageTools = [
  { href: "/raid-calculator", icon: <HardDrive {...iconProps} />, id: "raid", label: "RAID calculator" },
  { href: "/zfs-capacity-calculator", icon: <Database {...iconProps} />, id: "zfs", label: "ZFS calculator" },
  { href: "/zfs-padding-calculator", icon: <Columns3 {...iconProps} />, id: "zfs-padding", label: "ZFS padding" },
  { href: "/raidz-expansion-planner", icon: <ChevronsRight {...iconProps} />, id: "raidz-expansion", label: "RAIDZ expansion" },
  { href: "/shr-calculator", icon: <HardDrive {...iconProps} />, id: "shr", label: "SHR calculator" },
  { href: "/unraid-calculator", icon: <Server {...iconProps} />, id: "unraid", label: "Unraid calculator" },
  { href: "/snapraid-mergerfs-planner", icon: <GitBranch {...iconProps} />, id: "snapraid-mergerfs", label: "SnapRAID and mergerfs" },
  { href: "/drive-reliability", icon: <Activity {...iconProps} />, id: "drive-reliability", label: "Drive reliability" },
  { href: "/rebuild-calculator", icon: <RefreshCw {...iconProps} />, id: "rebuild", label: "Rebuild exposure" },
  { href: "/ceph-capacity-calculator", icon: <ServerCog {...iconProps} />, id: "ceph", label: "Ceph capacity" },
  { href: "/storage-growth-planner", icon: <TrendingUp {...iconProps} />, id: "storage-growth", label: "Storage growth" },
  { href: "/storage-layout-advisor", icon: <LayoutGrid {...iconProps} />, id: "layout-advisor", label: "Layout advisor" },
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
