import Link from "next/link";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../domain-tools-sidebar";
import { DomainAgeTool } from "./domain-age-tool";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export default async function DomainAgePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
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
          <h1>Domain age checker</h1>
          <p>
            Find out how old a domain is and when it was first registered, taken
            straight from the registry that runs the ending. You get the exact
            creation date, the age in plain language, and something most tools skip:
            whether the name was ever dropped and re-registered, which resets the
            clock and changes what the age actually means.
          </p>
        </header>

        <DomainAgeTool initialName={first(params.name)} />

        <hr className="domain-divider" />

        <article className="domain-reference-content">
          <section>
            <h2>What is domain age?</h2>
            <p>
              Domain age is the time since a domain name was registered, measured from
              the creation date in the registry&apos;s record. If a name was registered
              on 4 March 2003 and it is now 2026, the domain is 23 years old.
            </p>
            <p>
              That sounds simple, and the number is simple. What it means is where
              things get interesting, because the creation date records one specific
              event and people routinely read four different things into it.
            </p>
          </section>

          <section>
            <h2>How do you check a domain&apos;s age?</h2>
            <p>
              Enter the domain above. You will get the age in years and months, the
              exact registration date, and a bar showing how far through its current
              term the registration is.
            </p>
            <p>
              A full URL or a subdomain works fine, it gets reduced to the registered
              name automatically. Nothing to sign up for.
            </p>
          </section>

          <section>
            <h2>Why does domain age matter?</h2>
            <p>Four groups of people check this, for genuinely different reasons.</p>
            <ul>
              <li>
                <strong>Spotting fraud.</strong> Scam operations register domains in
                bulk and abandon them within weeks. A shop that emailed you today on a
                domain registered nine days ago is worth treating carefully. This is the
                strongest legitimate use.
              </li>
              <li>
                <strong>Buying a domain.</strong> Age is part of what you are paying for
                in the aftermarket, so it is worth verifying rather than taking the
                seller&apos;s word.
              </li>
              <li>
                <strong>Email deliverability.</strong> Spam filters weigh how long a
                sending domain has existed. A brand new domain sending volume gets
                treated with more suspicion than an established one.
              </li>
              <li>
                <strong>SEO and competitor research.</strong> An older domain in a niche
                has usually accumulated more links and history. Age itself is not a
                ranking factor, but it correlates with things that are.
              </li>
            </ul>
          </section>

          <section>
            <h2>What the creation date actually records</h2>
            <p>
              It records when the name was first registered by anyone. Not when the site
              launched, not when the business started, and not when the current owner
              bought it. Those are four different dates and only one of them is public.
            </p>
            <p>
              A domain registered in 2001 may have been sold three times since. There is
              no field anywhere in the public record marking when a name changed hands,
              so a fifteen year old domain and its current owner can have nothing to do
              with each other.
            </p>
          </section>

          <section>
            <h2>What happens to domain age when a name is dropped?</h2>
            <p>
              This is the one that catches people out. If a domain expires and nobody
              renews it, it eventually gets released and someone else can register it.
              When that happens the clock usually starts again. A name that existed
              happily for fifteen years, lapsed, and was picked up last month will often
              report last month.
            </p>
            <p>
              Some registries publish a separate re-registration date. When they do, this
              tool shows both, so you can see the name is old but the current
              registration is not. Most registries do not publish it, and in that case
              the honest answer is that we cannot tell, which is what the result says
              rather than implying the name has been held continuously.
            </p>
          </section>

          <section>
            <h2>Does an old domain mean a site is trustworthy?</h2>
            <p>
              No, and this is worth internalising. Old domains get bought and repurposed
              precisely because age reads as legitimacy, and buying an aged domain for
              that reason is a normal thing people do. Meanwhile the overwhelming
              majority of newly registered domains belong to someone starting an ordinary
              project.
            </p>
            <p>
              Where age genuinely helps is as a contradiction detector. A company page
              claiming two decades of history on a domain registered eight months ago is
              a real signal worth acting on. &quot;New domain, therefore suspicious&quot;
              is not.
            </p>
          </section>

          <section>
            <h2>How to see a domain&apos;s real history</h2>
            <p>
              You need a source that has been saving copies over time, which a
              registration lookup is not. This reads the current record and nothing else.
            </p>
            <p>
              For what a site looked like in the past,{" "}
              <a href="https://web.archive.org">the Internet Archive</a> is the practical
              option, and it will usually tell you more about whether a business is what
              it claims than any registration date will. If you want to know when the
              domain last changed hands, the registrar is the only party who knows and
              they will not tell you.
            </p>
          </section>

          <section>
            <h2>Why does this tool sometimes show no date?</h2>
            <p>
              Some registries do not publish a creation date at all, even when they
              answer every other question. Several country endings work this way. When
              that happens you get a clear statement that no date is published, rather
              than a blank space or a zero.
            </p>
            <p>
              Some endings publish no registration data at all, and those cannot be
              checked by any tool, including this one. The{" "}
              <Link href="/domain-tools/tld-directory">TLD directory</Link> lists which
              ones.
            </p>
          </section>

          <section>
            <h2>Related tools</h2>
            <p>
              For the full record behind the date, use the{" "}
              <Link href="/domain-tools/domain-lookup">domain registration lookup</Link>.
              To see when a domain expires and what happens afterwards, use the{" "}
              <Link href="/domain-tools/domain-expiry">expiry checker</Link>. If you are
              checking a suspicious link, the{" "}
              <Link href="/domain-tools/punycode-converter">punycode converter</Link>{" "}
              shows whether the name contains characters designed to imitate another
              domain.
            </p>
          </section>
        </article>
      </main>
    </AppShell>
  );
}
