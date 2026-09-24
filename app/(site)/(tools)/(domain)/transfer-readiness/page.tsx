import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { TransferReadinessTool } from "./transfer-readiness-tool";
import { pendingPolicy, policyInForce } from "@/lib/domain/transfer-policy.ts";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export default async function TransferReadinessPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("transfer-readiness");
  const params = await searchParams;
  const current = policyInForce();
  const pending = pendingPolicy();

  return (
    <PageCanvas as="main" className="domain-tool-main">
      <ToolPageHeader
        icon={<ArrowLeftRight strokeWidth={2.2} />}
        toolPage={toolPage}
      />

      <TransferReadinessTool initialName={first(params.name)} />

      <ToolPageMarkdown toolPage={toolPage} />
    </PageCanvas>
  );
}
