import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ShieldCheck } from "lucide-react";
import { DnssecCheckerFromUrl } from "./dnssec-checker-from-url";
import styles from "./dnssec-checker.module.css";

export default async function DnssecCheckerPage() {
  const toolPage = await getRequiredToolPage("dnssec-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className={styles.main}>
        <ToolPageHeader
          icon={<ShieldCheck strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DnssecCheckerFromUrl />

        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
