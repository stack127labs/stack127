import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { DirectoryPageTitle, DirectoryPageContent } from "@/app/ui/directories/directory-page-content";
import { ContentMarkdown } from "@/app/ui/content-markdown";
import type { Components } from "react-markdown";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import "@/app/(site)/(tools)/(domain)/domain-tools.css";
import Link from "next/link";
import { AppShell } from "../../../ui/site/app-shell";
import { DomainToolsSidebar } from "@/app/(site)/(tools)/(domain)/domain-tools-sidebar";
import { STATUS_CODES, STATUS_GROUP_TITLES, type StatusGroup } from "@/lib/domain/status-codes.ts";
import { StatePill } from "@/app/(site)/(tools)/(domain)/domain-lookup-client";
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { PageHeader } from "../../../ui/site/page-header";
import { proseSectionFlowClassName } from "../../../ui/site/prose";

/** Who set it decides what you can do, so that is what the tone encodes. */
const GROUP_TONE: Record<StatusGroup, "good" | "warn" | "bad" | "quiet"> = {
  normal: "good",
  registrar_lock: "warn",
  registry_lock: "bad",
  in_progress: "quiet",
  lifecycle: "quiet",
};

const GROUP_PILL: Record<StatusGroup, string> = {
  normal: "Nothing to do",
  registrar_lock: "Usually yours to remove",
  registry_lock: "Not yours to remove",
  in_progress: "Clears on its own",
  lifecycle: "Time sensitive",
};

const GROUP_ORDER: StatusGroup[] = ["normal", "registrar_lock", "registry_lock", "in_progress", "lifecycle"];

const GROUP_INTRO: Record<StatusGroup, string> = {
  normal: "Nothing to do. These are what a healthy domain looks like.",
  registrar_lock:
    "Your registrar put these on. That matters, because it usually means you can take them off yourself from your account.",
  registry_lock:
    "The registry that runs the ending put these on. You cannot remove them yourself, and the route is through your registrar.",
  in_progress: "Something is part way through. These clear on their own once the registry finishes.",
  lifecycle: "Where the domain sits between being registered and being released.",
};

const sourcePathComponents: Components = {
  p({ children, node }) {
    const [code, description] = node?.children ?? [];
    if (code?.type === "element" && code.tagName === "code" && description?.type === "text" && description.value.startsWith(" → ")) {
      const label = code.children[0];
      return <p className="domain-source-path">
        <code>{label?.type === "text" ? label.value : ""}</code>
        <span aria-hidden="true">→</span>
        <span>{description.value.slice(3)}</span>
      </p>;
    }
    return <p>{children}</p>;
  },
};

export default async function EppStatusCodesPage() {
  const directoryPage = await getRequiredDirectoryPage("epp-status-codes");
  return (
    <AppShell
      mainLabel="Domain status codes"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar />}
      sidebarLabel="Domain tools sidebar"
    >
      <PageCanvas as="main" className="domain-tool-main">
        <PageHeader>
          <h1><DirectoryTitleIcon iconKey={directoryPage.card_icon_key} />{" "}<DirectoryPageTitle title={directoryPage.title} /></h1>
          <ContentMarkdown markdown={directoryPage.intro_markdown} />
        </PageHeader>

          <article className={`domain-reference-content ${proseSectionFlowClassName}`}>
          <section>
            <DirectoryPageContent page={directoryPage} section="copy-1" />
          </section>

          <section>
            <DirectoryPageContent page={directoryPage} section="copy-2" components={sourcePathComponents} />
          </section>

          <section>
            <DirectoryPageContent page={directoryPage} section="copy-3" />
          </section>

          {GROUP_ORDER.map((group) => (
            <section key={group}>
              <div className="domain-answer-head">
                <h2>{STATUS_GROUP_TITLES[group]}</h2>
                <StatePill tone={GROUP_TONE[group]}>{GROUP_PILL[group]}</StatePill>
              </div>
              <p>{GROUP_INTRO[group]}</p>
              <div className="domain-table-scroll">
                <table className="domain-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>What it means</th>
                      <th>What to do</th>
                      <th>Effect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STATUS_CODES.filter((code) => code.group === group).map((code) => (
                      <tr key={code.rdap}>
                        <td>
                          <code>{code.rdap}</code>
                          {code.epp && code.epp !== code.rdap ? (
                            <>
                              <br />
                              <code>{code.epp}</code>
                            </>
                          ) : null}
                        </td>
                        <td>{code.meaning}</td>
                        <td>{code.action ?? "Nothing. This one is informational."}</td>
                        <td>
                          {code.removesFromDns ? (
                            <StatePill tone="bad">Stops DNS</StatePill>
                          ) : (
                            <span className="domain-state-quiet">Resolving is unaffected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          <section>
            <DirectoryPageContent page={directoryPage} section="copy-4" />
          </section>

          <section>
            <DirectoryPageContent page={directoryPage} section="copy-5" />
          </section>

          <section>
            <DirectoryPageContent page={directoryPage} section="copy-6" />
          </section>
        </article>
      </PageCanvas>
    </AppShell>
  );
}
