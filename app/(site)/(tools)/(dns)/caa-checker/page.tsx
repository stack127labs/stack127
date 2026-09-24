import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { FileKey } from "lucide-react";
import { CaaChecker } from "./caa-checker";
import styles from "../../../(catalogs)/dns-tools/dns-diagnostics.module.css";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function CaaCheckerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("caa-checker");
  const params = await searchParams;
  return (
    <PageCanvas as="main" className={styles.main}>
      <ToolPageHeader
        icon={<FileKey strokeWidth={2.2} />}
        toolPage={toolPage}
      />

      <CaaChecker initialName={first(params.name)} />

      <ToolPageMarkdown toolPage={toolPage} />
    </PageCanvas>
  );
}
