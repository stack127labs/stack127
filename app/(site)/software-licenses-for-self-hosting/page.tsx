import { Scale } from "lucide-react";
import Link from "next/link";
import { getDirectoryLicenseCounts } from "@/lib/apps";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { AppShell, SidebarLabel } from "../../app-shell";
import { MarkerArt } from "../../marker-art";
import { PageTitleIcon } from "../../page-title-icon";
import { proseClassName, proseFlowClassName, proseLedeClassName } from "../../prose";
import { SidebarList } from "../../sidebar-list";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "../../sidebar-panel";
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

const startHereLinks = [
  { href: "#verdict-table", label: "The verdict table" },
  { href: "#license-families", label: "The four families" },
  { href: "#copyleft-trigger", label: "The copyleft trigger" },
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
          <p className="license-sidebar-group-title">Start here</p>
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
      <div className="license-page">
        <header className={`license-page-header ${proseClassName} ${proseFlowClassName}`}>
          <h1>
            <PageTitleIcon>
              <Scale strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Software <mark>licenses</mark> for self-hosters: what each label lets you do
          </h1>
          <p className={proseLedeClassName}>{licensePage.lede}</p>
          <p>{licensePage.ledeFollowUp}</p>
          <p className="license-disclaimer">
            <em>{licensePage.notLegalAdvice}</em>
          </p>
        </header>

        <section
          className={`license-section license-narrative ${proseClassName} ${proseFlowClassName}`}
          id="start-here"
        >
          <h2>Start here</h2>
          <p>Four questions cover almost everything people need from a license:</p>
          <ol>
            <li>Can I run it at home?</li>
            <li>Can my company run it?</li>
            <li>Can I change the code?</li>
            <li>Can I host it for other people?</li>
          </ol>
          <p>
            Most home setups only need the first answer. The rest start to matter the moment you
            modify an app, ship it to someone, or sell hosting built on it.
          </p>
          <p>Three things worth internalising before the table:</p>
          <ul>
            <li>A free download is not an open-source license.</li>
            <li>Open-source software can still be sold as a service, by you or by anyone else.</li>
            <li>A free binary can still ban company use.</li>
          </ul>
          <p>The repository&apos;s license grant decides all of it. The marketing page does not.</p>
        </section>

        <section
          className={`license-section license-narrative ${proseClassName} ${proseFlowClassName}`}
          id="open-source-vs-source-available"
        >
          <h2>Open source vs source-available</h2>
          <p>
            <strong>Open source</strong>, under the{" "}
            <a href="https://opensource.org/osd" rel="noreferrer" target="_blank">
              Open Source Definition
            </a>
            , lets people use, study, change, and share the software for any purpose, including
            commercial use. MIT, Apache-2.0, GPL, and AGPL all qualify. AGPL&apos;s
            network-copyleft rule does too: requiring source is not the same as restricting use.
          </p>
          <p>
            <strong>Source-available</strong> means the code is public and usually free to run,
            but the terms add limits that open-source licenses cannot.{" "}
            <a
              href="https://www.mongodb.com/legal/licensing/server-side-public-license"
              rel="noreferrer"
              target="_blank"
            >
              SSPL section 13
            </a>{" "}
            conditions service use on releasing service source. Elastic License and many
            Sustainable Use terms directly restrict managed services. BSL, FSL, and PolyForm
            depend on project parameters, time limits, or whether the use competes with the
            publisher.
          </p>
          <p>
            A public repo proves nothing either way. If the license is not OSI-approved, treat
            the project as software you can often self-host, with extra rules that still apply
            to you.
          </p>
        </section>

        <section className="license-section license-structured-section" id="verdict-table">
          <div className={`license-narrative ${proseClassName} ${proseFlowClassName}`}>
            <h2>Can you run it, change it, and host it for others?</h2>
            <p>
              This table only covers licenses that play reasonably with self-hosting. Commons
              Clause riders, the JSON license, the Anti-Capitalist Software License, and repos
              with no LICENSE file at all are excluded on purpose. They are either legally murky
              or hostile to normal use, and the practical advice for all of them is the same: do
              not build on them.
            </p>
          </div>
          <VerdictTable />
          <div className={`license-narrative ${proseClassName} ${proseFlowClassName}`}>
            <h3>What the verdicts mean</h3>
            <p>
              <strong>The columns</strong>
            </p>
            <ul>
              <li>
                <strong>Self-host</strong>: can you run it on your own hardware, for yourself and
                your household?
              </li>
              <li>
                <strong>Company</strong>: can it run on a work server, for internal business use,
                in production?
              </li>
              <li>
                <strong>OSI</strong>: is it OSI-approved open source? <code>pd</code> means a
                public-domain dedication that works like open source without being on the
                approved list.
              </li>
              <li>
                <strong>Service</strong>: can you host it for people outside your household or
                company, including paid hosting?
              </li>
              <li>
                <strong>Modify</strong>: can you change the code, and what do you owe when those
                changes leave your server?
              </li>
              <li>
                <strong>Redistribute</strong>: can you pass the software on, in images,
                appliances, forks, or products?
              </li>
              <li>
                <strong>Copyleft</strong>: whether conditions travel with the code, and how far.
              </li>
            </ul>
            <p>
              <strong>The values</strong>
            </p>
            <ul className="license-value-definitions">
              <li>
                <strong className="license-verdict-yes">yes</strong>: the activity is permitted.
                Routine notices or attribution may still apply.
              </li>
              <li>
                <strong className="license-verdict-careful">careful</strong>: permitted with a
                material obligation such as source disclosure, share-alike, or a competition
                limit. The card below spells it out.
              </li>
              <li>
                <strong className="license-verdict-depends">depends</strong>: project-specific
                parameters, a chosen option, or separate terms decide.
              </li>
              <li>
                <strong className="license-verdict-no">no</strong>: blocked by the license.
              </li>
            </ul>
            <p>
              <strong>One rule this table follows:</strong> it reports what the license permits,
              not what a legal department will approve. WTFPL permits everything and plenty of
              companies still ban it. That is a policy problem, not a licensing one, and the card
              says so. The <Link href="/self-host-apps">self-host apps</Link> directory uses the
              same short names.
            </p>
          </div>
        </section>

        <section
          className={`license-section license-narrative ${proseClassName} ${proseFlowClassName}`}
          id="license-families"
        >
          <h2>The four families</h2>
          <MarkerArt
            caption="The four license families differ by what must stay open and when that obligation begins."
            svg={softwareLicensesForSelfHostingLicenseFamiliesArt}
          />
          <p>
            Every license above belongs to one of four families, and the family answers most
            questions on its own. What separates them is one thing:{" "}
            <strong>what you owe when the software leaves your hands.</strong>
          </p>
          <p>
            <strong>Permissive</strong> asks only that copyright notices survive redistribution.
            Your fork can stay closed forever.
          </p>
          <p>
            <strong>Weak copyleft</strong> scopes the share-back duty to the covered code.
            Distribute modified MPL files or a changed LGPL library and that source stays open.
            The rest of your product stays yours.
          </p>
          <p>
            <strong>Copyleft</strong> covers the whole program, and the trigger is the part
            people get wrong.
          </p>
          <p>
            <strong>Restricted</strong> is source-available, not open source. The code is public,
            but different licenses limit different uses. SSPL conditions a service offering on
            releasing service source. Elastic-2.0 and many Sustainable Use terms directly limit
            managed services. BSL 1.1, FSL, and PolyForm turn on project parameters, a conversion
            date, or whether your use competes with the publisher. Self-hosting for yourself or
            your company is usually the intended free path, but the exact text still controls.
          </p>
        </section>

        <section
          className={`license-section license-narrative ${proseClassName} ${proseFlowClassName}`}
          id="copyleft-trigger"
        >
          <h2>The copyleft trigger</h2>
          <p>
            GPL compliance starts when you <strong>distribute</strong> a covered copy.
            Modification is not required: distributing an unmodified copy can still require
            license notices and, for object code, corresponding source.
          </p>
          <p>
            AGPL adds a network trigger in{" "}
            <a href="https://www.gnu.org/licenses/agpl-3.0.html#section13" rel="noreferrer" target="_blank">
              section 13
            </a>
            . When people use your modified version over a network, you must offer them its
            corresponding source.
          </p>
          <p>
            That clause stops a modified hosted clone from staying closed, which makes AGPL a
            common choice for self-host web apps.
          </p>
          <p>
            Two things follow that are worth stating plainly, because both get misread
            constantly:
          </p>
          <ul>
            <li>
              Unmodified upstream does not trigger AGPL section 13, even when family, coworkers,
              or other remote users log in.
            </li>
            <li>
              The extra network rule needs <strong>modified</strong> code plus remote interaction.
              If you are the only user, there is no section 13 source-offer duty.
            </li>
          </ul>
        </section>

        <section className="license-section license-structured-section" id="all-licenses">
          <div className={`license-narrative ${proseClassName} ${proseFlowClassName}`}>
            <h2>Every license, family by family</h2>
            <p>
              The licenses below are grouped by family, with links to the official text and
              popular self-hosted apps that use each one.
            </p>
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
          id="choosing-a-license"
        >
          <h2>Choosing a license for your own app: the short path</h2>
          <p>If you are shipping a self-host app and want one answer rather than thirty:</p>
          <ul>
            <li>
              <strong>You want maximum adoption and do not care who profits.</strong> MIT.
              Apache-2.0 if you want an explicit patent grant.
            </li>
            <li>
              <strong>You want fixes shared back but not a fight over combined products.</strong>{" "}
              MPL-2.0.
            </li>
            <li>
              <strong>You are shipping a library.</strong> LGPL-3.0, or MIT if you want it
              everywhere.
            </li>
            <li>
              <strong>Your real fear is a hosted closed clone.</strong> AGPL-3.0. This is the
              common open-source choice for that goal.
            </li>
            <li>
              <strong>You want a commercial business on top.</strong> AGPL-3.0 plus a paid
              commercial license, dual-licensed.
            </li>
            <li>
              <strong>
                You need to block managed-service resale specifically, and can accept losing the
                open-source label.
              </strong>{" "}
              BSL 1.1 or FSL, both of which convert to open source later. Elastic-2.0 or
              Sustainable Use if you do not want a conversion date.
            </li>
            <li>
              <strong>You want personal use free and all company use paid.</strong> PolyForm
              Noncommercial, understanding business adoption will be small.
            </li>
          </ul>
          <p>
            Whatever you pick, write a plain-language paragraph next to the LICENSE file
            explaining what a self-hoster may do. Self-hosters read that paragraph before they
            read the legal text, and often instead of it.
          </p>
        </section>

        <section
          className={`license-section license-narrative ${proseClassName} ${proseFlowClassName}`}
          id="faq"
        >
          <h2>Questions that come up</h2>
          <p>
            <strong>Does AGPL stop me self-hosting an app for my family?</strong>
            <br />
            No for unmodified upstream, and no when you are the only user. If you modify it and someone else, including family, uses it remotely, AGPL section 13 requires you to offer that version&apos;s corresponding source.
          </p>
          <p>
            <strong>I run an unmodified AGPL app and let friends log in. Do I owe them source?</strong>
            <br />
            Unmodified upstream does not trigger AGPL section 13. The extra source-offer duty
            appears when remote users interact with a modified version.
          </p>
          <p>
            <strong>
              My company runs a GPL app internally with local patches. Do we have to publish
              them?
            </strong>
            <br />
            No. GPL triggers on distribution. Internal use is not distribution.
          </p>
          <p>
            <strong>Is a public GitHub repo open source?</strong>
            <br />
            Not necessarily. Check whether the license is OSI-approved. SSPL, BSL, FSL, Elastic,
            and PolyForm are all public and none of them are open source.
          </p>
          <p>
            <strong>Can I sell hosting for an MIT-licensed app?</strong>
            <br />
            Yes. Permissive licenses do not block that, which is exactly why some projects move
            to AGPL or a source-available license later.
          </p>
          <p>
            <strong>Two projects both say BSL 1.1. Do they grant the same rights?</strong>
            <br />
            No. The Additional Use Grant and change date differ per project. Read both.
          </p>
          <p>
            <strong>The repo has no LICENSE file. Can I use it?</strong>
            <br />
            First check the README, documentation, or another file for an express license grant.{" "}
            <a
              href="https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository"
              rel="noreferrer"
              target="_blank"
            >
              GitHub&apos;s licensing guidance
            </a>{" "}
            explains the default: if the repository grants no license anywhere, normal copyright
            applies and you should treat it as all rights reserved.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
