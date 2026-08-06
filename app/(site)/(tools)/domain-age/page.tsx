import "../../domain-tools/domain-tools.css";
import { CalendarClock } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { proseSectionFlowClassName } from "../../../prose";
import { DomainToolsSidebar } from "../../domain-tools/domain-tools-sidebar";
import { DomainAgeTool } from "./domain-age-tool";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

export default async function DomainAgePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="Domain Age Checker"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="age" />}
      sidebarLabel="Domain tools sidebar"
    >
      <main className="domain-tool-main">
        <header className="domain-page-header">
          <h1>
            <PageTitleIcon>
              <CalendarClock strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Domain <mark>age</mark> checker: how old is a domain?
          </h1>
          <p>
            Enter a domain name to see when its current registration was created
            and how old it is.
          </p>
          <p>
            The result shows the exact registration date, the domain’s age in
            plain language and, when the registry publishes enough information,
            whether the domain may have expired and been registered again.
          </p>
        </header>

        <DomainAgeTool initialName={first(params.name)} />

        <hr className="domain-divider" />

        <article
          className={`domain-reference-content ${proseSectionFlowClassName}`}
        >
          <section>
            <h2>What is a domain age checker?</h2>
            <p>A domain age checker answers a simple question:</p>
            <blockquote>
              <p>
                When was this domain registered, and how old is its current
                registration?
              </p>
            </blockquote>
            <p>
              For example, if a domain was registered on 15 March 2005, the
              result might show:
            </p>
            <ul>
              <li>Registered: 15 March 2005</li>
              <li>Domain age: 21 years</li>
              <li>Registration expires: 15 March 2027</li>
            </ul>
            <p>
              The date comes from the registry responsible for that domain
              ending.
            </p>
          </section>

          <section>
            <h2>Why would you check a domain’s age?</h2>

            <h3>Check a suspicious website</h3>
            <p>
              Imagine receiving an email from a company claiming it has operated
              for 15 years.
            </p>
            <p>
              You check its domain and discover that it was registered twelve
              days ago.
            </p>
            <p>
              That does not automatically prove the website is a scam, but the
              contradiction is a useful warning sign.
            </p>

            <h3>Verify a domain before buying it</h3>
            <p>
              A seller might advertise a domain as being 20 years old. Checking
              the registration date helps you confirm whether the registry record
              supports that claim.
            </p>
            <p>
              It cannot tell you whether the seller owned the domain for all those
              years.
            </p>

            <h3>Research a business or competitor</h3>
            <p>
              The registration date provides useful context when researching a
              company, website or competing product.
            </p>
            <p>
              A recently registered domain may belong to a new project. An older
              domain may have been used by several unrelated businesses during
              its lifetime.
            </p>

            <h3>Understand the domain’s SEO history</h3>
            <p>
              An older domain may have accumulated links, mentions and search
              history.
            </p>
            <p>
              Age itself does not automatically improve Google rankings. What
              happened on the domain during those years matters much more than
              the number of years it has existed.
            </p>
          </section>

          <section>
            <h2>What does domain age actually mean?</h2>
            <p>
              Domain age normally means the time since the creation date shown in
              the domain’s current registry record.
            </p>
            <p>It does not necessarily tell you:</p>
            <ul>
              <li>When the website launched</li>
              <li>When the business started</li>
              <li>How long the current owner has owned the domain</li>
              <li>Whether the domain always hosted the same content</li>
              <li>Whether someone else previously used the domain</li>
            </ul>
            <p>
              A domain’s registration date, website history, business age and
              ownership history are four different things.
            </p>
          </section>

          <section>
            <h2>What happens if a domain expires?</h2>
            <p>
              Suppose a domain was originally registered in 2005, expired in 2024
              and was registered again by someone else in 2026.
            </p>
            <p>
              Its current registry record may show a creation date in 2026. The
              previous 19 years may no longer appear in the current registration
              data.
            </p>
            <p>
              Some registries publish information that helps identify a
              re-registration. Many do not. When the registry does not provide
              enough information, the tool will say that the domain’s earlier
              history cannot be determined.
            </p>
          </section>

          <section>
            <h2>What does the result show?</h2>
            <p>
              Enter a domain such as <code>version127.com</code>. The result can
              include:
            </p>
            <ul>
              <li>The exact registration date</li>
              <li>The age in plain language</li>
              <li>The current expiration date, when published</li>
              <li>The registry responsible for the domain ending</li>
              <li>Re-registration information, when available</li>
              <li>A clear explanation when no creation date is published</li>
            </ul>
          </section>

          <section>
            <h2>Does an old domain mean a website is trustworthy?</h2>
            <p>No.</p>
            <p>
              Old domains can be sold, abandoned and repurposed. A website
              operating on a 20-year-old domain may have launched only a few
              months ago.
            </p>
            <p>
              Domain age is most useful as a contradiction detector. If a company
              claims decades of history but its domain was registered recently,
              that is worth investigating. A new domain by itself is not proof
              that anything is wrong.
            </p>
          </section>
        </article>
      </main>
    </AppShell>
  );
}
