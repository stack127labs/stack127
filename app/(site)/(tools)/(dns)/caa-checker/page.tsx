import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { FileKey } from "lucide-react";
import { CaaCheckerFromUrl } from "./caa-checker-from-url";
import styles from "@/app/(site)/(tools)/(dns)/dns-diagnostics.module.css";

export default async function CaaCheckerPage() {
  const toolPage = await getRequiredToolPage("caa-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className={styles.main}>
        <ToolPageHeader
          icon={<FileKey strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <CaaCheckerFromUrl />

        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
