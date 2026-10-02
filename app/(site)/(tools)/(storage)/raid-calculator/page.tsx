import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { HardDrive } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import styles from "../../../(catalogs)/storage-tools/storage-tools.module.css";
import { RaidCalculatorFromUrl } from "./raid-calculator-from-url";

export default async function RaidCalculatorPage() {
  const toolPage = await getRequiredToolPage("raid-calculator");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<HardDrive strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <RaidCalculatorFromUrl />

        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
