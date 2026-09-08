import { Layers3 } from "lucide-react";
import { AppShell } from "@/app/app-shell";
import { EntryHero } from "@/app/entry-hero";
import { PageCanvas } from "@/app/page-canvas";
import { PageHeader } from "@/app/page-header";
import { PageTitleIcon } from "@/app/page-title-icon";
import { siteSpotStorageToolsArt } from "../../art/site--spot-storage-tools";
import { cephArt } from "../_components/art/ceph";
import { driveReliabilityArt } from "../_components/art/drive-reliability";
import { raidArt } from "../_components/art/raid";
import { raidzExpansionArt } from "../_components/art/raidz-expansion";
import { rebuildArt } from "../_components/art/rebuild";
import { shrArt } from "../_components/art/shr";
import { snapraidMergerfsArt } from "../_components/art/snapraid-mergerfs";
import { storageGrowthArt } from "../_components/art/storage-growth";
import { storageLayoutArt } from "../_components/art/storage-layout";
import { unraidArt } from "../_components/art/unraid";
import { zfsCapacityArt } from "../_components/art/zfs-capacity";
import { zfsPaddingArt } from "../_components/art/zfs-padding";
import { ToolCatalog, type CatalogTool } from "../_components/tool-catalog";
import { ToolCatalogSidebar } from "../_components/tool-catalog-sidebar";

const tools: CatalogTool[] = [
  {
    href: "/raid-calculator",
    name: "RAID calculator",
    description: "Compare RAID capacity, mixed-drive waste, group layouts, and failure boundaries.",
    art: raidArt,
  },
  {
    href: "/zfs-capacity-calculator",
    name: "ZFS capacity calculator",
    description: "Model vdevs, RAIDZ allocation, slop space, special roles, and planning headroom.",
    art: zfsCapacityArt,
  },
  {
    href: "/zfs-padding-calculator",
    name: "ZFS padding calculator",
    description: "See how one block is divided into data, parity, and padding.",
    art: zfsPaddingArt,
  },
  {
    href: "/raidz-expansion-planner",
    name: "RAIDZ expansion planner",
    description: "Compare capacity as a RAIDZ vdev grows by one drive at a time.",
    art: raidzExpansionArt,
  },
  {
    href: "/shr-calculator",
    name: "SHR calculator",
    description: "Estimate fresh-pool SHR-1 or SHR-2 capacity from a mixed set of drive sizes.",
    art: shrArt,
  },
  {
    href: "/unraid-calculator",
    name: "Unraid calculator",
    description: "Assign parity and data roles, then check capacity and the size limit for a future drive.",
    art: unraidArt,
  },
  {
    href: "/snapraid-mergerfs-planner",
    name: "SnapRAID and mergerfs planner",
    description: "Build reviewable SnapRAID and mergerfs configuration from your disk and mount paths.",
    art: snapraidMergerfsArt,
  },
  {
    href: "/drive-reliability",
    name: "Drive reliability explorer",
    description: "Compare observed Backblaze failure rates and exposure for specific drive models.",
    art: driveReliabilityArt,
  },
  {
    href: "/rebuild-calculator",
    name: "Rebuild exposure calculator",
    description: "Estimate rebuild time, source reads, and modeled read-error exposure while degraded.",
    art: rebuildArt,
  },
  {
    href: "/ceph-capacity-calculator",
    name: "Ceph capacity planner",
    description: "Model usable capacity, reserve, and the loss of the largest named failure domain.",
    art: cephArt,
  },
  {
    href: "/storage-growth-planner",
    name: "Storage growth planner",
    description: "Compare reserve, the first capacity shortfall, and total cost as stored data grows.",
    art: storageGrowthArt,
  },
  {
    href: "/storage-layout-advisor",
    name: "Storage layout advisor",
    description: "Compare layouts against your drives, failure target, and workload preference.",
    art: storageLayoutArt,
  },
];

export default function StorageToolsPage() {
  return (
    <AppShell
      mainLabel="Storage tools"
      menuLabel="Tool catalogs"
      sidebar={<ToolCatalogSidebar active="storage-tools" />}
      sidebarLabel="Tool catalogs sidebar"
    >
      <EntryHero art={siteSpotStorageToolsArt} wide>
        <PageHeader>
          <h1>
            <PageTitleIcon>
              <Layers3 strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Storage <mark>tools</mark> for planning arrays before buying drives
          </h1>
          <p>
            Compare capacity, protection, rebuild exposure, growth, and cost using the drives and
            layout you actually plan to run.
          </p>
        </PageHeader>
      </EntryHero>
      <PageCanvas>
        <ToolCatalog heading="Choose a storage planner" tools={tools} />
      </PageCanvas>
    </AppShell>
  );
}
