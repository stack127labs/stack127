# Error monitoring discovery notes

Research date: 2026-11-04. Scope: step 1 only, for the error monitoring sub-directory of indie hacker apps. The product direction and stack127 writing guide were read. No other agent was started.

## What is ready

- `apps.md`: 173 candidate product identities. Of these, 141 appear active, 29 are gray, and 3 need another availability check.
- `excluded.md`: 60 considered names or products outside the main count. This includes aliases, scheduled retirements, unresolved leads, and scope exclusions. It is not a count of 60 dead apps.
- `fields.md`: 50 proposed fields, evidence rules, separate usage-cost examples, a three-app feasibility matrix, and a narrow self-host source check.
- No code, routes, page content, databases, migrations, branches, commits, pushes, signups, logins, or form submissions were changed or used. Work stayed in this folder.

The primary groups below assign each candidate once. Extra capability tags can overlap. These are inventory counts, not market share or adoption statistics.

| Primary group | Candidates |
| --- | ---: |
| Error and crash tracking | 33 |
| Uptime and service health | 54 |
| Logs and log-first debugging | 21 |
| Performance and combined monitoring | 28 |
| Status pages | 11 |
| Scheduled jobs and heartbeats | 8 |
| Server and self-managed monitoring | 16 |
| Outside-service outages | 2 |
| Total | 173 |

Google Cloud Error Reporting belongs to the first group. Cloud Monitoring, Cloud Logging, and Error Reporting are distinct products within the same vendor. Hosted Grafana Cloud and self-managed Loki are distinct deployment choices. By contrast, Logtail and Better Uptime are aliases under Better Stack. Product identity rules should be shared with the main agent before data gathering starts.

## Discovery sources

All sources below were searched or opened on 2026-11-04. They discover names and questions. Main-list fit and existence claims rely on the official URL in each row, or an explicit official fallback. No competitor claim, review rating, or vendor ranking was copied into a finished app record.

| ID | Kind | Source used | How it helped and its limits |
| --- | --- | --- | --- |
| Brief | Owner seeds | The task brief | Names the core error, uptime, log, and APM products. Seeded names still received official-site checks. |
| Lead | Researcher lead | Existing product knowledge, followed by the official URL in the row | Adds established or specialist candidates that were not in a retrieved list. This does not claim independent discovery or current knowledge without a check. |
| V1 | Vendor comparison | https://betterstack.com/community/comparisons/error-tracking-tools/ | Error-monitoring names. Commercial vendor with an interest in favoring itself; used only for discovery. |
| V2 | Vendor comparison | https://onlineornot.com/uptime-monitoring-tools ; https://uptimerobot.com/knowledge-hub/comparisons-and-alternatives/best-status-page-tools/ | Uptime and status-page names from search results. Not proof of competitors' prices, intervals, or features. |
| V3 | Vendor comparison | https://betterstack.com/community/comparisons/log-management-and-aggregation-tools/ | Log product names and metering questions. The list also includes components that are not complete apps. |
| V4 | Vendor comparison | https://watchcron.com/alternatives/cron-monitoring-tools | Missed-job monitoring candidates and schedule questions. Pricing claims were not reused. |
| G1 | Public curated list | https://github.com/awesome-foss/awesome-sysadmin#monitoring ; https://awesome-selfhosted.net/tags/monitoring--status-pages.html | Self-host monitoring, metrics, and status pages. The selfhosted category points to the sysadmin list. Most generic network/security tools were outside the app-focused scope. |
| G2 | Public curated list | https://github.com/thedaviddias/indie-dev-toolkit | An indie-focused monitoring lead, including Baselime. The list's live status and licensing descriptions need independent checks. |
| F1 | Public curated list | https://github.com/ripienaar/free-for-dev ; https://raw.githubusercontent.com/ripienaar/free-for-dev/master/README.md | Monitoring, crash handling, and log sections added many smaller products. Free-tier amounts and product status can be stale; none was accepted without official evidence. |
| R1 | Review site | https://www.g2.com/products/sentry/competitors/alternatives | Broad competing-product names, including Luciq and enterprise cases. No scores or AI-generated answers were treated as facts. |
| C1 | Community | https://www.reddit.com/r/microsaas/comments/1omvseh/observability_tools/ | A direct affordability question from a builder; Sentry/PostHog mentions. Not pricing evidence. |
| C2 | Community | https://www.reddit.com/r/selfhosted/comments/1e7q4ua/fullstack_error_monitoring_tools/ ; https://www.reddit.com/r/selfhosted/comments/1qvq7l0/how_do_you_guys_monitor_your_services/ | Self-host error and service-monitoring leads. Commenters can be product owners. |
| C3 | Community | https://www.reddit.com/r/webhosting/comments/1vx79zc/your_favorite_free_uptime_monitoring/ ; https://www.reddit.com/r/Monitoring/comments/1p2sa1g/anyone_here_using_a_website_uptime_monitoring/ | Outage alerts, low-cost services, and notification concerns. No reliability claims were accepted. |
| D1 | Republished comparison | https://securityboulevard.com/2026/04/best-sentry-alternatives-for-error-tracking-and-monitoring-2026/ | Additional error/APM names. Potential syndicated vendor interests; discovery only. |
| D2 | Public software directory | https://www.itechguides.com/best/error-monitoring-software/ ; https://www.itechfaqs.com/tools/logister/alternatives/ ; https://www.itechfaqs.com/tools/honeybadger/alternatives/ | Specialist and smaller error tools. Some official domains could not be established. Paid placements/ratings are not evidence of quality. |
| D3 | Public alternatives list | https://www.whatismyalternative.com/software/bug-recorder | Led to Bug Recorder, then its official site. No competitor claims accepted. |
| D4 | Public comparison lists | https://uptimecompare.com/ ; https://grasppy.com/stack/infrastructure/uptime-monitoring/ | Hosted and self-host uptime names. Tables changed counts between retrievals; no prices or totals were reused. |

The attempted Better Stack uptime comparison URL, `https://betterstack.com/community/comparisons/uptime-monitoring-tools/`, was inaccessible. It was not treated as a read source. Other public lists found through search were used only as leads, not additional sources for the same copied fact.

## Search log

All queries below ran on 2026-11-04. Searches were batched when independent. Some broad searches returned irrelevant papers or mostly results for another query in the batch; those results were not counted as coverage of the intended topic.

| Query ID | Query text | Purpose / result |
| --- | --- | --- |
| Q1 | `error monitoring tools indie hackers Sentry alternatives affordable` | Error-monitoring starting list and affordability language. |
| Q2 | `website down alerts uptime monitoring status page alternatives solo developers` | Uptime, status pages, and reader problem language. |
| Q3 | `log management tools small startups affordable alternatives Papertrail` | Log-focused discovery; required follow-up through V3 and F1. |
| Q4 | `awesome self hosted monitoring error tracking uptime github` | Public self-host lists and project leads. |
| Q5 | `site.github.com awesome-selfhosted monitoring status pages error tracking` | Self-host source discovery. |
| Q6 | `site.g2.com error monitoring software alternatives Sentry` | Review-site discovery, including enterprise and mobile names. |
| Q7 | `site.reddit.com/r/selfhosted error tracking uptime monitoring alternatives` | Community discovery rather than vendor-only coverage. |
| Q8 | `site.betterstack.com community comparisons error tracking log management uptime monitoring tools` | Vendor comparison names. |
| Q9 | `"get alerted when my website goes down" monitoring` | Exact reader problem; new uptime services in official-domain results. |
| Q10 | `"why is my app slow" "monitoring" tools` | Performance problem phrasing; low-quality/noisy results, so supplemented with official APM leads. |
| Q11 | `"search my application logs" tools` | Log problem phrasing; few useful candidates, so supplemented with log lists. |
| Q12 | `"error tracking" "indie hackers" alternatives` | Indie-specific sources and public toolkit lists. |
| Q13 | `uptime monitoring tools alternatives updown Pulsetic Hyperping Oh Dear` | Long-tail uptime competitors and self-host options. |
| Q14 | `affordable application performance monitoring tools AppSignal ScoutAPM Blackfire Tideways` | Specialized APM leads; official sites checked separately. |
| Q15 | `"error tracking" "alternatives" "Bugsink" "Hawk" "Errbit"` | Smaller error trackers and alias discovery. |
| Q16 | `"log management" "Logit.io" "Logdy" "Log360" tools` | Smaller log tools; no finished facts taken from returned comparisons. |
| Q17 | `Highlight shutdown LaunchDarkly acquisition 2026` | Initial lifecycle check; resolved redirect and acquisition, not an exact standalone shutdown date. |
| Q18 | `Airbrake shutdown acquisition Bugsnag Instabug Luciq rebrand 2026` | Ownership/rebrand leads; official sites used to resolve current identities. |
| Q19 | `site:highlight.io LaunchDarkly shutdown migration` | Highlight migration check; main domain now redirects. |
| Q20 | `site:launchdarkly.com Highlight acquisition observability 2025` | Primary acquisition evidence. |
| Q21 | `site:freshworks.com Freshping sunset March 2026` | Retirement lead; later checked the Freshping support FAQ directly. |
| Q22 | `site:luciq.ai Instabug rebrand` | Current official name. Old blog content can be rewritten under the new brand, so no historical rebrand date was inferred. |
| Q23 | `"Freshping" "deprecation" site:support.freshping.io` | Found the current official retirement FAQ. |
| Q24 | `"Highlight" "sunset" site:launchdarkly.com` | No definitive current primary-source shutdown date established. |
| Q25 | `site:launchdarkly.com "Highlight" "February" "2026"` | Tested a secondary-source closure-date claim. It remained unconfirmed. |
| Q26 | `site:baselime.io "sunset"` | Tested acquisition-versus-shutdown ambiguity. |
| Q27 | `site:blog.cloudflare.com "Baselime" "2025" shutdown` | Cloudflare primary-source lifecycle search. |
| Q28 | `site:learn.microsoft.com "App Center" "June 30, 2026"` | Found many stale June 2026 notices; the current retirement page later showed an extension. |
| Q29 | `site:launchdarkly.com "Highlight" acquisition` | Standalone follow-up found the acquisition announcement. |
| Q30 | `site:baselime.io sunset shutdown 2025` | Standalone follow-up; no confirmed new-customer availability answer. |
| Q31 | `site:blog.cloudflare.com baselime sunset 2025` | Found acquisition and older architecture posts; neither proves a current standalone signup. |
| Q32 | `site:freshstatus.io deprecated Freshstatus` | Support docs and live customer pages exist; no clear new standalone offer confirmed. |

Official homepage checks were done for every main-list candidate, with docs or project repositories as fallbacks where necessary. Smaller services found in F1 were opened individually. The list does not promote a discovery result to active status merely because it appears in a public list.

## Lifecycle findings and unresolved access

| Product or issue | What the official evidence supports | What remains unresolved |
| --- | --- | --- |
| Highlight | https://www.highlight.io/ redirects to LaunchDarkly. https://launchdarkly.com/blog/welcome-highlight-to-launchdarkly/ confirms acquisition. The source repository remains visible. | Exact hosted shutdown date and current self-host support. Secondary claims of February 2026 were not adopted. |
| Freshping | https://support.freshping.io/support/solutions/articles/50000011808-freshping-deprecation-frequently-asked-questions confirms discontinuation and renewal cutoff. | Existing subscriptions can end on different dates. Do not say all accounts shut on one date. |
| App Center | https://learn.microsoft.com/en-us/appcenter/retirement has an April 15, 2026 update extending Analytics & Diagnostics through the end of March 2027. | Other official pages still show June 2026. The current retirement notice governs the timeline. |
| Retrace | https://stackify.com/retrace/ announces end of life on March 31, 2027. | It still advertises a trial; no claim that it is already dead. |
| Embrace | https://embrace.io/ says it is now Cortex XCOR by Palo Alto Networks. | A new solo-builder entry offer for the successor. |
| APIToolkit | https://apitoolkit.io/ redirects to https://monoscopehq.com/. | Current plan details, deferred to per-app work. |
| qryn | https://github.com/metrico/qryn redirects to metrico/gigapipe. | Exact release/license details deferred. |
| Quickwit | https://quickwit.io/ announces joining Datadog and still offers the software. | Maintenance and support of its standalone open-source path. |
| HyperDX | https://www.hyperdx.io/ announces ClickHouse acquisition; https://clickhouse.com/clickstack is the current monitoring product. | Exact managed-versus-OSS plan boundaries. |
| Polar Signals | https://www.dash0.com/ announces acquisition. | No separate old offer was added; current availability was not researched. |
| Sentry | The official site/docs/pricing returned `Unsupported content-type: text/markdown`. https://github.com/getsentry/sentry opened. | Current hosted page and pricing content must be checked again. A shell fetch produced no usable content; it was not accepted as evidence. |
| WhyDown | Official-domain search result described an uptime product. Opening the site returned no readable body. | Active availability not confirmed. |
| Baselime | Public site still describes a product and acknowledges acquisition. Older Cloudflare posts describe a standalone offer. | Whether a new customer can use it today. Acquisition alone is not enough to remove it as dead. |
| Freshstatus | Old marketing route redirects to Freshservice; support docs and customer pages exist. | New standalone signup and exact product policy. |
| Logflare | Official page describes log pipelines and alerts. | Current standalone offer, source license, and Supabase ownership/packaging need a direct official source. |

Failed official requests are in `excluded.md`, including NixStats' login redirect, Pingbreak's 503, and unresolved small-service domains. No service was logged into. Domain variants were tried where useful; bare and www domains did not always behave the same way.

## What the feasibility test showed

The three main probes were Honeybadger, UptimeRobot, and Grafana Cloud. A field-by-field matrix and every sampled URL are in `fields.md`. It records findability, not complete facts about those apps.

- Core product identity and the broad free/paid offer are usually easy to locate.
- Full workload cost, overage behavior, alert costs, detailed plan gates, and export/deletion need documentation beyond a pricing headline.
- Errors, log events, retained traces, uptime checks, and seats use different meters. Keep their quotas and retention separate.
- UptimeRobot's current pricing copy contains conflicting free-plan feature claims. Do not resolve those by relying on an older comparison article.
- A bill alert is not evidence of a hard spending cap.
- Exact home country, market restrictions, universal support response times, and realistic self-host running costs were not consistently available in the sampled sources.
- Uptime Kuma provided a narrow self-host check: install instructions and license were accessible, while comparable sizing/cost and upkeep assessment need further work.

## Coverage limits and possible missing areas

This is broad discovery, not a provably complete global census. The market has no authoritative master list, and small services keep appearing or changing names.

1. English-language hosted services and common open-source projects received the most coverage. Regional-only vendors, especially services documented mainly outside English, need another pass.
2. The owner should decide how far server monitoring extends. The list includes practical app-server monitors, but most network-device dashboards and security products are held out.
3. Plugin-only WordPress, shop-platform, and language-package monitors received less coverage. Packages that merely send data should remain integrations, not extra apps.
4. Mobile analytics products with crash modules need closer checking. Countly and AppMetrica remain gray; UXCam is held out until automatic failure-alert fit is verified.
5. Smaller products from public free-tier lists may have live marketing pages without a maintained service. No account or delivery test was performed. Latest release dates were not audited for every project.
6. Browser-only speed monitoring, database-only performance products, and AI-agent tracing can expand the directory substantially. Request Metrics is included, while broad load testing and chaos experiments are excluded.
7. Acquisitions were checked through redirects, banners, official announcements, and targeted follow-up searches when a change appeared. A complete corporate ownership history for every vendor was not researched. Unknown ownership is not "independent."
8. The 17 unverified excluded leads and three main-list recheck cases should remain out of a verified public app count until resolved. Some may be temporarily unreachable rather than closed.
9. Product-family granularity needs consistency across all sub-directories. A monitoring family can contain several billable products; do not silently count both the family and each module.

## Owner decisions for the next step

These are open decisions, not blockers to this discovery handoff.

- Approve the 50-field proposal, or cut optional fields before per-app work starts.
- Choose the working solo-builder affordability rule. Suggested filter: ongoing free, practical self-hosting, or a public self-serve plan. Keep price ceilings as user filters rather than declaring a universal budget. The task supplied no dollar limit.
- Confirm whether status-only pages, provider-outage aggregators, and log viewers stay in this directory. They are clearly labelled so they can be filtered or moved later.
- Confirm whether response-only platforms should join status-page products. PagerDuty/FireHydrant are held out; Runframe is included specifically for its public status-page offer.
- Confirm whether browser performance and AI-agent/job tracing should be full types here or cross-links to analytics/hosting.
- Approve or change the separate usage scenarios. Three apps and one builder are deliberate proposed assumptions, not a measured audience average.

Per-app research should start only after those field decisions. Page design, publication, and data storage are later work.
