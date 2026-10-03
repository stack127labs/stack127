import { InfoPage, infoUpdatedClassName } from "@/app/ui/site/info-page";
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
          They explain how you can use the site and what to check before you rely on it.
        </p>
      }
      slug="terms"
      title="Terms"
    >
        <section>
          <h2>Using the site</h2>
          <p>
            You can read, search, and use stack127 tools, directories, reference pages, and
            courses for personal or professional work. The site also links to software projects
            and other resources. stack127 doesn&apos;t provide managed services, run a
            marketplace, do security audits for you, or give professional advice. That includes
            legal, tax, and financial advice.
          </p>
          <p>
            Don&apos;t abuse the site, attack it, overload it, scrape it aggressively, get around
            its limits, or use it to break the law. Normal browsing, research, and respectful
            crawling are fine.
          </p>
        </section>

        <section>
          <h2>Information accuracy</h2>
          <p>
            We try to keep information accurate, useful, and sourced where it matters. That covers
            the data we show, the logic and assumptions behind our tools and calculators, and any
            guidance or steps on the site.
          </p>
          <p>
            Details still change. Software, product specs, prices, fees, royalty rates, APIs,
            laws, and platform rules can change after a page is published. Check the official
            source before you buy, publish, deploy, set prices, or rely on anything.
          </p>
        </section>

        <section>
          <h2>No warranties</h2>
          <p>
            stack127 is provided as-is. We don&apos;t promise that any page, link, calculation,
            explanation, recommendation, image, or table will always be complete, current,
            secure, available, or right for your situation.
          </p>
          <p>
            What works for one person may be wrong for another project, budget, skill level,
            legal requirement, or risk. Use stack127 as a starting point, not the final decision.
          </p>
        </section>

        <section>
          <h2>Third-party resources</h2>
          <p>
            stack127 may mention or link to projects, products, services, docs, repositories,
            app stores, marketplaces, communities, brands, logos, and trademarks owned by others.
          </p>
          <p>
            Mentioning something doesn&apos;t mean we own it, represent it, fully endorse it, or
            guarantee it&apos;s safe, supported, available, or right for you. If something is
            wrong, outdated, or should be credited differently, contact us and we&apos;ll review
            it.
          </p>
        </section>

        <section>
          <h2>Actions you take</h2>
          <p>
            Some pages point you to commands, downloads, settings, calculators, prices, product
            choices, or other websites. You&apos;re responsible for checking the details before
            you act on them.
          </p>
          <p>
            Be careful with anything that asks you to run commands, open ports, grant permissions,
            connect accounts, make a purchase, change DNS, import data, or store private
            information. We explain things and link to useful resources, but we can&apos;t check
            every product, script, service, or setup for you.
          </p>
        </section>

        <section>
          <h2>Changes</h2>
          <p>
            We may update the site, pages, data, features, and these terms as stack127 changes.
            We may add tools, directories, references, courses, paid features, ads, or analytics
            over time.
          </p>
          <p>
            Send questions to <a href="mailto:stack127@proton.me">stack127@proton.me</a>.
          </p>
          <p className={infoUpdatedClassName}>Last updated: October 2, 2026.</p>
        </section>
    </InfoPage>
  );
}
