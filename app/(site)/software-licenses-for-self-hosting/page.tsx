import { Scale } from "lucide-react";
import Link from "next/link";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { AppShell, SidebarLabel } from "../../app-shell";
import { MarkerArt } from "../../marker-art";
import { PageTitleIcon } from "../../page-title-icon";
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
  type Verdict,
} from "@/lib/software-licenses";
import { softwareLicensesForSelfHostingCopyleftSpreadArt } from "./art/software-licenses-for-self-hosting--copyleft-spread";

/** Verdict table columns, in the order people decide things. */
const verdictColumns = [
  { key: "selfHost", label: "Self-host" },
  { key: "companyUse", label: "Company use" },
  { key: "service", label: "As a service" },
  { key: "modify", label: "Modify" },
  { key: "redistribute", label: "Redistribute" },
] as const;

/** Which facts sentence explains each verdict column. */
const factForColumn = {
  selfHost: "homeSelfHost",
  companyUse: "commercialInternal",
  service: "offerAsService",
  modify: "modify",
  redistribute: "redistribute",
} as const;

function VerdictCell({ value }: { value: Verdict }) {
  return <td className={`license-verdict license-verdict-${value}`}>{value}</td>;
}

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

function VerdictTable() {
  return (
    <div className="license-table-scroll">
      <table className="license-verdict-table">
        <thead>
          <tr>
            <th scope="col">License</th>
            {verdictColumns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
            <th scope="col">Copyleft</th>
          </tr>
        </thead>
        <tbody>
          {licenseGroups
            .filter((group) => group.id !== "start-here")
            .flatMap((group) => licensesInGroup(group.id))
            .map((license) => (
              <tr key={license.id}>
                <th scope="row">
                  <a href={`#${license.id}`}>{license.sidebarLabel}</a>
                </th>
                {verdictColumns.map((column) => (
                  <VerdictCell key={column.key} value={license.verdicts[column.key]} />
                ))}
                <td className="license-copyleft">{license.verdicts.copyleft}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function LicenseSection({ license }: { license: LicenseEntry }) {
  const seen = new Set<string>();
  const carefulDetails = verdictColumns
    .filter((column) => license.verdicts[column.key] !== "yes")
    .map((column) => ({ key: column.key, detail: license.facts[factForColumn[column.key]] }))
    .filter(({ detail }) => (seen.has(detail) ? false : (seen.add(detail), true)));

  return (
    <section className="license-section" id={license.id}>
      <header className="license-section-header">
        <h3>{license.name}</h3>
        {license.spdx ? <p className="license-spdx">{license.spdx}</p> : null}
      </header>

      <p>{license.summary}</p>

      {carefulDetails.length > 0 ? (
        <ul className="license-details">
          {carefulDetails.map(({ key, detail }) => (
            <li key={key}>{detail}</li>
          ))}
        </ul>
      ) : null}

      <p>
        <strong>Running it:</strong> {license.forUsers}
      </p>
      <p>
        <strong>Licensing your own app:</strong> {license.forCreators}
      </p>

      {license.commonMistake ? (
        <p className="license-mistake">
          <strong>Common mistake:</strong> {license.commonMistake}
        </p>
      ) : null}

      <p className="license-official">
        <a href={license.officialUrl} rel="noreferrer" target="_blank">
          Official license text
        </a>
      </p>
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
            Software <mark>licenses</mark> for self-hosters: what each label lets you do
          </h1>
          <p className={proseLedeClassName}>{licensePage.lede}</p>
          <p className="license-disclaimer">{licensePage.notLegalAdvice}</p>
        </header>

        <section className="license-section" id="verdict-table">
          <h2>Can you run it, change it, and host it for others?</h2>
          <p>
            Every license on this page, answered in one word per question. A{" "}
            <span className="license-verdict-careful-text">careful</span>
            {" "}means allowed with conditions worth reading; each license&apos;s section below
            spells them out. The{" "}
            <Link href="/self-host-apps">self-host apps</Link> directory uses the same short
            names.
          </p>
          <VerdictTable />
        </section>

        {concepts.map((concept) => (
          <section className="license-section" id={concept.id} key={concept.id}>
            <h2>{concept.title}</h2>
            {concept.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {concept.id === "how-copyleft-spreads" ? (
              <MarkerArt
                caption="Host a modified AGPL app publicly and its users get the right to your source. Keep it home, and nothing triggers."
                svg={softwareLicensesForSelfHostingCopyleftSpreadArt}
              />
            ) : null}
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
