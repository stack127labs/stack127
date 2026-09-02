import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Columns3 } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageCanvas } from "../../../page-canvas";
import { StorageToolsSidebar } from "../../(catalogs)/storage-tools/storage-tools-sidebar";
import { ZfsPaddingCalculator } from "./zfs-padding-calculator";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ZfsPaddingCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const toolPage = await getRequiredToolPage("zfs-padding-calculator");
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="ZFS block size and padding calculator"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="zfs-padding" />}
      sidebarLabel="ZFS padding calculator sidebar"
    >
      <PageCanvas>
        <ToolPageHeader
          icon={<Columns3 strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <ZfsPaddingCalculator initialState={firstValue(params.state)} />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
