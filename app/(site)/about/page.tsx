import { InfoPage } from "../../info-page";
import { proseLedeClassName } from "../../prose";

/*
 * Personal and site socials. Verified links only: add new entries here as
 * handles are confirmed, and the Follow along section renders them.
 */
const personalSocials = [
  { href: "https://www.youtube.com/channel/UCUHbmZChzXhlV6KK9Vk_daw", label: "YouTube" },
  { href: "https://muckrack.com/ravitejaknts", label: "my published writing" },
];

const siteSocials = [{ href: "https://github.com/version127", label: "GitHub" }];

function SocialLinks({ links }: { links: { href: string; label: string }[] }) {
  return (
    <>
      {links.map((link, index) => (
        <span key={link.href}>
          {index > 0 ? ", " : ""}
          <a href={link.href} rel="noreferrer" target="_blank">
            {link.label}
          </a>
        </span>
      ))}
    </>
  );
}

export default function AboutPage() {
  return (
    <InfoPage slug="about" title="About">
        <p className={proseLedeClassName}>
          Version127 is a practical technical directory built and maintained by one person: me, Ravi Teja KNTS, from India. It is for everyone who likes to tinker with the tech they use.
        </p>

        <section>
          <h2>Who runs this</h2>
          <p>
            I have spent the last several years as a tech writer for publications like TechWiser, iGeeksBlog, and TECHPP, explaining consumer tech in plain language. Somewhere along the way I started self-hosting my own apps, and a few years later I finally made myself some time to build a website about the things I am genuinely excited about: self-hosting, open source software, home automation, AI agents, and way more techy stuff.
          </p>
          <p>
            I like to keep things simple, because that is when things actually fit in my tiny brain. Just never at the cost of depth. Every page here tries to hold both.
          </p>
        </section>

        <section>
          <h2>Why version127?</h2>
          <p>
            The 127 is localhost. 127.0.0.1. Duh. It is the address every self-hosted app calls home, so it felt right.
          </p>
          <p>
            And the version part? Honestly, even I do not know. Do not ask me. I got the domain and we are rolling with it.
          </p>
        </section>

        <section>
          <h2>What I am building</h2>
          <p>
            The first directory is self-host apps because it is a good test of the format: lots of tools, lots of fast-moving projects, and lots of details that need to be structured instead of buried in paragraphs.
          </p>
          <p>
            Over time, Version127 keeps growing into the rest of what I tinker with: open-source tools, home automation, AI agents, networking references, status codes, calculators, and other technical pages that are useful to keep around.
          </p>
        </section>

        <section>
          <h2>How I want it to feel</h2>
          <p>
            Small, fast, technical, and direct. The goal is to help you compare options, find official links, and understand the basics quickly without forcing you through a long article for every tiny answer.
          </p>
          <p>
            I prefer structured facts over long reviews: project name, summary, links, license, publisher, release signal, and practical metadata. If something is unknown, I would rather say unknown than pretend.
          </p>
        </section>

        <section>
          <h2>How I handle data</h2>
          <p>
            Some pages use structured data, scripts, and manual review so listings can be checked, refreshed, and improved over time. The aim is not to generate endless prose. The aim is to keep useful facts trackable.
          </p>
          <p>
            I want important content to be easy for humans, search engines, and AI agents to read. That means stable pages, server-rendered content where it matters, clear links, and layouts that do not require clicking through a pile of routes just to understand the page.
          </p>
        </section>

        <section>
          <h2>Follow along</h2>
          <p>
            I am not that popular, but if you follow me, that is great. You can find me on <SocialLinks links={personalSocials} />.
          </p>
          <p>
            Version127 itself lives on <SocialLinks links={siteSocials} />, where the public repositories behind the tools are open to poke at.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Found a wrong link, outdated app detail, missing project, or something worth adding? Email <a href="mailto:version127@proton.me">version127@proton.me</a>.
          </p>
          <p>
            Short, specific notes help most: project name, official link, what is wrong, and where you verified it. That makes it easier for me to fix the directory cleanly.
          </p>
        </section>
    </InfoPage>
  );
}
