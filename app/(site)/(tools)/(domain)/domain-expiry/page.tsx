import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { CalendarX } from "lucide-react";
import Link from "next/link";
import { DomainExpiryTool } from "./domain-expiry-tool";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export default async function DomainExpiryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("domain-expiry");
  const params = await searchParams;

  return (
    <PageCanvas as="main" className="domain-tool-main">
      <ToolPageHeader
        icon={<CalendarX strokeWidth={2.2} />}
        toolPage={toolPage}
      />

      <DomainExpiryTool initialName={first(params.name)} />

      <ToolPageMarkdown toolPage={toolPage} />
    </PageCanvas>
  );
}
