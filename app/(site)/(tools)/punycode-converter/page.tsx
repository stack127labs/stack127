import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import "../../(catalogs)/domain-tools/domain-tools.css";
import { Languages } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../../(catalogs)/domain-tools/domain-tools-sidebar";
import { PunycodeTool } from "./punycode-tool";

export default async function PunycodeConverterPage() {
  const toolPage = await getRequiredToolPage("punycode-converter");
  return (
    <AppShell
      mainLabel="Punycode and IDN Converter"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="punycode" />}
      sidebarLabel="Domain tools sidebar"
    >
      <main className="domain-tool-main">
        <ToolPageHeader
          icon={<Languages strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <PunycodeTool />

        <hr className="domain-divider" />

          <ToolPageMarkdown toolPage={toolPage} />
      </main>
    </AppShell>
  );
}
