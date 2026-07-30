import { Scale } from "lucide-react";
import Link from "next/link";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { AppShell } from "../../app-shell";
import { MarkerArt } from "../../marker-art";
import { PageTitleIcon } from "../../page-title-icon";
import { proseClassName, proseLedeClassName } from "../../prose";
import {
  licenseGroups,
  licensePage,
  licensesInGroup,
  type LicenseEntry,
  type Verdict,
} from "@/lib/software-licenses";
import { softwareLicensesForSelfHostingCopyleftSpreadArt } from "./art/software-licenses-for-self-hosting--copyleft-spread";
import { softwareLicensesForSelfHostingCopyleftTriggerArt } from "./art/software-licenses-for-self-hosting--copyleft-trigger";
import { softwareLicensesForSelfHostingLicenseSpectrumArt } from "./art/software-licenses-for-self-hosting--license-spectrum";

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
  await getRequiredPublishedPage("software-licenses-for-self-hosting");

  return (
    <AppShell fullWidth mainLabel={licensePage.title}>
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

        <section className={`license-section license-narrative ${proseClassName}`} id="license-spectrum">
          <h2>The whole table is one spectrum</h2>
          <p>
            Thirty-two labels sounds like a lot, but they sit on one line: how much you owe back,
            growing from nothing on the left to business restrictions on the right. Place a
            license on this spectrum and you already know most of its row.
          </p>
          <MarkerArt
            caption="Obligations grow from permissive through copyleft to source-available restrictions."
            svg={softwareLicensesForSelfHostingLicenseSpectrumArt}
          />
        </section>

        <section className={`license-section license-narrative ${proseClassName}`} id="open-source-vs-source-available">
          <h2>The copyleft column splits the table in two</h2>
          <p>
            Look back at that copyleft column and you will notice the table splits in two.
            Everything from MIT down through AGPL is open source as the Open Source Initiative
            defines it: anyone can use, study, change, and share the software for any purpose,
            including commercially. The rows where a no appears under as-a-service are mostly
            source-available licenses: SSPL, Elastic, BSL, FSL, PolyForm. Their code is public
            and usually fine to self-host, but a business restriction, almost always about
            selling the software as a managed service, keeps them outside the open-source
            definition.
          </p>
          <p>
            This is also why a public GitHub repo proves nothing by itself. The repo shows you
            the code; only the LICENSE file tells you which side of that line the project sits
            on.
          </p>
        </section>

        <section className={`license-section license-narrative ${proseClassName}`} id="how-copyleft-spreads">
          <h2>Copyleft: use the code, inherit its rules</h2>
          <p>
            The other word that decides everything in that table is copyleft. Permissive
            licenses let your fork stay private forever. Copyleft licenses attach conditions
            that travel with the code: change it, and under some circumstances you owe people
            your changes. Which circumstances is exactly the difference between GPL and AGPL,
            and it is why so many self-host web apps pick AGPL.
          </p>
          <MarkerArt
            caption="Host a modified AGPL app publicly and its users get the right to your source."
            svg={softwareLicensesForSelfHostingCopyleftSpreadArt}
          />
          <p>
            The trigger is the part people get wrong. Running an app unmodified, or keeping your
            changes inside your home or company, triggers nothing. GPL activates when you
            distribute the program to others. AGPL also activates when people merely use your
            modified version over a network, which is what a hosted service is.
          </p>
          <MarkerArt
            caption="Copyleft triggers only when your modified copy reaches other people."
            svg={softwareLicensesForSelfHostingCopyleftTriggerArt}
          />
        </section>

        <section className="license-section" id="license-families">
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
