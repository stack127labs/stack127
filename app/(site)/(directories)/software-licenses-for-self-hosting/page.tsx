import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { DirectoryPageTitle, DirectoryPageContent } from "@/app/ui/directories/directory-page-content";
import { ContentMarkdown } from "@/app/ui/content-markdown";
import type { Components } from "react-markdown";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import Link from "next/link";
import { getDirectoryLicenseCounts } from "@/lib/apps";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { MarkerArt } from "@/app/ui/site/marker-art";
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { PageHeader } from "@/app/ui/site/page-header";
import { proseClassName, proseFlowClassName, proseLedeClassName } from "@/app/ui/site/prose";
import { SidebarList } from "@/app/ui/site/sidebar-list";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "@/app/ui/site/sidebar-panel";
import {
  findDirectoryLicenseId,
  licenseGroups,
  licensePage,
  licensesInGroup,
  type LicenseEntry,
  type OsiVerdict,
  type Verdict,
} from "@/lib/software-licenses";
import { softwareLicensesForSelfHostingLicenseFamiliesArt } from "./art/software-licenses-for-self-hosting--license-families";

/** Verdict table columns, in the order people decide things. */
const verdictColumns = [
  { key: "selfHost", label: "Self-host" },
  { key: "companyUse", label: "Company" },
  { key: "service", label: "Service" },
  { key: "modify", label: "Modify" },
  { key: "redistribute", label: "Redistribute" },
] as const;

const licenseMarkdownComponents: Components = {
  strong({ children }) {
    const verdict = typeof children === "string" && ["yes", "careful", "depends", "no"].includes(children) ? children : null;
    return <strong className={verdict ? `license-verdict-${verdict}` : undefined}>{children}</strong>;
  },
  a({ children, href }) {
    return href?.startsWith("/") ? <Link href={href}>{children}</Link> : <a href={href} rel="noreferrer" target="_blank">{children}</a>;
  },
};

const startHereLinks = [
  { href: "#verdict-table", label: "Compare licenses" },
  { href: "#license-families", label: "License families" },
  { href: "#copyleft-trigger", label: "The copyleft trigger" },
  { href: "#all-licenses", label: "License details" },
  { href: "#open-source-vs-source-available", label: "Open source or source-available" },
  { href: "#choosing-a-license", label: "Choosing a license" },
  { href: "#faq", label: "Questions that come up" },
];

function LicensesSidebar({ label }: { label: string }) {
  return (
    <div className={`${sidebarPanelClassName} license-sidebar-panel`}>
      <div className={sidebarPanelHeadingClassName}>
        <SidebarLabel>{label}</SidebarLabel>
      </div>

      <nav className="license-sidebar-nav" aria-label="License sections">
        <div className="license-sidebar-group">
          <p className="license-sidebar-group-title">On this page</p>
          <SidebarList items={startHereLinks} />
        </div>

        {licenseGroups.map((group) => {
          const groupLicenses = licensesInGroup(group.id);
          if (groupLicenses.length === 0) return null;

          return (
            <div className="license-sidebar-group" key={group.id}>
              <p className="license-sidebar-group-title">{group.sidebarLabel}</p>
              <SidebarList
                items={groupLicenses.map((license) => ({
                  href: `#${license.id}`,
                  label: license.sidebarLabel,
                }))}
              />
            </div>
          );
        })}
      </nav>
    </div>
  );
}

/** Class-safe form of a table value: "n.a." renders with the muted style. */
function verdictClass(value: Verdict | OsiVerdict) {
  return `license-verdict license-verdict-${value.replace(/[^a-z]/g, "")}`;
}

function VerdictTable() {
  return (
    <div className="license-table-scroll">
      <table className="license-verdict-table">
        <thead>
          <tr>
            <th scope="col">License</th>
            <th scope="col">Self-host</th>
            <th scope="col">Company</th>
            <th scope="col">OSI</th>
            <th scope="col">Service</th>
            <th scope="col">Modify</th>
            <th scope="col">Redistribute</th>
            <th scope="col">Copyleft</th>
          </tr>
        </thead>
        <tbody>
          {licenseGroups
            .flatMap((group) => licensesInGroup(group.id))
            .map((license) => (
              <tr key={license.id}>
                <th scope="row">
                  <a href={`#${license.id}`}>{license.sidebarLabel}</a>
                </th>
                <td className={verdictClass(license.verdicts.selfHost)}>{license.verdicts.selfHost}</td>
                <td className={verdictClass(license.verdicts.companyUse)}>{license.verdicts.companyUse}</td>
                <td className={verdictClass(license.verdicts.osi)}>{license.verdicts.osi}</td>
                <td className={verdictClass(license.verdicts.service)}>{license.verdicts.service}</td>
                <td className={verdictClass(license.verdicts.modify)}>{license.verdicts.modify}</td>
                <td className={verdictClass(license.verdicts.redistribute)}>{license.verdicts.redistribute}</td>
                <td className="license-copyleft">{license.verdicts.copyleft}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function LicenseCard({ appCount, license }: { appCount: number; license: LicenseEntry }) {
  return (
    <article className="license-card" id={license.id}>
      <header className="license-card-header">
        <h3>{license.name}</h3>
        {license.spdx ? <p className="license-spdx">{license.spdx}</p> : null}
      </header>

      <p className="license-card-summary">{license.summary}</p>

      {appCount > 0 || license.officialUrl ? (
        <div className="license-card-actions">
          {appCount > 0 ? (
            <Link className="license-apps-button" href={`/self-host-apps?license=${license.id}`}>
              Browse {appCount.toLocaleString("en-US")} {appCount === 1 ? "app" : "apps"}
            </Link>
          ) : null}
          {license.officialUrl ? (
            <a
              className="license-official-button"
              href={license.officialUrl}
              rel="noreferrer"
              target="_blank"
            >
              {license.officialLinkLabel ?? "Official license text"}
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default async function SoftwareLicensesPage() {
  const directoryPage = await getRequiredDirectoryPage("software-licenses-for-self-hosting");
  const [registryPage, rawLicenseCounts] = await Promise.all([
    getRequiredPublishedPage("software-licenses-for-self-hosting"),
    getDirectoryLicenseCounts(),
  ]);
  const appCounts = new Map<string, number>();
  for (const row of rawLicenseCounts) {
    const licenseId = findDirectoryLicenseId(row.license_spdx_id, row.license);
    if (licenseId) {
      appCounts.set(licenseId, (appCounts.get(licenseId) ?? 0) + row.count);
    }
  }

  return (
    <AppShell
      mainLabel={licensePage.title}
      menuLabel="Licenses"
      sidebar={<LicensesSidebar label={registryPage.label} />}
      sidebarLabel="Software licenses sidebar"
    >
      <PageCanvas as="div" flow className="license-page">
        <PageHeader bordered className={proseClassName}>
          <h1><DirectoryTitleIcon iconKey={directoryPage.card_icon_key} />{" "}<DirectoryPageTitle title={directoryPage.title} /></h1>
          <ContentMarkdown markdown={directoryPage.intro_markdown} components={{ p: ({ children }) => <p className={proseLedeClassName}>{children}</p> }} />
          <DirectoryPageContent page={directoryPage} section="disclaimer" components={{ p: ({ children }) => <p className="license-disclaimer">{children}</p> }} />
        </PageHeader>

        <section className="license-section license-structured-section" id="verdict-table">
          <div className={`license-narrative ${proseClassName} ${proseFlowClassName}`}>
            <DirectoryPageContent page={directoryPage} section="copy-1" components={licenseMarkdownComponents} />
          </div>
          <VerdictTable />
          <div className={`license-narrative ${proseClassName} ${proseFlowClassName}`}>
            <DirectoryPageContent page={directoryPage} section="copy-2" components={licenseMarkdownComponents} />
          </div>
        </section>

        <section
          className={`license-section license-narrative ${proseClassName} ${proseFlowClassName}`}
          id="license-families"
        >
          <DirectoryPageContent page={directoryPage} section="copy-3" components={licenseMarkdownComponents} />
          <MarkerArt
            caption="The four license families differ by what must stay open and when that obligation begins."
            svg={softwareLicensesForSelfHostingLicenseFamiliesArt}
          />
          <DirectoryPageContent page={directoryPage} section="copy-4" components={licenseMarkdownComponents} />
        </section>

        <section
          className={`license-section license-narrative ${proseClassName} ${proseFlowClassName}`}
          id="copyleft-trigger"
        >
          <DirectoryPageContent page={directoryPage} section="copy-5" components={licenseMarkdownComponents} />
        </section>

        <section className="license-section license-structured-section" id="all-licenses">
          <div className={`license-narrative ${proseClassName} ${proseFlowClassName}`}>
            <DirectoryPageContent page={directoryPage} section="copy-6" components={licenseMarkdownComponents} />
          </div>

          {licenseGroups.map((group) => {
            const groupLicenses = licensesInGroup(group.id);
            if (groupLicenses.length === 0) return null;

            return (
              <div className="license-group-block" key={group.id} id={group.id}>
                <div className={`license-narrative ${proseClassName} ${proseFlowClassName}`}>
                  <h3 className="license-group-heading">{group.title}</h3>
                  {group.intro ? <p>{group.intro}</p> : null}
                </div>
                <div className="license-card-grid">
                  {groupLicenses.map((license) => (
                    <LicenseCard
                      appCount={appCounts.get(license.id) ?? 0}
                      key={license.id}
                      license={license}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section
          className={`license-section license-narrative ${proseClassName} ${proseFlowClassName}`}
          id="open-source-vs-source-available"
        >
          <DirectoryPageContent page={directoryPage} section="copy-7" components={licenseMarkdownComponents} />
        </section>

        <section
          className={`license-section license-narrative ${proseClassName} ${proseFlowClassName}`}
          id="choosing-a-license"
        >
          <DirectoryPageContent page={directoryPage} section="copy-8" components={licenseMarkdownComponents} />
        </section>

        <section
          className={`license-section license-narrative ${proseClassName} ${proseFlowClassName}`}
          id="faq"
        >
          <DirectoryPageContent page={directoryPage} section="copy-9" components={licenseMarkdownComponents} />
        </section>
      </PageCanvas>
    </AppShell>
  );
}
