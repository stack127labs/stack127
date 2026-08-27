import Link from "next/link";
import { InfoPage } from "@/app/info-page";
import { proseLedeClassName } from "@/app/prose";

export default function AboutPage() {
  return (
    <InfoPage
      heading={
        <>
          About <mark>stack127</mark>
        </>
      }
      slug="about"
      title="About"
    >
        <p className={proseLedeClassName}>
          stack127 is a practical technical directory built and maintained by me, Ravi Teja KNTS (just call me Teja). It is for everyone who likes to tinker with the tech they use.
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
          <h2>Why stack127?</h2>
          <p>
            The 127 is localhost: 127.0.0.1, the address every self-hosted app calls home.
            The stack is everything we build, run, connect, and keep learning about along the way.
          </p>
        </section>

        <section>
          <h2>What I am building here</h2>
          <p>
            Jargon-free, visual-first tinkerer&apos;s tools, directories, guides, and what not. Whatever the page requires. If you are into self-hosting, love to automate your tech, or play with AI agents, you will surely find something you like to check out.
          </p>
          <p>And by the way, here are just a few pages we currently have that I am proud of:</p>
          <ul>
            <li>
              <Link href="/self-host-apps">Self-host apps</Link>, a directory of apps worth running yourself
            </li>
            <li>
              <Link href="/dns-tools">DNS tools</Link> for seeing what your domain is really doing
            </li>
            <li>
              <Link href="/domain-tools">Domain tools</Link> that answer straight from the registry
            </li>
            <li>
              <Link href="/self-hosting-for-beginners">Self-hosting for beginners</Link>, a course that assumes no Linux knowledge
            </li>
            <li>
              <Link href="/software-licenses-for-self-hosting">Software licenses</Link>, what those license labels actually mean
            </li>
          </ul>
        </section>

        <section>
          <h2>Follow along</h2>
          <p>
            I am not that popular, but if you follow me, that is great. I am on{" "}
            <a href="https://x.com/RaviTejaKNTS" rel="noreferrer" target="_blank">
              X
            </a>
            .
          </p>
          <p>
            Most of the tools and directories on this website are open source, so you can self-host them too. The code sits in our{" "}
            <a href="https://github.com/stack127labs" rel="noreferrer" target="_blank">
              GitHub repos
            </a>{" "}
            and is constantly updated.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Found a wrong link, an outdated app detail, or a missing project? Email <a href="mailto:stack127@proton.me">stack127@proton.me</a>. Tell me what is wrong and where you found the right answer, and I will fix it.
          </p>
        </section>
    </InfoPage>
  );
}
