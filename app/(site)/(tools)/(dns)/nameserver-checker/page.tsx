import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Server } from "lucide-react";
import { NameserverChecker } from "./nameserver-checker";
import styles from "./nameserver-checker.module.css";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function NameserverCheckerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("nameserver-checker");
  const params = await searchParams;
  return (
    <PageCanvas as="main" className={styles.main}>
      <ToolPageHeader
        icon={<Server strokeWidth={2.2} />}
        toolPage={toolPage}
      />
      <NameserverChecker initialName={first(params.name)} />
      <ToolPageMarkdown toolPage={toolPage} />
    </PageCanvas>
  );
}
