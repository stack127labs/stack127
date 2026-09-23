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
          stack127 is a toolbox and reference hub for solo builders, indie hackers, content
          creators, and tinkerers creating things online, built by Ravi Teja KNTS.
        </p>
      }
      slug="about"
      title="About"
    >
        <section>
          <h2>Who runs this</h2>
          <p>
            I have spent the last several years as a tech writer for publications like TechWiser,
            iGeeksBlog, and TECHPP, explaining consumer tech in plain language. Along the way I
            started self-hosting my own apps. That curiosity grew into stack127, a place to build
            useful resources around the things I explore.
          </p>
          <p>
            Sometimes that means running a home server. Sometimes it means automating work,
            trying an AI tool, or exploring an idea that could earn money. When I keep running
            into the same question or awkward task, I look for a tool, directory, or explanation
            that would help someone else through it too.
          </p>
        </section>

        <section>
          <h2>Why stack127?</h2>
          <p>
            The 127 comes from 127.0.0.1, the loopback address for localhost. It&apos;s the address
            that always points back to your own machine, the place where you build and test before
            anything goes out into the world.
          </p>
          <p>
            That&apos;s what this site is for. Tools to test things out, directories and reference
            pages to check and explore. The stack is everything we build, run, and keep collecting
            along the way.
          </p>
          <p>
            Most of our tools are open source too. Download them, run them on your own machine.
          </p>
          <p>
            Find everything in the{" "}
            <a href="https://github.com/stack127labs" rel="noreferrer" target="_blank">
              stack127labs GitHub organization
            </a>
            .
          </p>
        </section>

        <section>
          <h2>What I am building here</h2>
          <p>
            Tools help you work through a task. Directories let you compare software and hardware.
            Reference pages put useful facts within reach, and courses walk through a subject in
            order. Some ideas become software products with a site of their own.
          </p>
          <p>
            You might be building a home lab, improving how you work, or trying to turn an idea
            into a business. You do not need to care about every subject here. Each resource
            should help with the thing you came to do, with enough detail to understand the answer.
          </p>
          <p>Here are a few places to start:</p>
          <ul>
            <li>
              <Link href="/cli-apps">CLI apps</Link>, a directory of tools for working in the terminal
            </li>
            <li>
              <Link href="/self-host-apps">Self-host apps</Link>, software you can run yourself
            </li>
            <li>
              <Link href="/domain-tools">Domain tools</Link> that answer straight from the registry
            </li>
            <li>
              <Link href="/self-hosting-for-beginners">Self-hosting for beginners</Link>, a course that assumes no Linux knowledge
            </li>
            <li>
              <Link href="/keyboard-shortcuts">Keyboard shortcuts</Link> for the apps you use
            </li>
            <li>
              <Link href="/labs">Labs</Link>, including BaseBuddy and our public software projects
            </li>
          </ul>
        </section>

        <section id="how-we-earn-money" style={{ scrollMarginTop: "calc(var(--top-bar-height) + var(--space-6))" }}>
          <h2>How we earn money</h2>
          <p>
            Some links on stack127 are affiliate links. If you buy through one, we earn a
            commission at no extra cost to you. Affiliate commissions do not influence our
            rankings or placement. We include a disclosure on directory pages where affiliate
            links appear.
          </p>
          <p>As an Amazon Associate I earn from qualifying purchases.</p>
          <p>
            As stack127 grows, we plan to offer paid tools and products alongside free resources.
            Advertising and relevant sponsorships may also help fund the work. Those are future
            options; affiliate links are the revenue source described here today.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Found a wrong link, an outdated app detail, or a missing project? Email <a href="mailto:stack127@proton.me">stack127@proton.me</a>. Tell me what is wrong and where you found the right answer, and I will fix it.
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
