import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { FileClock } from "lucide-react";
import { SoaCheckerFromUrl } from "./soa-checker-from-url";
import styles from "./soa-checker.module.css";

export default async function SoaCheckerPage() {
  const toolPage = await getRequiredToolPage("soa-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className={styles.main}>
        <ToolPageHeader
          icon={<FileClock strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <SoaCheckerFromUrl />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
