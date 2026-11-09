# Error monitoring apps: discovery list

Checked on 2026-11-04. This is step 1, for owner review. Prices, detailed features, headquarters, and legal terms still need per-app research.

One row means one product choice. Bundled features appear as extra type labels. APM means application performance monitoring: finding why an app is slow. Logs are the records an app writes while running. Cron monitoring watches scheduled jobs that can fail silently. Dependency monitoring watches the outside services your app uses.

- **active**: an official product page, documentation page, or project repository opened and offered the relevant product. This means it appears to operate. No account, ingestion, payment, or alert delivery was tested.
- **gray**: the official page opened, but solo-builder cost, scope, release maturity, or current packaging needs an owner decision or another check. Gray does not mean dead.
- **check again**: retrieval failed or current availability could not be confirmed. These are leads, not verified active listings.
- **Unknown** in the region column means no home country or market restriction was established. English copy and a .com address do not prove worldwide availability. Self-hosted means you run the software yourself, not that hosting is free.
- **Open source** below follows the official site's description at this stage. Exact licenses, paid-only features, and hosting requirements must be checked later. "License review" avoids assuming visible source code is an unrestricted open-source license.
- Discovery IDs link to the source register in [notes.md](notes.md). `Brief` means the owner's seed list. `Lead` means a researcher-supplied candidate, checked against its own site. A discovery source never proves a competitor's features.
- Official URLs are also the existence/fit evidence unless another official evidence link is in the reason. Dates record our retrieval date, not a vendor's publication date. For `check again`, the date is an attempted check, not a successful confirmation.

## Error and crash tracking

| Name | Official URL | Type and delivery | Home region / markets | Why it belongs; current identity | Found through | Status | Site checked |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Sentry | https://sentry.io/ | Error; APM; logs; hosted + self-host, license review | Unknown | Error and performance tracking. Main site returned unsupported Markdown; [official repository](https://github.com/getsentry/sentry) opened. Recheck hosted offer. | Brief; V1; C1 | check again | 2026-11-04 |
| BugSnag | https://www.bugsnag.com/ | Error; APM; hosted | Unknown | Crash and stability monitoring for web and mobile; SmartBear branding remains visible. | Brief; V1; R1 | active | 2026-11-04 |
| Rollbar | https://rollbar.com/ | Error; replay; hosted | Unknown | Captures production errors and connects them to releases; free start is advertised. | Brief; V1 | active | 2026-11-04 |
| Honeybadger | https://www.honeybadger.io/ | Error; logs; APM; uptime; cron; status; hosted | Unknown | A small-builder monitoring bundle; includes missed-job and outage detection. | Brief; V1; F1 | active | 2026-11-04 |
| GlitchTip | https://glitchtip.com/ | Error; uptime; APM; hosted + self-host, open source | Unknown | Sentry-client-compatible error collection with a self-host path. | Brief; V1 | active | 2026-11-04 |
| Bugsink | https://www.bugsink.com/ | Error; hosted + self-host, license review | Unknown | Focused error tracker designed to run on your own server. | C2; F1 | active | 2026-11-04 |
| Airbrake | https://www.airbrake.io/ | Error; performance; hosted | Unknown | Active error-monitoring offer with a public trial link. Ownership needs a later source check. | V1; D2 | active | 2026-11-04 |
| Raygun | https://raygun.com/ | Error; APM; hosted | Unknown | Crash diagnosis and application monitoring for web and mobile. | D2; Lead | active | 2026-11-04 |
| TrackJS | https://trackjs.com/ | Error; hosted | Unknown | JavaScript error diagnosis for browser and Node.js apps. Hosting the client script yourself is not self-hosting the service. | D2 | active | 2026-11-04 |
| elmah.io | https://elmah.io/ | Error; logs; uptime; cron; hosted | Unknown | Error logging and uptime monitoring for .NET and JavaScript apps. | F1; D2 | active | 2026-11-04 |
| Errbit | https://errbit.com/ | Error; self-host, open source | Self-host; maintainer region unknown | Collects application errors through an Airbrake-compatible interface. | D2 | active | 2026-11-04 |
| Exceptionless | https://exceptionless.com/ | Error; logs; hosted + self-host, open source | Unknown | Captures unhandled errors and custom events; official site offers self-hosting. | F1 | active | 2026-11-04 |
| Telebugs | https://telebugs.com/ | Error; self-host commercial; managed option | Unknown | A self-hosted Sentry-compatible error tracker; managed service is also advertised. | D2 | active | 2026-11-04 |
| Hawk | https://hawk.so/ | Error; open source, deployment details to check | Unknown | Error collection and alerts; official site links its code. | D2 | active | 2026-11-04 |
| LogRocket | https://logrocket.com/ | Error; replay; performance; hosted | Unknown | Shows browser errors beside a replay of what the user did. Also: analytics. | V1; R1 | active | 2026-11-04 |
| PostHog | https://posthog.com/error-tracking | Error; replay; hosted, edition limits to check | Unknown | Captures errors with user and session context. Also: analytics. Do not assume every feature is self-hostable. | C1; D1 | active | 2026-11-04 |
| Firebase Crashlytics | https://firebase.google.com/products/crashlytics | Error; mobile crash tracking; hosted | Unknown | Crash reporting for Android, Apple, Flutter, and Unity apps. Also: databases and backend. | Lead | active | 2026-11-04 |
| Measure | https://measure.sh/ | Error; mobile performance; hosted + self-host, open source | Unknown | Mobile crash and app-not-responding diagnosis; official site describes an open-source option. | D2; F1 | active | 2026-11-04 |
| Bugfender | https://bugfender.com/ | Error; remote device logs; hosted | Unknown | Captures mobile logs and crash context, including errors outside the browser. | F1 | active | 2026-11-04 |
| Flare | https://flareapp.io/ | Error; performance; logs; hosted | Unknown | Laravel-focused error and performance monitoring from Spatie. | Lead | active | 2026-11-04 |
| Laravel Nightwatch | https://laravel.com/nightwatch | Error; APM; Laravel; hosted | Unknown | Laravel application monitoring; the old domain redirects here. Errors, slow requests, and job execution are shown on the official page. | Lead | active | 2026-11-04 |
| Warnly | https://warnly.io/ | Error; self-host, open source | Self-host; maintainer region unknown | Official site offers exception monitoring and self-host installation. | D2 | active | 2026-11-04 |
| CatchJS | https://catchjs.com/ | Error; browser performance; hosted | Unknown | JavaScript errors, screenshots, and browser performance diagnosis. | F1 | active | 2026-11-04 |
| Everframe | https://everframe.dev/ | Error; crash reports; hosted | Unknown | Automatic crashes and user reports across mobile, web, and TV apps. Also: customer support. | F1 | active | 2026-11-04 |
| RealUptime | https://realuptime.io/errors | Error; uptime family; hosted | Unknown | Groups exceptions and alerts on new or recurring errors; separate error product within RealUptime. | F1 | active | 2026-11-04 |
| Bugsee | https://www.bugsee.com/ | Error; replay; device logs; hosted | Unknown | Mobile crash reports with logs and replay context. | Lead | active | 2026-11-04 |
| Bug Recorder | https://bugrecorder.com/ | Error; logs; replay; uptime; hosted | Unknown | Founder-focused production errors, replay, and health checks. Also: analytics; customer support. | D3 | active | 2026-11-04 |
| Backtrace | https://backtrace.io/ | Error; native/game crashes; hosted | Unknown | Crash reporting for games and mobile apps; solo pricing still needs checking. | D2 | gray | 2026-11-04 |
| OpenReplay | https://openreplay.com/ | Error diagnosis; replay; hosted + self-host | Unknown | Session replay and developer tools help investigate broken browser flows. Also: analytics; customer support. Confirm automatic error alerts before final inclusion. | Lead | gray | 2026-11-04 |
| Luciq, formerly Instabug | https://www.luciq.ai/ | Error; mobile performance; hosted | Unknown | Official site confirms the rebrand and mobile crash monitoring. Public solo purchase path remains unclear. Also: customer support; analytics. | R1 | gray | 2026-11-04 |
| Countly | https://countly.com/ | Crash analytics candidate; hosted + on-premises | Unknown | Consider for analytics-linked crash diagnosis. Homepage favors paid private cloud; check crash feature and community-edition access. Also: analytics. | Lead | gray | 2026-11-04 |
| AppMetrica | https://appmetrica.yandex.com/about | Mobile crash/analytics candidate; hosted | English and Russian pages; eligibility unknown | Official analytics service exists. Confirm current crash reporting and geographic restrictions before inclusion. Also: analytics. | Lead | gray | 2026-11-04 |
| Google Cloud Error Reporting | https://docs.cloud.google.com/error-reporting/docs/grouping-errors | Error tracking; hosted | Global service per docs; storage rules need research | Groups errors reported directly or found in logs. Also: hosting and deploy. | Lead | active | 2026-11-04 |

## Uptime, browser checks, and service health

A browser check runs an important user action, such as opening checkout, to catch failures that a basic page check misses.

| Name | Official URL | Type and delivery | Home region / markets | Why it belongs; current identity | Found through | Status | Site checked |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UptimeRobot | https://uptimerobot.com/ | Uptime; cron; status; hosted | Unknown | Website and service availability with a public free plan. | Brief; V2; F1 | active | 2026-11-04 |
| Better Stack | https://betterstack.com/ | Uptime; logs; errors; traces; status; hosted | Unknown | Combines outage detection, debugging, and alerts. Logtail and Better Uptime are not extra apps. | Brief; V1; V3 | active | 2026-11-04 |
| Pingdom | https://www.pingdom.com/ | Uptime; browser performance; hosted | Unknown | Outside checks and real-user performance monitoring; SolarWinds branding. | Brief; V2 | active | 2026-11-04 |
| Uptime Kuma | https://github.com/louislam/uptime-kuma | Uptime; status; self-host, open source | Self-host; maintainer region unknown | Service checks, alerts, and status pages. Project repository opened after homepage returned 403. | Brief; G1; C2 | active | 2026-11-04 |
| Instatus | https://instatus.com/ | Uptime; status; hosted | Unknown | Public site now combines monitoring with status pages and incident response. | Brief; F1 | active | 2026-11-04 |
| StatusCake | https://www.statuscake.com/ | Uptime; performance; status; hosted | Unknown | Availability, page speed, certificate, and server monitoring. | V2; F1 | active | 2026-11-04 |
| updown.io | https://updown.io/ | Uptime; cron; status; hosted | Unknown | Focused service checks with published check-based pricing. | V2; C3 | active | 2026-11-04 |
| Hyperping | https://hyperping.com/ | Uptime; browser checks; cron; logs; status; hosted | Unknown | Availability checks and incident tools in one service. | V2; D4 | active | 2026-11-04 |
| Pulsetic | https://pulsetic.com/ | Uptime; cron; status; hosted | Unknown | Website checks and customer-facing outage pages. | V2; C3 | active | 2026-11-04 |
| Oh Dear | https://ohdear.app/ | Uptime; cron; performance; hosted | Unknown | Website health checks also cover app health and scheduled tasks. | V2; C3 | active | 2026-11-04 |
| OnlineOrNot | https://onlineornot.com/ | Uptime; cron; status; hosted | Unknown | Availability checks with failure confirmation and alerts. | V2; F1 | active | 2026-11-04 |
| Site24x7 | https://www.site24x7.com/ | Uptime; APM; logs; infrastructure; hosted | Unknown | Broad monitoring with a website-monitoring entry point. Confirm relevant small plan costs. | V2; Lead | active | 2026-11-04 |
| Uptrends | https://www.uptrends.com/ | Uptime; browser/API checks; hosted | Unknown | Checks user journeys and API availability from outside the app; verify entry-plan affordability. | V2; Lead | gray | 2026-11-04 |
| Uptime.com | https://uptime.com/ | Uptime; browser checks; cron; hosted | Unknown | Website, API, and heartbeat checks; check current minimum purchase. | V2; Lead | gray | 2026-11-04 |
| HetrixTools | https://hetrixtools.com/ | Uptime; server health; status; hosted | Unknown | Free entry offer for service and server monitoring. | C3; D4 | active | 2026-11-04 |
| Uptimia | https://www.uptimia.com/ | Uptime; browser checks; status; hosted | Unknown | Combines availability, user-journey, and server checks. | D4 | active | 2026-11-04 |
| Checkly | https://www.checklyhq.com/ | Uptime; browser/API checks; hosted | Unknown | Developer-managed tests and checks for real production flows. | F1; V2 | active | 2026-11-04 |
| WebGazer | https://www.webgazer.io/ | Uptime; cron; status; hosted | Unknown | Website, API, port, and missed-job detection. | Lead | active | 2026-11-04 |
| Super Monitoring | https://www.supermonitoring.com/ | Uptime; browser/process checks; hosted | Unknown | Detects unavailable pages, missing content, slow loads, and broken processes. | Lead | active | 2026-11-04 |
| Monitive | https://monitive.com/ | Uptime; hosted | Unknown | Outage checks with escalating email, text, and phone alerts. | Lead | active | 2026-11-04 |
| Robotalp | https://robotalp.com/ | Uptime; status; hosted | UK company address; team cities include Turkey and Europe | Official page offers monitoring and status pages; details are thin in the retrieved page. | Lead | active | 2026-11-04 |
| WatchSumo | https://www.watchsumo.com/ | Uptime; hosted | Unknown | Website checks with downtime and certificate alerts. | Lead | active | 2026-11-04 |
| PingPing | https://pingping.io/ | Uptime; status; hosted | Unknown | Explicit solo-founder offer for uptime and certificate monitoring. | Lead | active | 2026-11-04 |
| Gatus | https://github.com/TwiN/gatus | Uptime; status; self-host, open source | Self-host; maintainer region unknown | Developer-oriented health dashboard with alerts; homepage had no readable text, official repository opened. | G1; C2 | active | 2026-11-04 |
| Upptime | https://upptime.js.org/ | Uptime; status; self-managed, open source | Runs through GitHub; maintainer region unknown | GitHub-powered availability checks and a static status site. GitHub usage rules still apply. | D4 | active | 2026-11-04 |
| OpenStatus | https://www.openstatus.dev/ | Uptime; status; open source, hosted + self-host | Unknown | Global monitoring and status pages with an open-source option. | D4 | active | 2026-11-04 |
| OneUptime | https://oneuptime.com/ | Uptime; logs; traces; status; hosted + self-host, open source | Unknown | Complete monitoring and incident platform with free-start and self-host paths. | G1 | active | 2026-11-04 |
| Statping-ng | https://github.com/statping-ng/statping-ng | Uptime; status; self-host, open source | Self-host; maintainer region unknown | Monitoring fork still has an official repository. Maintenance freshness was not established. | D4 | gray | 2026-11-04 |
| Checkmate | https://github.com/bluewave-labs/Checkmate | Uptime; server health; self-host, open source | Self-host; maintainer region unknown | Availability, hardware, and incident monitoring in a self-hosted app. | D4 | active | 2026-11-04 |
| Peekaping | https://peekaping.com/ | Uptime; status; self-host, open source | Self-host; maintainer region unknown | Monitors services and publishes status pages from your own server. | D4 | active | 2026-11-04 |
| Kuvasz Uptime | https://kuvasz-uptime.dev/ | Uptime; status; self-host, open source | Self-host; maintainer region unknown | Service checks, notifications, and status pages, with public deployment docs. | G1 | active | 2026-11-04 |
| CheckCle | https://docs.checkcle.io/ | Uptime; infrastructure; self-host, open source | Self-host; maintainer region unknown | Official docs describe distributed checks, incidents, and alerts; root domain returned 404. | G1 | active | 2026-11-04 |
| UptimeFlare | https://github.com/lyc8503/UptimeFlare | Uptime; status; self-managed, open source | Runs on Cloudflare; maintainer region unknown | Serverless checks and status page deployed in your Cloudflare account. Also: hosting and deploy. | D4 | active | 2026-11-04 |
| Mihari | https://mihari.io/ | Uptime; errors; telemetry; hosted | France-hosted; European probes advertised | Public beta combining uptime and debugging. Keep beta label until reviewed. | D2 | gray | 2026-11-04 |
| Assertible | https://assertible.com/ | API tests and monitoring; hosted | Unknown | Scheduled web-service checks detect broken API behavior. | F1 | active | 2026-11-04 |
| Phare | https://phare.io/ | Uptime; status; hosted | European service advertised; country unknown | Website checks, alerts, and incident communication. | F1 | active | 2026-11-04 |
| Pingmeter | https://pingmeter.com/ | Uptime; status; hosted | Unknown | Availability checks and confirmed-outage notifications. | F1 | active | 2026-11-04 |
| UptimeObserver | https://uptimeobserver.com/ | Uptime; status; hosted | Unknown | Website and API downtime, certificate, and DNS alerts. | F1 | active | 2026-11-04 |
| Downtime Monkey | https://downtimemonkey.com/ | Uptime; hosted | Country-selectable pages; home region unknown | Website downtime and response-time checks. Returned Italy copy; that does not prove it serves only Italy. | F1 | active | 2026-11-04 |
| FlareWarden | https://flarewarden.com/ | Uptime; cron; status; hosted | Unknown | Website checks plus suggested dependency monitoring. | F1 | active | 2026-11-04 |
| MonitorMonk | https://monitormonk.com/ | Uptime; status; hosted | Unknown | A focused website monitor with a public free-start offer. | F1 | active | 2026-11-04 |
| OpenUptime | https://openuptime.app/ | Uptime; status; hosted + self-host, open source | Unknown | Open-source checks, alerts, and status pages; hosted limits are public. | F1 | active | 2026-11-04 |
| Servervana | https://servervana.com/ | Uptime; browser checks; hosted | Unknown | Availability and performance diagnosis for live sites. | F1 | active | 2026-11-04 |
| Sitesure | https://sitesure.net/ | Uptime; cron; hosted | Unknown | Watches websites, API endpoints, and background jobs. | F1 | active | 2026-11-04 |
| Pingzo | https://www.pingzoapp.com/ | Uptime; hosted | Unknown | API outage monitoring with WhatsApp notifications and repeated-failure checks. | F1 | active | 2026-11-04 |
| WebChecky | https://webchecky.com/ | Uptime; website health; hosted | Unknown | Availability and website health checks with alerts; site returned product copy and signup links. | Search Q9 | active | 2026-11-04 |
| WhyDown | https://whydown.org/ | Uptime candidate; hosted | Unknown | Official-domain search result describes outage alerts; opening returned no readable content. | Search Q9 | check again | 2026-11-04 |
| UptimeToolbox | https://www.uptimetoolbox.com/ | Uptime; server health; status; hosted | Unknown | Website monitoring and status pages; www site opened after bare domain failed. | F1 | active | 2026-11-04 |
| NodePing | https://nodeping.com/ | Uptime; service health; hosted with private probes | Unknown | Outside checks for websites and services; public plans and alerting offer. | Lead | active | 2026-11-04 |
| Montastic | https://www.montastic.com/ | Uptime; hosted | Unknown | Website and service checks with automatic failure alerts; ongoing free start is advertised. | Lead | active | 2026-11-04 |
| SiteUptime | https://www.siteuptime.com/ | Uptime; hosted | Unknown | Availability checks with alternate-location confirmation and outage alerts. | Lead | active | 2026-11-04 |
| Uptime Doctor | https://www.uptimedoctor.com/en/ | Uptime; hosted | Multiple language pages; home region unknown | Website failure detection and email, SMS, or push notification. | Lead | active | 2026-11-04 |
| BinaryCanary | https://www.binarycanary.com/ | Uptime; service health; hosted | Unknown | Website and server checks with confirmation from another location. | Lead | active | 2026-11-04 |
| SweetUptime | https://dicloud.net/sweetuptime-server-uptime-monitoring/ | Uptime; server health; status; hosted | Unknown | DiCloud's website and server monitoring product with status pages. | F1 | active | 2026-11-04 |

## Logs and log-first debugging

| Name | Official URL | Type and delivery | Home region / markets | Why it belongs; current identity | Found through | Status | Site checked |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Axiom | https://axiom.co/ | Logs; traces; hosted | Unknown | Event search and monitoring for application logs and traces. | Brief; F1 | active | 2026-11-04 |
| Papertrail | https://www.papertrail.com/ | Logs; hosted | Unknown | Central log search and error alerts. SolarWinds branding and login are visible; verify new-account packaging later. | Brief; V3 | active | 2026-11-04 |
| Loggly | https://www.loggly.com/ | Logs; hosted | Unknown | Log analysis now promoted alongside SolarWinds Observability. Check which standalone plans remain available. | V3 | gray | 2026-11-04 |
| Logz.io | https://logz.io/ | Logs; metrics; traces; hosted | Unknown | Application log monitoring and alerting; confirm current solo-sized plan before recommendation. | Lead | gray | 2026-11-04 |
| Sematext | https://sematext.com/ | Logs; performance; uptime; hosted | Unknown | Log search, monitoring, and synthetic checks in one family. | V3 | active | 2026-11-04 |
| Graylog Open | https://graylog.org/ | Logs; self-host, source-available; paid editions separate | Self-host; vendor region unknown | Free self-managed log collection and search. Do not count paid Graylog Security as the same offer. | Lead | active | 2026-11-04 |
| OpenObserve | https://openobserve.ai/ | Logs; metrics; traces; hosted + self-host, open source | Unknown | Searchable application telemetry with an open-source deployment path. | F1 | active | 2026-11-04 |
| Parseable | https://www.parseable.com/ | Logs; traces; hosted + self-host, open core | Unknown | Log and telemetry search with alert and dashboard features; check edition limits. | Lead | active | 2026-11-04 |
| Logflare | https://logflare.app/ | Logs; hosted, self-host availability to check | Unknown | Application log pipelines and alerts; check standalone availability and current Supabase relationship. Also: databases and backend. | F1 | gray | 2026-11-04 |
| Seq | https://datalust.co/ | Logs; self-host, proprietary | Self-host; vendor region unknown | Structured log search on your own infrastructure; solo license eligibility needs later confirmation. | Lead | active | 2026-11-04 |
| VictoriaLogs | https://victoriametrics.com/products/victorialogs/ | Logs; self-host, open source | Self-host; vendor region unknown | A dedicated log storage and query option; full workflow may need collection and alert tools. | Lead | active | 2026-11-04 |
| Quickwit | https://quickwit.io/ | Logs/traces search; self-host, open source | Self-host; vendor region unknown | Official site says it joined Datadog. Retain self-host candidate; verify maintenance and complete alerting path. | Lead | gray | 2026-11-04 |
| Gigapipe, formerly qryn | https://gigapipe.com/ | Logs; metrics; traces; self-host, open source | Self-host; vendor region unknown | qryn's official repository redirects to Gigapipe; one choice, not two listings. | Lead | active | 2026-11-04 |
| Grafana Loki | https://grafana.com/oss/loki/ | Logs; self-host, open source | Self-host; vendor region unknown | Self-managed log aggregation. Separate choice from hosted Grafana Cloud; other components complete the interface. | G1; Lead | active | 2026-11-04 |
| OpenSearch | https://opensearch.org/ | Logs/search; self-host, open source | Self-host; foundation region not checked | Log search and dashboards as a self-managed stack. Also: databases and backend. | Lead | active | 2026-11-04 |
| Logit.io | https://logit.io/ | Logs; metrics; APM; hosted | Unknown | Managed OpenSearch and monitoring with a public small-plan entry point. | Lead | active | 2026-11-04 |
| Logdy | https://logdy.dev/ | Log viewer; self-host | Self-host; maintainer region unknown | Useful for investigating logs, but automatic failure detection is not established. Owner should decide whether viewers belong. | Lead | gray | 2026-11-04 |
| Dozzle | https://dozzle.dev/ | Container log viewer; self-host, open source | Self-host; maintainer region unknown | Live container log investigation; not a verified stand-alone alerting service. | Lead | gray | 2026-11-04 |
| LogDog | https://log.dog/ | Mobile remote logs; hosted | Unknown | Remote iOS and Android log and network diagnosis. Confirm unattended production alerts before recommendation. | F1 | gray | 2026-11-04 |
| Google Cloud Logging | https://cloud.google.com/logging | Logs; hosted | Cloud region rules need research | Managed log search and alerts; useful even when native to the hosting provider. Also: hosting and deploy. | V3; Lead | active | 2026-11-04 |
| Sumo Logic | https://www.sumologic.com/pricing | Logs; monitoring; hosted | Unknown | Pricing FAQ offers self-serve credit purchases, but minimum small-account bill is not public in the checked page. | V3 | gray | 2026-11-04 |

## Performance and combined monitoring

| Name | Official URL | Type and delivery | Home region / markets | Why it belongs; current identity | Found through | Status | Site checked |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AppSignal | https://www.appsignal.com/ | APM; errors; logs; uptime; hosted | Unknown | Application errors and slow-request diagnosis with language-specific integrations. | V1 | active | 2026-11-04 |
| Datadog | https://www.datadoghq.com/ | APM; logs; errors; uptime; hosted | Unknown | Explicit owner seed. Self-serve modules exist; exact small workload cost and commitments remain untested. | Brief; R1 | gray | 2026-11-04 |
| New Relic | https://newrelic.com/ | APM; logs; errors; hosted | Unknown | Full application monitoring with a developer entry path; full-access user costs need later research. | Brief; R1; F1 | active | 2026-11-04 |
| Grafana Cloud | https://grafana.com/products/cloud/ | APM; logs; metrics; uptime; hosted | Multiple stack regions; verify each service | Hosted monitoring with a personal-project free tier; prices differ by data type. | Brief; F1 | active | 2026-11-04 |
| SigNoz | https://signoz.io/ | APM; logs; metrics; hosted + self-host, open source | Unknown | Application traces and monitoring with both hosted and self-hosted paths. | Lead; D1 | active | 2026-11-04 |
| Uptrace | https://uptrace.dev/ | APM; logs; metrics; hosted + self-host, license review | Unknown | Request tracing, logs, and alerts; cloud and self-host pricing are separate. | Lead | active | 2026-11-04 |
| Honeycomb | https://www.honeycomb.io/ | APM; traces; logs; hosted | Unknown | Investigates slow and failing requests across services; verify small-plan allowances. | Lead | active | 2026-11-04 |
| Scout Monitoring | https://www.scoutapm.com/ | APM; errors; logs; hosted | Unknown | Formerly commonly called Scout APM; current site combines request, error, and log diagnosis. | Lead | active | 2026-11-04 |
| Blackfire | https://www.blackfire.io/ | APM; profiling; hosted | Unknown | Finds slow PHP and Python code; verify which features run continuously in production. | Lead | active | 2026-11-04 |
| Tideways | https://tideways.com/ | APM; errors; profiling; hosted | Unknown | PHP performance and exception monitoring with published docs and plans. | D2; Lead | active | 2026-11-04 |
| Skylight | https://www.skylight.io/ | APM; Ruby/Rails; hosted | Unknown | Request performance diagnosis for Rails builders. | F1 | active | 2026-11-04 |
| Atatus | https://www.atatus.com/ | APM; logs; errors; uptime; hosted + on-premises option | Unknown | App crash and performance monitoring; verify on-premises affordability separately. | Lead | active | 2026-11-04 |
| Dash0 | https://www.dash0.com/ | APM; logs; metrics; hosted | Unknown | OpenTelemetry-based application monitoring. Homepage announces Polar Signals acquisition; do not assume its old offer is separate. | Lead | gray | 2026-11-04 |
| ClickStack, using HyperDX | https://clickhouse.com/clickstack | APM; logs; errors; replay; hosted + self-host, open source | Unknown | ClickHouse's observability product; HyperDX site announces its acquisition. Confirm exact managed packaging later. Also: databases and backend. | F1; Lead | active | 2026-11-04 |
| Middleware | https://middleware.io/ | APM; logs; errors; uptime; hosted | Unknown | Combined monitoring and application debugging with a developer entry offer. | F1 | active | 2026-11-04 |
| Elastic Observability | https://www.elastic.co/observability | APM; logs; metrics; hosted + self-host, mixed licenses | Unknown | Full monitoring stack with a self-managed route; later research must separate free features from paid ones. Also: databases and backend. | Lead | active | 2026-11-04 |
| Amazon CloudWatch | https://aws.amazon.com/cloudwatch/ | APM; logs; metrics; uptime; hosted | AWS region rules need research | Native AWS monitoring can be practical for an app already hosted there. Also: hosting and deploy. | F1; Lead | active | 2026-11-04 |
| Google Cloud Monitoring | https://cloud.google.com/monitoring | Performance metrics; uptime; hosted | Cloud region rules need research | Application and infrastructure health with alerts. Cloud Logging and Error Reporting are separate product entries. Also: hosting and deploy. | Lead | active | 2026-11-04 |
| Azure Monitor / Application Insights | https://azure.microsoft.com/en-us/products/monitor/ | APM; logs; errors; hosted | Azure region rules need research | Microsoft's combined application and infrastructure monitoring family. Also: hosting and deploy. | Lead | active | 2026-11-04 |
| Inspector | https://inspector.dev/ | APM; errors; hosted | Unknown | Production request, job, and exception visibility for PHP frameworks. | F1 | active | 2026-11-04 |
| DeadBro | https://www.deadbro.com/ | APM; errors; Rails; hosted | Unknown | Rails request and query diagnosis with an advertised free entry tier. | F1 | active | 2026-11-04 |
| Superlog | https://superlog.sh/ | Combined monitoring candidate; hosted, self-host claim needs check | Unknown | Official site offers production issue investigation. Confirm public code and signal coverage before labelling open source. | F1 | gray | 2026-11-04 |
| LaunchDarkly Observability | https://launchdarkly.com/ | Error; logs; traces; replay; hosted | Unknown | Highlight's new product home. [Acquisition announcement](https://launchdarkly.com/blog/welcome-highlight-to-launchdarkly/) confirms identity; solo cost and current package need checking. | Brief; R1 | gray | 2026-11-04 |
| Baselime | https://baselime.io/ | Logs; traces; errors; hosted | Unknown | Official page announces Cloudflare acquisition but still advertises a standalone product. New-customer availability is unresolved; do not assume acquisition means shutdown. | G2 | check again | 2026-11-04 |
| Cloudflare Workers Observability | https://www.cloudflare.com/products/workers-observability/ | Logs; traces; platform performance; hosted | Workers platform; region rules need research | Native debugging for Workers projects. Also: hosting and deploy. Separate from unverified standalone Baselime availability. | Lead | active | 2026-11-04 |
| IBM Instana | https://www.ibm.com/products/instana | APM; logs; infrastructure; hosted + self-host edition | Unknown | Public PayPerUse offer has no time commitment; verify monitored-server unit, full-stack price, and smallest bill. Do not reject only because of enterprise branding. | Lead | gray | 2026-11-04 |
| Monoscope, formerly APIToolkit | https://monoscopehq.com/ | APM; logs; errors; replay; hosted | Unknown | APIToolkit redirects here; request-linked performance and error monitoring. Also: analytics for API usage features. | Lead | active | 2026-11-04 |
| Request Metrics | https://requestmetrics.com/ | Browser performance; real-user monitoring; hosted | Unknown | Diagnoses slow pages and resources from real-user data and automated performance tests. Also: analytics. Hosting its client script yourself is not self-hosting the service. | Lead | active | 2026-11-04 |

## Status pages

Status-only products communicate incidents. They need a monitor or a person to detect the incident first. Keep this distinction in future filters.

| Name | Official URL | Type and delivery | Home region / markets | Why it belongs; current identity | Found through | Status | Site checked |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Atlassian Statuspage | https://www.atlassian.com/software/statuspage | Status page; hosted | Unknown | Publishes incident updates and notifies subscribers. Also: customer support. statuspage.io redirects here. | V2; Lead | active | 2026-11-04 |
| Status.io | https://status.io/ | Status page; hosted | Unknown | Hosted incident and maintenance communication. Also: customer support. | Lead | active | 2026-11-04 |
| StatusPal | https://www.statuspal.io/ | Status; monitoring; hosted | Unknown | Current site has Next and Classic products. Research one family with edition-specific facts. | Lead | active | 2026-11-04 |
| StatusHub | https://statushub.com/ | Status page; hosted | Unknown | Customer-facing service updates and outage subscriptions; check minimum practical cost. Also: customer support. | Lead | gray | 2026-11-04 |
| Sorry | https://www.sorryapp.com/ | Status page; hosted | Unknown | Hosted outage, maintenance, and service communication. Also: customer support. | Lead | active | 2026-11-04 |
| Kener | https://kener.ing/ | Status; monitoring; self-host, open source | Self-host; maintainer region unknown | Official site is a working status-page example linking the project. | G1; D4 | active | 2026-11-04 |
| Cachet | https://cachethq.io/ | Status page; self-host, open source | Self-host; maintainer region unknown | Open-source incident communication with separate v2 and v3 demos. Verify supported release later. | Lead | active | 2026-11-04 |
| cState | https://github.com/cstate/cstate | Status page; self-host/static, open source | Self-host; maintainer region unknown | Static status pages from the official repository. Alternate web domains failed or had no readable text. | G1 | active | 2026-11-04 |
| PingPong | https://pingpong.one/ | Status; monitoring; hosted | Unknown | Status-page product with monitoring and incident features. Also: customer support. | F1 | active | 2026-11-04 |
| Statusfy | https://github.com/juliomrqz/statusfy | Status page; self-host/static, open source | Self-host; maintainer region unknown | Project exists under a redirected repository owner. Maintenance freshness and runtime support need checking. | Lead | gray | 2026-11-04 |
| Runframe | https://runframe.io/ | Status pages; incident response; hosted | Unknown | Status pages are part of the advertised core product; treat as communication, not independently verified outage detection. | F1 | active | 2026-11-04 |

## Scheduled jobs and heartbeat checks

A heartbeat is a short signal sent by your app or job. If it stops arriving, the monitor alerts you.

| Name | Official URL | Type and delivery | Home region / markets | Why it belongs; current identity | Found through | Status | Site checked |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Cronitor | https://cronitor.io/ | Cron; uptime; status; hosted | Unknown | Detects missed jobs, failing APIs, and unavailable sites. Also: analytics where its analytics product is considered. | F1 | active | 2026-11-04 |
| Healthchecks.io | https://healthchecks.io/ | Cron; heartbeat; hosted + self-host, open source | Unknown | Alerts when scheduled jobs do not check in. | G1; F1 | active | 2026-11-04 |
| Dead Man's Snitch | https://deadmanssnitch.com/ | Cron; heartbeat; hosted | Unknown | A focused missed-task alert service. | F1 | active | 2026-11-04 |
| CronAlive | https://cronalive.com/ | Cron; uptime; hosted | Unknown | Scheduled task failure signals and website checks. | F1 | active | 2026-11-04 |
| WatchCron | https://watchcron.com/ | Cron; uptime; status; hosted | Unknown | Detects failed jobs and missing heartbeats. Its scheduling features also overlap hosting and deploy. | F1; V4 | active | 2026-11-04 |
| Drumbeats | https://drumbeats.io/ | Cron; uptime; status; hosted | Unknown | Monitors silent background-task and website failures. | F1 | active | 2026-11-04 |
| LastPing | https://lastping.dev/ | Cron; uptime; agent-run monitoring; hosted | Unknown | Missed job, build pipeline, and agent-run alerts. Also: hosting and deploy. | F1 | active | 2026-11-04 |
| Watchgoose | https://watchgoose.com/ | Cron; heartbeat; hosted | Unknown | Alerts when configured jobs miss their expected completion signal. | F1 | active | 2026-11-04 |

## Server and self-managed monitoring

These can explain outages caused by the server, even if they do not capture code exceptions. They need a separate filter from APM.

| Name | Official URL | Type and delivery | Home region / markets | Why it belongs; current identity | Found through | Status | Site checked |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Prometheus | https://prometheus.io/ | Metrics; alerting; self-host, open source | Self-host; foundation region not checked | Application metrics and alert rules; needs setup and a notification path. | G1 | active | 2026-11-04 |
| Zabbix | https://www.zabbix.com/ | Server/service health; self-host, open source; hosted option | Unknown | Monitors services, servers, and failure conditions; solo setup effort needs assessment. | G1 | active | 2026-11-04 |
| Netdata | https://www.netdata.cloud/ | Server/app health; agent + cloud; license review | Unknown | Server metrics and anomaly alerts with local agents and a cloud interface. | G1; F1 | active | 2026-11-04 |
| Beszel | https://beszel.dev/ | Server health; self-host, open source | Self-host; maintainer region unknown | Lightweight server and container metrics with alerting. | G1; C2 | active | 2026-11-04 |
| Monit | https://mmonit.com/monit/ | Service/process health; self-host, open source | Self-host; maintainer region unknown | Detects failed processes and can restart them; separate from the paid M/Monit interface. | G1 | active | 2026-11-04 |
| Bleemeo | https://bleemeo.com/ | Server health; uptime; logs; hosted with agent | Unknown | Infrastructure and app service monitoring with notification features. | F1 | active | 2026-11-04 |
| Xitoring | https://xitoring.com/ | Server health; uptime; hosted with agent | Unknown | Server and service failure alerts with a public self-serve entry. | F1 | active | 2026-11-04 |
| Fivenines | https://fivenines.io/ | Server health; logs; uptime; cron; hosted | Unknown | Server and website monitoring with incident alerts. | F1 | active | 2026-11-04 |
| MarionetteOps | https://www.marionetteops.com/ | Server health; uptime; status; hosted | Unknown | Monitors client sites, servers, and jobs; limited free-slot offer needs later eligibility check. | F1 | active | 2026-11-04 |
| Monitorable | https://monitorable.io/ | Server health; hosted with open-source agent | Unknown | Server and container monitoring. An open-source agent does not establish a self-hostable service. | F1 | active | 2026-11-04 |
| Simple Observability | https://simpleobservability.com/ | Server health; logs; uptime; cron; hosted | Unknown | Server metrics, system logs, and website checks in a small monitoring service. | F1 | active | 2026-11-04 |
| Nagios Core | https://www.nagios.org/ | Server/service health; self-host, open source | Self-host; vendor region unknown | A self-managed service-check option; configuration work can outweigh savings for one app. | G1 | gray | 2026-11-04 |
| Icinga | https://icinga.com/ | Server/service health; self-host, open source | Self-host; vendor region unknown | Alerts on server and service failures; assess solo setup burden. | G1 | gray | 2026-11-04 |
| Checkmk Community | https://checkmk.com/ | Server/service health; self-host, open source edition | Self-host; vendor region unknown | Community route keeps an enterprise-oriented family in scope. Verify current edition limits and installation burden. | G1 | gray | 2026-11-04 |
| PHP Server Monitor | https://www.phpservermonitor.org/ | Uptime; self-host, open source | Self-host; maintainer region unknown | Small website/service checker; site is live but supported runtime and maintenance need checking. | G1 | gray | 2026-11-04 |
| SyAgent | https://syagent.com/ | Server health; uptime; hosted with agent | Unknown | Linux server and process health alerts plus uptime checks. Site labels the service beta; check commercial eligibility. | F1 | gray | 2026-11-04 |

## Outside-service outages

| Name | Official URL | Type and delivery | Home region / markets | Why it belongs; current identity | Found through | Status | Site checked |
| --- | --- | --- | --- | --- | --- | --- | --- |
| StatusGator | https://statusgator.com/ | Dependency outages; status aggregation; hosted | Unknown | Alerts when providers your app depends on report trouble. This does not prove your own app is working. | F1 | active | 2026-11-04 |
| IncidentHub | https://incidenthub.cloud/ | Dependency outages; status aggregation; hosted | Unknown | Combines vendor incident feeds and alerts for outside-service failures. | F1 | active | 2026-11-04 |
