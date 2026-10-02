import { InfoPage, infoUpdatedClassName } from "@/app/ui/site/info-page";
import { siteHeroPrivacyArt } from "../../art/site--hero-privacy";

export default function PrivacyPage() {
  return (
    <InfoPage
      heading={
        <>
          Privacy policy of <mark>stack127</mark>
        </>
      }
      heroArt={siteHeroPrivacyArt}
      intro={
        <p>
          stack127 collects as little personal information as it can while keeping the site useful,
          fast, and safe.
        </p>
      }
      slug="privacy"
      title="Privacy"
    >
        <section>
          <h2>What we collect</h2>
          <p>
            stack127 runs on a VPS we manage. Cloudflare sits in front of it for DNS, caching,
            speed, and basic security. A page request may pass through Cloudflare before it
            reaches our server.
          </p>
          <p>
            Cloudflare, the VPS, and the app may process normal request details. These include the
            page URL, time, IP address, browser, device type, referrer, cache status, security
            events, and basic error details. We need them to serve pages, keep the site fast, fix
            problems, and spot abuse.
          </p>
          <p>
            When you use a domain registration tool, the domain name you enter is sent to the
            registry and registrar for that domain ending. We cache the registration facts on our
            server for a limited time, keyed by domain name, so repeat checks don&apos;t keep
            contacting the registry. We use requester details briefly for rate limiting. We never
            store them with a cached lookup.
          </p>
          <p>
            We use self-hosted Umami analytics to see how pages perform. Umami data is anonymized
            and counted in aggregate. It can include page views, referrers, device type, browser,
            operating system, country, and basic visit patterns. We use it to learn which pages
            are useful, not to identify you, build an ad profile, or track you across websites.
          </p>
          <p>
            Google Analytics is optional. If you allow it, Google sets first-party cookies,
            including <code>_ga</code>. It receives the page path, referrer path, browser and
            device details, approximate location, and visit activity. stack127 removes query
            strings and fragments from page URLs before sending them. That keeps domain names,
            IP addresses, searches, and saved tool state in those URLs out of analytics. Google
            uses your IP address during collection to estimate location, but says Google
            Analytics 4 doesn&apos;t log or store individual IP addresses.
          </p>
          <p>
            If you email us at <a href="mailto:stack127@proton.me">stack127@proton.me</a>, we
            receive your email address, your message, and any files you send. Please don&apos;t
            send passwords, private keys, recovery codes, or anything you wouldn&apos;t want
            sitting in an inbox.
          </p>
        </section>

        <section>
          <h2>How we use it</h2>
          <p>
            We use Cloudflare and server logs to keep pages online, cache files, find failures,
            reduce spam and abuse, and protect the server from attacks. These logs are for running
            the site. We don&apos;t use them to build reader profiles.
          </p>
          <p>
            Cached domain lookups hold registration facts and the time we fetched them. They
            don&apos;t hold the requester&apos;s address, session, or any visitor ID. We
            don&apos;t link domain lookups to visitors, and we don&apos;t sell or share the cached
            registration data.
          </p>
          <p>
            We use Umami to see which pages are worth improving, which search paths work, and
            where the site falls short. For example, traffic patterns can show whether people
            use the KDP tools, SaaS calculators, directories, or reference pages more, and what we
            should build next.
          </p>
          <p>
            If you allow Google Analytics, we use its reports for the same purpose and to
            understand visits across pages. Advertising storage, Google Signals, and ad
            personalization stay off. We don&apos;t send custom events that contain tool input.
          </p>
          <p>
            If you contact us, we use your message and email address to reply, follow up, and
            keep enough context to understand the issue.
          </p>
        </section>

        <section>
          <h2>What we share</h2>
          <p>
            We don&apos;t sell personal information. Cloudflare receives and processes traffic
            details because it sits in front of the site as our CDN and security layer. Our VPS
            provider may process server-level details because the site runs on its hardware.
          </p>
          <p>
            A registry or registrar receives the domain name it needs to answer a lookup, plus
            normal network request details from our server. They have their own privacy and
            retention rules.
          </p>
          <p>
            Google receives the optional analytics data above only after you allow Google
            Analytics. Google handles that data under its own terms and privacy practices. Umami
            stays on servers we manage.
          </p>
          <p>
            We may share limited information when the law requires it, or to respond to abuse,
            protect the site, or investigate security problems.
          </p>
        </section>

        <section>
          <h2>External links</h2>
          <p>
            stack127 links to project websites, code repositories, docs, app stores, community
            pages, and other sites. Opening a link can send those sites your IP address, browser
            details, and the fact that you came from stack127.
          </p>
          <p>
            Those sites have their own privacy rules, cookies, analytics, and accounts. We
            don&apos;t control them. This page covers only stack127.
          </p>
        </section>

        <section>
          <h2>Your choices</h2>
          <p>
            You can limit analytics and third-party requests with browser settings, content
            blockers, DNS filtering, tracker blocking, or private browsing. The site works without
            an account or login.
          </p>
          <p>
            You can decline Google Analytics when the consent bar appears. To change your choice
            later, open <strong>analytics settings</strong> in the site footer. Turning Google
            Analytics off saves your choice, tells the tag that analytics storage is denied, and
            deletes the Google Analytics first-party cookies that stack127 can access. Umami
            doesn&apos;t use cookies and stays on.
          </p>
          <p>
            You can also contact us with a privacy question, or to ask us to delete an email
            conversation with you. We may keep limited records when we need them for security,
            abuse prevention, or legal reasons.
          </p>
        </section>

        <section>
          <h2>Changes</h2>
          <p>
            stack127 is new and will change. If we add analytics, ads, accounts, comments,
            newsletters, saved lists, uploads, or other features that change what data we
            collect, we&apos;ll update this page before or alongside that change.
          </p>
          <p>
            Contact us at <a href="mailto:stack127@proton.me">stack127@proton.me</a>.
          </p>
          <p className={infoUpdatedClassName}>Last updated: October 2, 2026.</p>
        </section>
    </InfoPage>
  );
}
