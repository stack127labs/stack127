import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { HardDrive } from "lucide-react";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { StorageToolsSidebar } from "../../(catalogs)/storage-tools/storage-tools-sidebar";
import { UnraidCalculator } from "./unraid-calculator";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function UnraidCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const toolPage = await getRequiredToolPage("unraid-calculator");
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="Unraid Main Array calculator"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="unraid" />}
      sidebarLabel="Storage tools sidebar"
    >
      <PageCanvas>
        <ToolPageHeader
          icon={<HardDrive strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <UnraidCalculator initialState={firstValue(params.state)} />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
