import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { HardDrive } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageCanvas } from "../../../page-canvas";
import { StorageToolsSidebar } from "../../(catalogs)/storage-tools/storage-tools-sidebar";
import snapshotData from "./data/drive-reliability-snapshot.json";
import { DriveReliabilityExplorer } from "./drive-reliability";
import type { DriveReliabilitySnapshot } from "@/lib/drive-reliability";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function DriveReliabilityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const toolPage = await getRequiredToolPage("drive-reliability");
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="Drive reliability explorer"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="drive-reliability" />}
      sidebarLabel="Storage tools sidebar"
    >
      <PageCanvas>
        <ToolPageHeader
          icon={<HardDrive strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <DriveReliabilityExplorer
          initialState={firstValue(params.state)}
          snapshot={snapshotData as DriveReliabilitySnapshot}
        />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
