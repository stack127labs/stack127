import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { RefreshCw } from "lucide-react";
import { DnsChangeCheckerFromUrl } from "./dns-change-checker-from-url";
import styles from "./dns-change-checker.module.css";

export default async function DnsChangeCheckerPage() {
  const toolPage = await getRequiredToolPage("dns-change-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className={styles.main}>
        <ToolPageHeader
          icon={<RefreshCw strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <DnsChangeCheckerFromUrl />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
