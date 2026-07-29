import { Scale } from "lucide-react";
import Link from "next/link";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { AppShell, SidebarLabel } from "../../app-shell";
import { proseClassName, proseLedeClassName } from "../../prose";
import { SidebarList } from "../../sidebar-list";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "../../sidebar-panel";
import {
  concepts,
  licenseGroups,
  licensePage,
  licenses,
  licensesInGroup,
  type LicenseEntry,
} from "@/lib/software-licenses";
import { PageTitleIcon } from "../../page-title-icon";

const factRows: { key: keyof LicenseEntry["facts"]; label: string }[] = [
  { key: "osiOpenSource", label: "OSI open source" },
  { key: "homeSelfHost", label: "Home self-host" },
  { key: "commercialInternal", label: "Company internal use" },
  { key: "modify", label: "Modify" },
  { key: "redistribute", label: "Redistribute" },
  { key: "offerAsService", label: "Offer as a service" },
  { key: "copyleft", label: "Copyleft" },
  { key: "notices", label: "Notices" },
];

function LicensesSidebar({ label }: { label: string }) {
  return (
    <div className={`${sidebarPanelClassName} license-sidebar-panel`}>
      <div className={sidebarPanelHeadingClassName}>
        <SidebarLabel>{label}</SidebarLabel>
      </div>

      <nav className="license-sidebar-nav" aria-label="License sections">
        <div className="license-sidebar-group">
          <p className="license-sidebar-group-title">Start here</p>
          <SidebarList
            items={concepts.map((concept) => ({
              href: `#${concept.id}`,
              label: concept.sidebarLabel,
            }))}
          />
        </div>

        {licenseGroups
          .filter((group) => group.id !== "start-here")
          .map((group) => {
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

function LicenseSection({ license }: { license: LicenseEntry }) {
  return (
    <section className="license-section" id={license.id}>
      <header className="license-section-header">
        <h3>{license.name}</h3>
        {license.spdx ? <p className="license-spdx">{license.spdx}</p> : null}
      </header>

      <p>{license.summary}</p>

      <dl className="license-facts">
        {factRows.map((row) => (
          <div className="license-fact" key={row.key}>
            <dt>{row.label}</dt>
            <dd>{license.facts[row.key]}</dd>
          </div>
        ))}
      </dl>

      <div className="license-audience">
        <p>
          <strong>If you are running this software:</strong>
        </p>
        {license.forUsers.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="license-audience">
        <p>
          <strong>If you are choosing a license for your own app:</strong>
        </p>
        {license.forCreators.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <p className="license-official">
        <a href={license.officialUrl} rel="noreferrer" target="_blank">
          Official license text
        </a>
      </p>

      {license.commonMistake ? (
        <p className="license-mistake">
          <strong>Common mistake:</strong> {license.commonMistake}
        </p>
      ) : null}
    </section>
  );
}

export default async function SoftwareLicensesPage() {
  const registryPage = await getRequiredPublishedPage("software-licenses-for-self-hosting");

  return (
    <AppShell
      mainLabel={licensePage.title}
      menuLabel="Licenses"
      sidebar={<LicensesSidebar label={registryPage.label} />}
      sidebarLabel="Software licenses sidebar"
    >
      <article className={`license-page ${proseClassName}`}>
        <header className="license-page-header">
          <h1>
            <PageTitleIcon>
              <Scale strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Software <mark>licenses</mark> for self-hosters
          </h1>
          <p className={proseLedeClassName}>{licensePage.lede}</p>
          <p className="license-disclaimer">{licensePage.notLegalAdvice}</p>
          <p>
            Use the sidebar to jump straight to a license label you already saw. The two short
            notes below set the basics. The{" "}
            <Link href="/self-host-apps">self-host apps</Link> directory uses the same short
            names.
          </p>
        </header>

        {concepts.map((concept) => (
          <section className="license-section" id={concept.id} key={concept.id}>
            <h2>{concept.title}</h2>
            {concept.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}

        {licenseGroups
          .filter((group) => group.id !== "start-here")
          .map((group) => {
            const groupLicenses = licensesInGroup(group.id);
            if (groupLicenses.length === 0) return null;

            return (
              <div className="license-group-block" key={group.id} id={group.id}>
                <h2 className="license-group-heading">{group.title}</h2>
                {groupLicenses.map((license) => (
                  <LicenseSection key={license.id} license={license} />
                ))}
              </div>
            );
          })}
      </article>
    </AppShell>
  );
}
