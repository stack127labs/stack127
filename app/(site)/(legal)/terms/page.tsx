import { InfoPage, infoUpdatedClassName } from "@/app/info-page";
import { siteHeroTermsArt } from "../../art/site--hero-terms";

export default function TermsPage() {
  return (
    <InfoPage
      heading={
        <>
          Terms and conditions to use <mark>stack127</mark>
        </>
      }
      heroArt={siteHeroTermsArt}
      intro={
        <p>
          These terms cover the tools, directories, reference pages, and courses on stack127.
          They explain how you can use the site and what to consider when relying on its information.
        </p>
      }
      slug="terms"
      title="Terms"
    >
        <section>
          <h2>Using the site</h2>
          <p>
            You can read, search, and use stack127 tools, directories, reference pages, and courses
            for personal projects or professional work. The site also links to software projects
            and external resources. stack127 does not provide managed services, operate a marketplace,
            conduct security audits for you, or provide professional advice.
          </p>
          <p>
            Please do not abuse the site, attack it, overload it, scrape it aggressively, bypass limits, or use it in a way that breaks the law. Normal browsing, reasonable research, and respectful crawling are fine. Trying to break the site is not.
          </p>
        </section>

        <section>
          <h2>Information accuracy</h2>
          <p>
            We try to keep technical information accurate, useful, and clearly sourced where it matters. That includes the data and stats we present, the logic and assumptions our tools and calculators use, and any buying guidance or step-by-step explanations we provide on the site.
          </p>
          <p>
            Still, technical details change. Software updates, product specs, prices, APIs, docs, laws, hosting limits, integrations, and platform rules can move after a page is published. Verify important details from the official source before installing, buying, deploying, automating, or relying on anything.
          </p>
        </section>

        <section>
          <h2>No warranties</h2>
          <p>
            stack127 is provided as-is. We do not promise that every page, link, calculation, explanation, recommendation, image, table, or technical note will always be complete, current, secure, available, or suitable for your setup.
          </p>
          <p>
            Technical decisions have tradeoffs. Something that works well for one person may be wrong for another setup, team, budget, skill level, compliance requirement, device mix, or threat model. Treat stack127 as a starting point, not the final decision maker.
          </p>
        </section>

        <section>
          <h2>Third-party resources</h2>
          <p>
            stack127 can mention or link to projects, products, services, docs, repositories, app stores, marketplaces, communities, brands, logos, and trademarks that belong to other people or companies.
          </p>
          <p>
            Mentioning something does not mean we own it, represent it, endorse every part of it, or guarantee that it is safe, supported, available, or right for your use case. If something is wrong, outdated, or should be credited differently, contact us and we can review it.
          </p>
        </section>

        <section>
          <h2>Actions you take</h2>
          <p>
            Some pages may point you toward commands, downloads, configuration changes, calculators, product choices, automation ideas, networking changes, or third-party websites. You are responsible for checking the details before using them.
          </p>
          <p>
            Be careful with anything that asks you to run commands, expose ports, grant permissions, connect accounts, buy hardware, change DNS, import data, or store private information. We can explain and link to useful resources, but we cannot inspect every dependency, product, script, service, or setup path for you.
          </p>
        </section>

        <section>
          <h2>Changes</h2>
          <p>
            We can update the site, pages, data, features, and these terms as stack127 evolves. The site may add new directories, tools, calculators, references, analytics, monetization, or editorial workflows over time.
          </p>
          <p>
            Questions can go to <a href="mailto:stack127@proton.me">stack127@proton.me</a>.
          </p>
          <p className={infoUpdatedClassName}>Last updated: September 15, 2026.</p>
        </section>
    </InfoPage>
  );
}
