import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { HardDrive } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
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
  );
}
