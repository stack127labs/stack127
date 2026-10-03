import Link from "next/link";
import { InfoPage } from "@/app/ui/site/info-page";
import { siteHeroAboutArt } from "../../art/site--hero-about";

export default function AboutPage() {
  return (
    <InfoPage
      heading={
        <>
          About <mark>stack127</mark>
        </>
      }
      heroArt={siteHeroAboutArt}
      intro={
        <p>
          stack127 is a toolbox and reference hub for indie hackers, solo developers, and
          digital creators. It&apos;s built by Ravi Teja KNTS.
        </p>
      }
      slug="about"
      title="About"
    >
        <section>
          <h2>Who runs this</h2>
          <p>
            I spent several years as a tech writer for TechWiser, iGeeksBlog, and TECHPP,
            explaining consumer tech in plain language. Then I started building my own projects.
            stack127 is where I turn what I learn into resources for other people doing the same.
          </p>
          <p>
            When I keep hitting the same question or the same tedious task, I build a tool,
            directory, or reference page for it. If it helped me, it can probably help you too.
          </p>
        </section>

        <section>
          <h2>Why stack127?</h2>
          <p>
            The 127 comes from 127.0.0.1, the address that always points to your own computer.
            It&apos;s where you build and test before anything goes live.
          </p>
          <p>
            That&apos;s what this site is for: tools to test things, and directories and
            reference pages to check facts. The stack is everything we build and collect
            along the way.
          </p>
          <p>
            Most of our tools are open source. You can download them and run them on your own
            computer. Find them in the{" "}
            <a href="https://github.com/stack127labs" rel="noreferrer" target="_blank">
              stack127labs GitHub organization
            </a>
            .
          </p>
        </section>

        <section>
          <h2>What you&apos;ll find here</h2>
          <p>
            Tools help you finish one task. Directories help you compare services and software.
            Reference pages keep facts easy to look up. Courses teach a subject step by step.
            Some ideas grow into software products with their own site.
          </p>
          <p>
            You don&apos;t need every section. Use the one that helps with what you came to do.
            Good places to start:
          </p>
          <ul>
            <li>
              <Link href="/kdp-tools">KDP tools</Link> for pricing, royalties, and book setup on Amazon KDP
            </li>
            <li>
              <Link href="/saas-tools">SaaS tools</Link> for MRR, churn, and other subscription numbers
            </li>
            <li>
              <Link href="/platform-fees">Platform fees</Link> to compare what payment and selling platforms charge
            </li>
            <li>
              <Link href="/domain-tools">Domain tools</Link> that answer straight from the registry
            </li>
            <li>
              <Link href="/cli-apps">CLI apps</Link> and <Link href="/self-host-apps">self-host apps</Link> for developers
            </li>
            <li>
              <Link href="/labs">Labs</Link>, including BaseBuddy and our open source projects
            </li>
          </ul>
        </section>

        <section id="how-we-earn-money" style={{ scrollMarginTop: "calc(var(--top-bar-height) + var(--space-6))" }}>
          <h2>How we earn money</h2>
          <p>
            Some links on stack127 are affiliate links. If you buy through one, we earn a
            commission at no extra cost to you. Commissions never change our rankings or
            placement. Directory pages with affiliate links include a disclosure.
          </p>
          <p>As an Amazon Associate I earn from qualifying purchases.</p>
          <p>
            Later, we plan to add paid tools and products next to the free ones. Ads and
            sponsors may also help pay for the work. Today, affiliate links are our only
            income.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Found a wrong link, an outdated fact, or something missing? Email <a href="mailto:stack127@proton.me">stack127@proton.me</a>. Tell me what&apos;s wrong and where you found the right answer, and I&apos;ll fix it.
          </p>
          <p>
            You can also follow my work on{" "}
            <a href="https://x.com/RaviTejaKNTS" rel="noreferrer" target="_blank">
              X
            </a>
            .
          </p>
        </section>
    </InfoPage>
  );
}
