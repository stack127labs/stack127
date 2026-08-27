import { Database } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { PageHeader } from "../../../page-header";
import { PageCanvas } from "../../../page-canvas";
import { StorageToolsSidebar } from "../../(catalogs)/storage-tools/storage-tools-sidebar";
import { ZfsCapacityCalculator } from "./zfs-capacity-calculator";
import { ZfsCapacityGuide } from "./zfs-capacity-guide";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ZfsCapacityCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="ZFS pool capacity calculator"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="zfs" />}
      sidebarLabel="ZFS calculator sidebar"
    >
      <PageCanvas>
        <PageHeader>
          <h1>
            <PageTitleIcon>
              <Database strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            ZFS pool capacity <mark>calculator</mark> for mixed vdevs
          </h1>
          <p>
            Plan a fresh OpenZFS pool one top-level vdev at a time. Add equal drives quickly, edit
            any drive for mixed sizes, and see estimated writable capacity, planning headroom,
            per-vdev failure boundaries, and every modeled loss. The calculation stays in your
            browser and does not predict the exact free space of an installed or expanded pool.
          </p>
        </PageHeader>
        <ZfsCapacityCalculator initialState={firstValue(params.state)} />
        <ZfsCapacityGuide />
      </PageCanvas>
    </AppShell>
  );
}
