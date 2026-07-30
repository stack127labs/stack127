import { InfoPage, infoUpdatedClassName } from "../../info-page";
import { proseLedeClassName } from "../../prose";

export default function PrivacyPage() {
  return (
    <InfoPage slug="privacy" title="Privacy">
        <p className={proseLedeClassName}>
          version127 is a technical directory. We try to collect as little personal information as we can while still keeping the site useful, fast, and safe.
        </p>

        <section>
          <h2>What we collect</h2>
          <p>
            version127 is hosted on a VPS we manage, with Cloudflare in front of it for DNS, edge CDN, caching, performance, and basic security protection. That means a normal page request may pass through Cloudflare first, then reach the version127 server.
          </p>
          <p>
            Cloudflare, the VPS, and the application may process normal request details like the page URL, time of request, IP address, browser type, device type, referrer, cache status, security events, and basic error information. This is the technical layer needed to serve pages, keep the site fast, debug broken behavior, and spot abuse.
          </p>
          <p>
            When you use a domain registration tool, the queried domain name is sent to the registry and registrar that operate its ending. Registration facts are cached on our server for a bounded time, keyed by domain name, so repeated checks do not keep contacting the same registry. Requester identifiers are used temporarily for rate limiting and are never persistently associated with a cached lookup.
          </p>
          <p>
            We use a self-hosted Umami analytics setup to understand how pages are performing. Umami analytics data is anonymized and aggregate-focused. It can include page views, referrers, device type, browser, operating system, country-level location, and basic visit patterns. The goal is to understand which pages are useful, not to identify you, build an advertising profile, or track you across websites.
          </p>
          <p>
            If you email us at <a href="mailto:version127@proton.me">version127@proton.me</a>, we receive the email address, message, and any files or context you choose to send. Please do not send passwords, private keys, recovery codes, or anything you would not want sitting in an inbox.
          </p>
        </section>

        <section>
          <h2>How we use it</h2>
          <p>
            We use Cloudflare and server logs to keep pages reachable, cache static assets, understand failures, reduce spam or abusive traffic, and protect the VPS from obvious attacks. These logs are operational. They are not meant to become a reader profile.
          </p>
          <p>
            Domain lookup cache entries contain registration facts and the time they were fetched. They do not contain a requester address, session, or visitor identifier. We do not build a history that connects domain lookups to visitors, and we do not sell or share the cached registration data.
          </p>
          <p>
            We use Umami analytics to see which pages are worth improving, which search paths are useful, and where the site feels thin. For example, aggregate traffic patterns can tell us whether people care more about self-host apps, automation tools, calculators, reference pages, or something else we should build next.
          </p>
          <p>
            If you contact us, we use your message and email address to reply, follow up on the issue, and keep enough context to understand what happened.
          </p>
        </section>

        <section>
          <h2>What we share</h2>
          <p>
            We do not sell personal information. Cloudflare will receive and process traffic information because it sits in front of the site as the CDN and security edge. Our VPS provider may process server-level information because the site runs on its infrastructure.
          </p>
          <p>
            A registry or registrar receives the domain name needed to answer a registration lookup, along with ordinary network request details from our server. Those operators have their own privacy practices and retention rules.
          </p>
          <p>
            We may also share limited information if required by law, to respond to abuse, to protect the site, or to investigate security problems. We are not trying to turn version127 into a data business.
          </p>
        </section>

        <section>
          <h2>External links</h2>
          <p>
            version127 links to project websites, source repositories, docs, Docker pages, app stores, community pages, and other third-party sites. Opening those links can send information to those sites, including your IP address, browser details, and the fact that you came from version127.
          </p>
          <p>
            Those sites have their own privacy practices, cookies, analytics, downloads, and account systems. We do not control them, and this privacy page only covers version127 itself.
          </p>
        </section>

        <section>
          <h2>Your choices</h2>
          <p>
            You can use browser settings, content blockers, DNS tools, tracker blocking, private browsing, or similar tools to limit analytics and third-party requests. The site should still be useful without an account or login.
          </p>
          <p>
            You can also contact us if you have a privacy question or want us to delete an email conversation we have with you. We may keep limited records when needed for security, abuse prevention, or legal reasons, but we will keep the request practical.
          </p>
        </section>

        <section>
          <h2>Changes</h2>
          <p>
            version127 is early and will change. If we add new analytics, ads, affiliate links, accounts, comments, newsletters, saved lists, uploads, or other features that change what data is collected, this page should be updated before or alongside that change.
          </p>
          <p>
            The current contact email is <a href="mailto:version127@proton.me">version127@proton.me</a>.
          </p>
          <p className={infoUpdatedClassName}>Last updated: July 29, 2026.</p>
        </section>
    </InfoPage>
  );
}
