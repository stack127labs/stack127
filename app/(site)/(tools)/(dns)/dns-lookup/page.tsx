import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Search } from "lucide-react";
import { DnsLookupFromUrl } from "./dns-lookup-from-url";
import styles from "./dns-lookup-content.module.css";

export default async function DnsLookupPage() {
  const toolPage = await getRequiredToolPage("dns-lookup");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className="dns-lookup-main">
        <ToolPageHeader
          icon={<Search strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DnsLookupFromUrl />

        <div className={styles.guide}>
          <ToolPageMarkdown toolPage={toolPage} />
        </div>
      </PageCanvas>
    </ToolPageShell>
  );
}
