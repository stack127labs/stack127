import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Server } from "lucide-react";
import { NameserverCheckerFromUrl } from "./nameserver-checker-from-url";
import styles from "./nameserver-checker.module.css";

export default async function NameserverCheckerPage() {
  const toolPage = await getRequiredToolPage("nameserver-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className={styles.main}>
        <ToolPageHeader
          icon={<Server strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <NameserverCheckerFromUrl />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
