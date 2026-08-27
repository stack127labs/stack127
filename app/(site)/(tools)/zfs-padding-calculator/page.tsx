import { Columns3 } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { PageHeader } from "../../../page-header";
import { PageCanvas } from "../../../page-canvas";
import { StorageToolsSidebar } from "../../(catalogs)/storage-tools/storage-tools-sidebar";
import { ZfsPaddingCalculator } from "./zfs-padding-calculator";
import { ZfsPaddingGuide } from "./zfs-padding-guide";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ZfsPaddingCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="ZFS block size and padding calculator"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="zfs-padding" />}
      sidebarLabel="ZFS padding calculator sidebar"
    >
      <PageCanvas>
        <PageHeader>
          <h1>
            <PageTitleIcon>
              <Columns3 strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            ZFS block size and padding <mark>calculator</mark>
          </h1>
          <p>
            See how one uncompressed ZFS block is split into data, parity, sector rounding, and
            padding on a RAIDZ vdev. Compare block sizes and inspect the exact theoretical
            allocation before changing <code>recordsize</code> or <code>volblocksize</code>.
          </p>
        </PageHeader>
        <ZfsPaddingCalculator initialState={firstValue(params.state)} />
        <ZfsPaddingGuide />
      </PageCanvas>
    </AppShell>
  );
}
