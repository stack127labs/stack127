import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Route } from "lucide-react";
import { DnsTraceFromUrl } from "./dns-trace-from-url";
import styles from "./dns-trace.module.css";

export default async function DnsTracePage() {
  const toolPage = await getRequiredToolPage("dns-trace");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className={styles.main}>
        <ToolPageHeader
          icon={<Route strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DnsTraceFromUrl />

        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
