import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { FileClock } from "lucide-react";
import { SoaChecker } from "./soa-checker";
import styles from "./soa-checker.module.css";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function SoaCheckerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("soa-checker");
  const params = await searchParams;
  return <PageCanvas as="main" className={styles.main}>
    <ToolPageHeader
      icon={<FileClock strokeWidth={2.2} />}
      toolPage={toolPage}
    />
    <SoaChecker initialName={first(params.name)} />
    <ToolPageMarkdown toolPage={toolPage} />
  </PageCanvas>;
}
