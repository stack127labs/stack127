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
  licenseGroups,
  licensePage,
  licensesInGroup,
  type LicenseEntry,
  type Verdict,
} from "@/lib/software-licenses";
import { softwareLicensesForSelfHostingCopyleftTriggerArt } from "./art/software-licenses-for-self-hosting--copyleft-trigger";
import { softwareLicensesForSelfHostingLicenseFamiliesArt } from "./art/software-licenses-for-self-hosting--license-families";

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

const contentGroups = licenseGroups.filter((group) => group.id !== "start-here");

const startHereLinks = [
  { href: "#verdict-table", label: "The verdict table" },
  { href: "#license-families", label: "The four families" },
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
          <SidebarList items={startHereLinks} />
        </div>

        {contentGroups.map((group) => {
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

function VerdictCell({ value }: { value: Verdict }) {
  return <td className={`license-verdict license-verdict-${value}`}>{value}</td>;
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
          {contentGroups
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

function LicenseCard({ license }: { license: LicenseEntry }) {
  const seen = new Set<string>();
  const carefulDetails = verdictColumns
    .filter((column) => license.verdicts[column.key] !== "yes")
    .map((column) => ({ key: column.key, detail: license.facts[factForColumn[column.key]] }))
    .filter(({ detail }) => (seen.has(detail) ? false : (seen.add(detail), true)));

  return (
    <article className="license-card" id={license.id}>
      <header className="license-card-header">
        <h3>{license.name}</h3>
        {license.spdx ? <p className="license-spdx">{license.spdx}</p> : null}
      </header>

      <p className="license-card-summary">{license.summary}</p>

      {carefulDetails.length > 0 ? (
        <ul className="license-details">
          {carefulDetails.map(({ key, detail }) => (
            <li key={key}>{detail}</li>
          ))}
        </ul>
      ) : null}

      <p className="license-card-audience">
        <strong>Running it:</strong> {license.forUsers}
      </p>
      <p className="license-card-audience">
        <strong>Licensing your own app:</strong> {license.forCreators}
      </p>

      <a className="license-official-button" href={license.officialUrl} rel="noreferrer" target="_blank">
        Official license text
      </a>
    </article>
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
      <div className="license-page">
        <header className={`license-page-header ${proseClassName}`}>
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
          <div className={`license-narrative ${proseClassName}`}>
            <h2>Can you run it, change it, and host it for others?</h2>
            <p>
              Find your label in the first column, read across, and you have your answer. A{" "}
              <span className="license-verdict-careful-text">careful</span>
              {" "}is allowed with conditions; the license&apos;s card further down spells them
              out, and the <Link href="/self-host-apps">self-host apps</Link> directory uses the
              same short names.
            </p>
            <p>
              One scope note: this table only covers licenses that play reasonably with
              self-hosting and open source. Labels like Commons Clause riders, the JSON license,
              the Anti-Capitalist Software License, or a repo with no LICENSE file at all are
              deliberately missing. They are either legally murky or hostile to normal use, and
              the practical advice for all of them is the same: do not build on them.
            </p>
          </div>
          <VerdictTable />
          <div className={`license-narrative ${proseClassName}`}>
            <p>What each column asks:</p>
            <ul>
              <li>
                <strong>Self-host</strong>: can you run it on your own hardware at home, for
                yourself and your family?
              </li>
              <li>
                <strong>Company use</strong>: can it run on a work server, for internal business
                use in production?
              </li>
              <li>
                <strong>As a service</strong>: can you host it for people outside your household
                or company, including paid hosting?
              </li>
              <li>
                <strong>Modify</strong>: can you change the code, and what do you owe when your
                changes leave your server?
              </li>
              <li>
                <strong>Redistribute</strong>: can you pass the software on, in images,
                appliances, forks, or products?
              </li>
              <li>
                <strong>Copyleft</strong>: whether conditions travel with the code, and how far.
                The next two sections make this column readable at a glance.
              </li>
            </ul>
          </div>
        </section>

        <section className={`license-section license-narrative ${proseClassName}`} id="license-families">
          <h2>The four families, and the differences that matter</h2>
          <p>
            Every software license in the table belongs to one of four families, and the family
            already answers most questions about it.
          </p>
          <MarkerArt
            caption="The four license families and which licenses belong to each."
            svg={softwareLicensesForSelfHostingLicenseFamiliesArt}
          />
          <p>
            The families differ on what you owe when the software leaves your hands.
            Permissive licenses ask only that copyright notices survive redistribution; your
            fork can stay closed forever. Weak copyleft scopes the share-back duty to the
            covered code: distribute modified MPL files or a changed LGPL library and that
            source must stay open, while the rest of your product remains yours.
          </p>
          <p>
            Copyleft covers the whole program, and the trigger is what people get wrong. GPL
            obligations start when you distribute the program, so a modified GPL app running on
            your own server creates no duty. AGPL adds a network trigger: when people use your
            modified version over a network, you must offer them its source. That single clause
            is why hosted clones of AGPL apps cannot stay closed, and why AGPL is the default
            license for self-host web apps.
          </p>
          <MarkerArt
            caption="Copyleft triggers only when your modified copy reaches other people: GPL when you ship it, AGPL also when you host it."
            svg={softwareLicensesForSelfHostingCopyleftTriggerArt}
          />
          <p>
            The restricted family is source-available, not open source: the code is public, but
            the license fails the OSI definition because it blocks selling the software as a
            managed service. SSPL does it through its section 13 stack-release requirement,
            Elastic-2.0 and Sustainable Use through direct managed-service clauses, BSL 1.1
            through a per-project Additional Use Grant with a change date that later converts
            the code to an open-source license, and FSL the same way with a fixed delay to MIT
            or Apache-2.0. Self-hosting for yourself or your company is usually the intended
            free path. And since the repo itself proves nothing either way, the LICENSE file is
            the only thing that tells you which family a project belongs to.
          </p>
        </section>

        <section className="license-section" id="all-licenses">
          <div className={`license-narrative ${proseClassName}`}>
            <h2>Every license, family by family</h2>
            <p>
              The cards below are the detail behind the table: what each license is, the exact
              conditions behind any careful or no, one line if you run the software, and one if
              you are choosing a license for your own app.
            </p>
          </div>

          {contentGroups.map((group) => {
            const groupLicenses = licensesInGroup(group.id);
            if (groupLicenses.length === 0) return null;

            return (
              <div className="license-group-block" key={group.id} id={group.id}>
                <div className={`license-narrative ${proseClassName}`}>
                  <h3 className="license-group-heading">{group.title}</h3>
                  {group.intro ? <p>{group.intro}</p> : null}
                </div>
                <div className="license-card-grid">
                  {groupLicenses.map((license) => (
                    <LicenseCard key={license.id} license={license} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
