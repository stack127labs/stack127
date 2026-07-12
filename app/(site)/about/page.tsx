import Link from "next/link";
import { InfoPage } from "../../info-page";

export default function AboutPage() {
  return (
    <InfoPage slug="about" title="About">
        <p className="info-lede">
          Version127 is a practical technical directory for people who like useful software, clean tools, and clear references without a pile of fluff around them.
        </p>

        <section>
          <h2>What we are building</h2>
          <p>
            The first directory is self-host apps because it is a good test of the format: lots of tools, lots of fast-moving projects, and lots of details that need to be structured instead of buried in paragraphs.
          </p>
          <p>
            Over time, Version127 can grow into open-source tools, home automation, AI agents, networking references, status codes, calculators, SEO utilities, setup helpers, and other technical pages that are useful to keep around.
          </p>
        </section>

        <section>
          <h2>How we want it to feel</h2>
          <p>
            Small, fast, technical, and direct. The goal is to help you compare options, find official links, and understand the basics quickly without forcing you through a long article for every tiny answer.
          </p>
          <p>
            We prefer structured facts over long reviews: project name, summary, links, license, publisher, surfaces, release signal, categories, and practical metadata. If something is unknown, we would rather say unknown than pretend. License labels are explained on the{" "}
            <Link href="/software-licenses-for-self-hosting">software licenses</Link> reference.
          </p>
        </section>

        <section>
          <h2>How we handle data</h2>
          <p>
            Some pages use structured data, scripts, and manual review so listings can be checked, refreshed, and improved over time. The aim is not to generate endless prose. The aim is to keep useful facts trackable.
          </p>
          <p>
            We want important content to be easy for humans, search engines, and AI agents to read. That means stable pages, server-rendered content where it matters, clear links, minimal hidden data, and layouts that do not require clicking through a pile of routes just to understand the page.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Found a wrong link, outdated app detail, missing project, or something worth adding? Email <a href="mailto:version127@proton.me">version127@proton.me</a>.
          </p>
          <p>
            Short, specific notes help most: project name, official link, what is wrong, and where you verified it. That makes it easier to fix the directory cleanly.
          </p>
        </section>
    </InfoPage>
  );
}
