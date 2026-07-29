import { Languages } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../domain-tools-sidebar";
import { PunycodeTool } from "./punycode-tool";
import { PageTitleIcon } from "../../../page-title-icon";

export default function PunycodeConverterPage() {
  return (
    <AppShell
      mainLabel="Punycode and IDN Converter"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="punycode" />}
      sidebarLabel="Domain tools sidebar"
    >
      <main className="domain-tool-main">
        <header className="domain-page-header">
          <h1>
            <PageTitleIcon>
              <Languages strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            <mark>Punycode</mark> converter
          </h1>
          <p>
            Convert a domain name between the readable form and the{" "}
            <code>xn--</code> form DNS actually carries, in either direction. You also
            get every character that is not plain ASCII listed with its code point,
            which is how you spot a name built to look like a different one. It runs
            entirely in your browser and nothing is sent anywhere.
          </p>
        </header>

        <PunycodeTool />

        <hr className="domain-divider" />

        <article className="domain-reference-content">
          <section>
            <h2>What is punycode?</h2>
            <p>
              Punycode is a way of writing any Unicode text using only the characters DNS
              was built to carry: letters, digits and hyphens. Encoded names are marked
              with an <code>xn--</code> prefix so software knows to decode them.
            </p>
            <p>
              So <code>münchen.de</code> travels across the internet as{" "}
              <code>xn--mnchen-3ya.de</code>. Same domain, two representations. Your
              browser converts back for display, which is why you rarely see the encoded
              form unless something goes looking for it.
            </p>
          </section>

          <section>
            <h2>How do you convert punycode to a domain name?</h2>
            <p>
              Paste either form into the box. It detects which direction you need and
              shows both, along with a breakdown of every part of the name.
            </p>
            <p>
              Paste <code>xn--mnchen-3ya.de</code> and you get <code>münchen.de</code>.
              Paste <code>münchen.de</code> and you get the encoded form. A full web
              address works too, the hostname is extracted and the rest ignored.
            </p>
          </section>

          <section>
            <h2>Why do domain names have two forms?</h2>
            <p>
              DNS was designed in the early 1980s for a network that was almost entirely
              English, and it only carries a small set of ASCII characters. That was
              workable then and useless for most of the world.
            </p>
            <p>
              Rather than change DNS everywhere at once, which was never going to happen,
              an encoding was defined that packs any Unicode text into the characters DNS
              already accepted. The result is that internationalised domain names work on
              infrastructure that has no idea they exist.
            </p>
          </section>

          <section>
            <h2>What is a punycode phishing attack?</h2>
            <p>
              It is the reason this tool has a security use. Cyrillic а and Latin a look
              identical in almost every typeface, and they are entirely different
              characters. That means <code>аpple.com</code> with a Cyrillic first letter
              is a completely different domain from <code>apple.com</code>, available to
              register, and indistinguishable in a link.
            </p>
            <p>
              These are called homograph attacks. Mixing writing systems inside one part
              of a name is the usual shape, so this tool flags that and lists the exact
              code points so you can see which character is doing the impersonating.
            </p>
            <p>
              Be careful with the conclusion though. Plenty of legitimate names in
              multilingual regions mix scripts, and a name written entirely in Cyrillic is
              completely normal in a Cyrillic-speaking country. Mixed script is a reason
              to look closely, not a verdict.
            </p>
          </section>

          <section>
            <h2>What will this not catch?</h2>
            <p>
              Lookalikes built from ordinary ASCII. <code>paypaI.com</code> with a capital
              i, or <code>rn</code> standing in for <code>m</code>, are pure Latin
              characters and no script check will ever flag them.
            </p>
            <p>
              So a clean result here is not a clean bill of health. It means the name is
              not using the specific trick this tool detects. Reading the characters
              yourself is still worth doing.
            </p>
            <p>
              Browsers also make their own decisions about when to display a name
              readably and when to show the raw <code>xn--</code> version. Those rules
              differ between Chrome, Firefox and Safari and change over time, so what
              your address bar shows may not match what is here.
            </p>
          </section>

          <section>
            <h2>Why is my converted domain name too long?</h2>
            <p>
              Each part of a domain has a hard limit of 63 bytes, and encoding inflates
              things. A handful of non-ASCII characters can easily triple in length, so a
              name that looks short in its readable form can exceed the limit once
              encoded.
            </p>
            <p>
              People hit this unexpectedly when registering, which is why the breakdown
              above shows the byte count for each part against the ceiling and colours it
              as you approach.
            </p>
          </section>

          <section>
            <h2>Does punycode apply to the whole URL?</h2>
            <p>
              No, only the domain name. The path and query string of a URL use percent
              encoding, which is a completely different mechanism that produces things
              like <code>%20</code> for a space. If you paste a full address here, the
              hostname is taken and the rest is ignored.
            </p>
          </section>

          <section>
            <h2>Related tools</h2>
            <p>
              If a link looks wrong, converting it here shows the real characters. From
              there, the <Link href="/domain-tools/domain-age">domain age checker</Link>{" "}
              will tell you how recently the name was registered, which is often the more
              telling signal, and the{" "}
              <Link href="/domain-tools/domain-lookup">domain registration lookup</Link>{" "}
              gives you the whole record.
            </p>
          </section>
        </article>
      </main>
    </AppShell>
  );
}
