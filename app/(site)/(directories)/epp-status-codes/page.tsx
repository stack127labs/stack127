import { isValidElement, type ComponentPropsWithoutRef } from "react";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { PageMeta } from "@/app/ui/site/page-meta";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import "@/app/(site)/(tools)/(domain)/domain-tools.css";
import { AppShell } from "../../../ui/site/app-shell";
import { DomainToolsSidebar } from "@/app/(site)/(tools)/(domain)/domain-tools-sidebar";
import { STATUS_CODES, STATUS_GROUP_TITLES, type StatusGroup } from "@/lib/domain/status-codes.ts";
import { StatePill } from "@/app/(site)/(tools)/(domain)/domain-lookup-client";
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { PageHeader } from "../../../ui/site/page-header";
import { proseSectionFlowClassName } from "../../../ui/site/prose";
import BadSign from "./content/bad-sign.mdx";
import ClientAndServer from "./content/client-and-server.mdx";
import Intro from "./content/intro.mdx";
import RelatedTools from "./content/related-tools.mdx";
import SiteDown from "./content/site-down.mdx";
import TwoSpellings from "./content/two-spellings.mdx";
import WhyItWasSet from "./content/why-it-was-set.mdx";

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

/** A paragraph written as `client…` → meaning renders as one source-path row. */
function SourcePathParagraph({ children, ...props }: ComponentPropsWithoutRef<"p">) {
  const [code, description] = Array.isArray(children) ? children : [];
  if (isValidElement<{ children?: unknown }>(code) && typeof description === "string" && description.startsWith(" → ")) {
    return <p className="domain-source-path">
      <code>{typeof code.props.children === "string" ? code.props.children : ""}</code>
      <span aria-hidden="true">→</span>
      <span>{description.slice(3)}</span>
    </p>;
  }
  return <p {...props}>{children}</p>;
}

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
          <PageMeta updatedAt={directoryPage.updated_at} />
          <Intro />
        </PageHeader>

        <article className={`domain-reference-content ${proseSectionFlowClassName}`}>
          <section>
            <TwoSpellings />
          </section>

          <section>
            <ClientAndServer components={{ p: SourcePathParagraph }} />
          </section>

          <section>
            <SiteDown />
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
            <WhyItWasSet />
          </section>

          <section>
            <BadSign />
          </section>

          <section>
            <RelatedTools />
          </section>
        </article>
      </PageCanvas>
    </AppShell>
  );
}
