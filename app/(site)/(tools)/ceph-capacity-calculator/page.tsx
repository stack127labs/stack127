import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ServerCog } from "lucide-react";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { StorageToolsSidebar } from "../../(catalogs)/storage-tools/storage-tools-sidebar";
import { CephCapacityCalculator } from "./ceph-capacity-calculator";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function CephCapacityCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const toolPage = await getRequiredToolPage("ceph-capacity-calculator");
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="Ceph capacity planner"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="ceph" />}
      sidebarLabel="Ceph planner sidebar"
    >
      <PageCanvas>
        <ToolPageHeader
          icon={<ServerCog strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <CephCapacityCalculator initialState={firstValue(params.state)} />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
