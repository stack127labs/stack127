import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Database } from "lucide-react";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { StorageToolsSidebar } from "../../(catalogs)/storage-tools/storage-tools-sidebar";
import { ZfsCapacityCalculator } from "./zfs-capacity-calculator";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ZfsCapacityCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const toolPage = await getRequiredToolPage("zfs-capacity-calculator");
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="ZFS pool capacity calculator"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="zfs" />}
      sidebarLabel="ZFS calculator sidebar"
    >
      <PageCanvas>
        <ToolPageHeader
          icon={<Database strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <ZfsCapacityCalculator initialState={firstValue(params.state)} />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
