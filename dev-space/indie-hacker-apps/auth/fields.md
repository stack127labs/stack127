# Proposed auth facts

This is a field proposal for owner approval. It is not finished research on any app. Feasibility checked on 2026-11-04.

## How to record answers

- Every factual value needs its own official source URL and `checked_date` in `YYYY-MM-DD` format. Cite the exact page or section, not just a homepage. Repeat this for individual login methods, plans, limits, and countries inside a list.
- Keep `value`, `unit`, `plan`, `deployment`, `version_if_relevant`, `source_url`, `checked_date`, and a short `source_note` together. Keep a page's published or updated date separately from the date we read it.
- Use `yes`, `no`, `unknown`, `not_published`, and `not_applicable`. A missing mention is not proof of `no`. `not_published` means we checked the named pricing, documentation, and relevant policy pages and did not find an answer. Save those URLs and the search date. It is a bounded finding, not proof that no answer exists anywhere.
- Required means the researcher must attempt the field and record an answer or an honest unknown. Conditional means required only for the relevant product or deployment. Optional means useful when public evidence exists; do not delay a listing for it.
- Split hosted and self-hosted editions. Split free core features from paid plugins and enterprise licenses. “Source available” means code can be read; it does not establish an open-source license or free commercial use.
- For a library, a feature supplied by another plugin is `plugin`, not `built_in`. Also allow `external_service`, `custom_code`, `preview`, and `unavailable`. Record the plugin, fee, dependency, and supported version.
- Keep app users separate from the developer's dashboard seats. Keep a customer's organizations separate from the developer's own team. Keep social login separate from business SSO.
- Search results, vendor comparison articles, reviews, and community comments can discover names and questions. They cannot establish a competitor's features, price, security, or operating status.
- A vendor's security or legal claim stays a vendor claim. Link its evidence and scope. Do not turn a badge into our own security guarantee or legal conclusion.

## Field list

An API is a way for code to talk to a service. An SDK is a library supplied to make that easier. MFA means asking for a second login check. A session keeps someone signed in. SAML and OpenID Connect (OIDC) are standard ways apps share a login. SCIM is a standard way businesses add and remove employee accounts in their software.

| Field | Plain meaning | Why readers need it | Value format | Usual source | Needed? |
| --- | --- | --- | --- | --- | --- |
| F01 Name, aliases, owner, URLs | Current product name, old names, parent company, official site and docs. | Avoid dead names and duplicate products. | Text; alias list; URL list; acquisition/rebrand date if published. | Official home, company news, project repository. | Required |
| F02 Product type and scope | Hosted service, server, library, backend, membership tool, wallet tool, or verification add-on; what it actually supplies. | An email-code checker is not a whole account system. | Primary type; deployment list; `accounts / login / sessions / verification / SSO_bridge` coverage. | Product overview and architecture docs. | Required |
| F03 Availability and lifecycle | Whether people can start now; beta, maintained, maintenance-only, deprecated, or retired. | Avoid choosing a product that is ending. | State; notice URL/date; successor if named; signup not tested flag. | Official notices, repository notice, release pages. | Required |
| F04 License and commercial-use rules | What code can be used, changed, and sold, and which editions require a license. | “Free” and “open source” have different limits. | License identifier and URL per component; paid-production conditions; unknown allowed. | LICENSE file and vendor license terms. | Required |
| F05 Who operates it | Whether vendor or developer runs servers, stores accounts, patches, and restores backups. | Shows the work a solo builder takes on. | Hosted / self-hosted / embedded / both; responsibility list. | Deployment and architecture docs. | Required |
| F06 Market and account eligibility | Relevant home market, seller-country restrictions, and whether one person can open a production account. | An available website may not serve the builder's country. | Market notes; allowed/restricted countries; individual/business eligibility; headquarters only if relevant and sourced. | Official signup requirements, terms, billing docs. | Optional |
| F07 Self-service and trial rules | Whether production can start without sales, and whether a card or company domain is needed. | Helps readers judge the real entry path. | Self-service yes/no/unknown; trial days; card requirement; production allowed. | Pricing and getting-started docs. | Required for hosted |
| F08 Billing unit and definition | Exactly what gets counted on the bill. | Active users, returning users, stored users, logins, and messages cannot be swapped. | Unit; counting window; user definition; exclusions; per-app or shared allowance. | Pricing definitions and billing docs. | Required for paid/hosted |
| F09 Free production allowance | How much ongoing real use is free. | A trial or development sandbox is not a free production plan. | Quantity + unit + reset window; hard/soft cap; production/trial distinction. | Pricing and free-plan terms. | Required where offered |
| F10 Minimum paid commitment | Lowest paid production cost and any contract or annual requirement. | A low usage rate can hide a large minimum bill. | Currency; monthly/annual billing; minimum fee; commitment; tax excluded/included. | Pricing and billing terms. | Required for paid/hosted |
| F11 Usage price rules | Tiers, included usage, extra units, volume brackets, and price rounding. | Needed to calculate a bill rather than repeat a headline. | Structured tiers, formula, unit, plan, currency, effective date; quote-only if so. | Official rate card and billing examples. | Required for paid/hosted |
| F12 Consumer cost scenarios | Auth charges at 1k, 10k, 50k, and 100k monthly app users. | Shows the bill as a small app grows. | Four scenario records with assumptions, chosen plan, formula, source inputs, result or unknown. | Derived from F08–F11, F17–F19. | Conditional: comparable public rate card |
| F13 Business cost scenarios | Cost with customer organizations and business SSO connections. | Business features can cost more than basic login. | Two fixed scenarios; plan and add-ons; fee breakdown or unknown. | Derived from F11 and F14–F19. | Conditional: business features offered |
| F14 Organization limits and fees | Included customer teams, members per team, invitations, and paid team features. | Common surprise when adding business accounts. | Limits and prices per plan; organization billing definition; restrictions. | Organization docs and pricing. | Required if organizations supported |
| F15 SSO and account-sync fees | Cost of connecting business login and SCIM directories. | “Supports SSO” may hide per-customer fees. | SAML/OIDC/SCIM fees; included connections; minimums; setup fees; add-on plan. | Enterprise connection pricing and docs. | Required if supported |
| F16 Developer team and project caps | Developer dashboard seats, apps, projects, environments, and domains. | A plan may fit users but not a second app or teammate. | Named caps and overage fee per plan; user vs builder seat distinction. | Pricing and project-limit docs. | Required for hosted |
| F17 Email, SMS, and other extra costs | Who sends login messages and who pays for them. | User allowances do not necessarily include message delivery. | Included sends; sender setup; own provider allowed; destination/channel rates; third-party exclusions. | Messaging docs, pricing, provider rate cards. | Required if methods need delivery |
| F18 What happens at the limit | Whether requests stop, billing starts, or upgrades are forced. | Protects login availability and budget. | Behavior; grace period; spending caps; alerts; automatic upgrade rules. | Billing, quotas, and free-plan docs. | Required for hosted |
| F19 Other billable limits | Requests, tokens, security add-ons, audit logs, or membership transaction fees. | Captures costs the user count misses. | Named unit, allowance, price, plan; separate payment fee. | Full pricing footnotes and limits docs. | Required for paid/hosted |
| F20 Basic login methods | Password, email link, email code, phone code, anonymous login, and wallet login. | Helps readers filter by the login they want. | Per-method support state, minimum plan, plugin or external dependency. | Login-method docs. | Required |
| F21 Social login providers | Google, Apple, GitHub, Microsoft, and other supported login providers. | A long provider count may miss the one readers need. | Named provider list; built-in/generic/custom; platform limits; setup requirements. | Official integration list and docs. | Required |
| F22 Passkey support | Sign-in using a device or security key, including first-factor and recovery behavior. | A passkey demo is not enough to establish app support. | State; web/mobile support; conditional autofill if documented; fallback; domain restrictions; price gate. | Passkey docs and supported-platform guide. | Required |
| F23 MFA and recovery | Second login checks and recovery if the device is lost. | Users can become locked out without recovery options. | Per-factor state: authenticator code, SMS, email, passkey/security key; recovery codes; enforcement and plan. | MFA and account recovery docs. | Required |
| F24 Account verification and reset | Email/phone confirmation, password reset, address changes, and account deletion by users. | These are routine account tasks after login works. | Per-flow state; delivery dependency; restrictions. | Account lifecycle docs. | Required |
| F25 Sessions and revocation | How long login lasts and how to sign out lost devices. | Login includes keeping and ending access. | Expiry; refresh; revocation; multi-device controls; cookie/token model; plan limits. | Session docs. | Required |
| F26 Business login standards | Which SAML and OIDC login roles are supported. | Connecting an existing business login is different from issuing one. | Protocol; identity-provider/client/broker role; plan; plugin. | SSO and protocol docs. | Required if business SSO offered |
| F27 Customer organizations and roles | Separate business workspaces, invitations, member roles, and customer administration. | Needed for apps selling to businesses. | Feature states; isolation model; membership model; role and invite limits. | Organization and permissions docs. | Required if offered |
| F28 SCIM account sync | Whether businesses can automatically create, update, and remove accounts. | Some customers require automatic offboarding. | State; version; user/group support; deactivation behavior; plan/add-on. | SCIM docs. | Conditional: business auth |
| F29 Ready-made login and account screens | Hosted pages, embedded components, and user profile screens. | Determines how much UI readers must build. | Per-screen support; hosted/components/headless; framework limitations. | UI docs and starter guides. | Required |
| F30 Branding and custom domains | Removing vendor branding and using your domain for login. | Important for trust and passkey setup. | Theme depth; domain count; plan and fee; domain migration caveats. | Branding, domains, and pricing docs. | Required |
| F31 Languages and accessibility evidence | Documented translated UI and evidence that disabled users can use it. | Needed for the audience the app serves. | Language list; customization; public accessibility statement/report or unknown. | UI localization docs; accessibility report. | Optional; no inferred score |
| F32 Web frameworks and runtimes | Official integrations and where backend code can run. | A JavaScript package may fail on the reader's server platform. | Named framework/runtime; official/community; supported version; server/edge/browser role. | SDK index, compatibility and installation docs. | Required |
| F33 Mobile and other clients | Native iOS, Android, React Native, Flutter, and desktop integration. | Web login support does not prove native mobile support. | Client list; official/community; redirect/session/passkey limitations. | Official client docs. | Required if relevant |
| F34 Database and service prerequisites | Database, email sender, cache, and other services the developer supplies. | Shows the full setup and running bill. | Dependency; required/optional; supported versions; who pays and operates it. | Installation and architecture docs. | Required |
| F35 Self-host operation requirements | Documented deployment, backups, upgrades, and capacity guidance. | Free software still takes time and servers. | Deployment list; database; backup/restore/upgrade links; published sizing only. | Self-host and operations docs. | Conditional: self-hosted/library |
| F36 Custom logic and events | Hooks, webhooks, extra user fields, and custom login flows. | Shows whether unusual account needs are possible. | Feature state; plan; execution/runtime limits; event delivery rules if published. | Extension and event docs. | Required |
| F37 User administration and API | Creating, searching, banning, and supporting users from code or a dashboard. | Owners need to manage accounts after launch. | Per-action state; dashboard/API availability; impersonation controls and plan. | Management API and admin docs. | Required |
| F38 Linking and upgrading accounts | Linking multiple sign-in methods and turning guest accounts into registered accounts. | Avoids duplicate accounts and lost data. | Linking/unlinking and guest-upgrade states; safety restrictions. | Account-linking and anonymous-user docs. | Required |
| F39 Export and ability to leave | Exporting user profiles, identifiers, password hashes, and relevant account links. | A CSV of emails alone may still force every user to reset a password. | Per-data-type export state; format; self-service/support; fee; migration limits; passkey domain caveats. | Export docs, APIs, schema, migration guides. | Required |
| F40 Import and migration in | Importing current users without forcing new signup. | Switching providers may be the reader's main task. | Supported hashes/providers; bulk/lazy migration; custom IDs; limits. | Import and migration docs. | Required |
| F41 Deletion and retention | How to remove user data, how long logs/backups remain, and how to close the vendor account. | Export and deletion are different tasks. | User deletion steps; retention periods; backup exceptions; project closure path. | API docs, privacy and retention policies. | Required attempt; unknown allowed |
| F42 Data location and residency | Where hosted user data lives and whether a region can be chosen. | Market served and data stored are different. | Named regions; data types; backup/log locations if known; plan/fee; self-chosen for local use. | Region docs, subprocessor and hosting pages. | Required for hosted |
| F43 Privacy and assurance evidence | Public processing agreement, subprocessors, and independently assessed controls. | Helps readers investigate customer requirements. | Evidence URLs; claimed framework; scope/date; public or gated report; minimum plan. | Legal pages and trust center. | Optional; report scope matters |
| F44 Abuse protection | Login throttling, bot checks, stolen-password checks, and SMS abuse controls. | Fake signups and automated attacks can raise bills or block users. | Per-control state; default/configurable; external service; plan/fee. | Security and configuration docs. | Required |
| F45 API and login rate limits | How many login and management requests are allowed at once. | User allowance does not establish burst capacity. | Endpoint; requests/window; shared/per-user/project; response and recovery; plan. | Rate-limit and quota docs. | Required attempt; unknown allowed |
| F46 Audit events and retention | Login/security events the owner can view or export. | Needed for support and account incident investigation. | Event types; retention days; export/streaming; fee/plan. | Logging and audit docs. | Required attempt; unknown allowed |
| F47 Service status and availability promise | Public status page and any paid uptime promise. | Distinguishes a contract promise from measured reliability. | Status URL; SLA percentage/period/plan/exclusions; no inferred uptime. | Vendor status page and SLA terms. | Conditional: hosted |
| F48 Release and maintenance evidence | Current supported version and dated maintenance or security policy. | Helps avoid abandoned libraries and unpatched servers. | Release URL/date/version; support policy; end-of-support notice; archive flag. | Official releases, security policy, lifecycle notices. | Required for code you run |
| F49 Support route | How to get help, what it costs, and promised response time if any. | A community forum and paid emergency support solve different needs. | Channels; free/paid; response promise; hours; source. | Support/pricing docs and project contribution guide. | Required attempt; unknown allowed |
| F50 Evidence and freshness | The source, checked date, edition, and evidence status for every answer. | Makes each fact inspectable and refreshable. | Per-value evidence record; conflict note; `published / derived / unknown / not_applicable`. | The exact primary pages read for that answer. | Required for every value |

## Price scenario rules

These are proposed comparison inputs, not current prices.

1. Consumer baseline: one production app, one developer dashboard seat, 1,000 / 10,000 / 50,000 / 100,000 distinct users who log in during the month. Every user registered before the month and returns on at least two days. No customer organizations, business SSO, SMS, or paid extra security. Use email/password or social login. Record any unavoidable email fee separately.
2. Business baseline A: 1,000 of those users in 10 active customer organizations, 100 members each, one active SAML connection, no SCIM. Baseline B: 10,000 users in 100 organizations, 100 members each, 10 active SAML connections, no SCIM. Require organization membership, invitations, and roles. If the product cannot support a baseline, say `unsupported`; do not price an unusable plan.
3. This return pattern is deliberate: a provider that bills for returning users cannot be compared with all new one-time visitors. Keep each vendor's definition. If billing depends on requests, stored users, token volume, geography, or a detail these baselines do not settle, add a clearly stated sub-scenario or leave the result unknown.
4. Select the cheapest publicly available plan that actually supports all baseline features and limits. Show monthly billing and currency. Keep annual-only prices and commitments separate. Do not silently apply startup grants, negotiated discounts, or taxes.
5. Add base fee, user usage, organizations, SSO, and compulsory add-ons. Store input sources and the formula. Show excluded email/SMS, hosting, database, and staff time beside the figure.
6. For libraries and self-hosted servers, show software license cost separately. Do not present $0 software as $0 total running cost. Do not estimate hosting or developer hours in step 1.
7. For verification add-ons, user-count scenarios are not enough. Later research needs checks per user, destination, channel, successful versus attempted checks, and message rates. Keep these products out of whole-account cost rankings.

## What the fields would let us publish

Only after app research and field approval:

- Cost curves at the fixed user counts, split by comparable billing model and deployment. Mark quote-only and missing prices.
- Free-production allowance comparisons, grouped by the actual counted unit. Include the first feature or usage gate.
- The price of adding business teams, one business SSO connection, and ten SSO connections. Separate account-sync fees.
- Passkey, MFA, passwordless, social-provider, and framework support tables, with free, paid, plugin, and beta labels.
- Filters for self-hosted, hosted, open-source license, native mobile support, and published EU data-location options.
- Exit comparisons: user export, password-hash export, import, account deletion, and domain constraints.
- Setup checklists: which products need a database, email sender, separate UI, or another account service.
- Counts of products with documented controls and counts whose answers remain unknown. State the researched denominator and checked date.
- Maintenance notices and rebrand mapping so people can recognize old names without counting them twice.

Do not publish a single “best” score from feature counts. Do not treat GitHub stars, vendor customer counts, or review ratings as comparable adoption or security statistics.

## Feasibility test

I tried the fields against Clerk (hosted), Keycloak (self-hosted server), and Better Auth (embedded library). I opened the official sources below and checked their relevant sections and navigation. I did not install anything, sign in, request a quote, measure performance, or finish an app record.

**Easy (E):** a direct public answer or clear inapplicability was easy to locate. **Hard (H):** related public material exists, but a complete answer needs several pages, plan details, or follow-up. **Not published in this test (NP):** no adequate public answer found in this bounded check. **E–N/A:** the selected edition does not have that vendor-operated service or billing field; it is not a negative feature verdict. Every source below was checked on 2026-11-04.

### Sources used in the test

| Code | Official source | Used to test |
| --- | --- | --- |
| C0 | [Clerk homepage](https://clerk.com/) | Identity, offer, public entry path. |
| C1 | [Clerk pricing](https://clerk.com/pricing) | Billing definitions, allowances, plans, add-ons, limits. |
| C2 | [Clerk docs](https://clerk.com/docs) | Login, UI, frameworks, mobile, and account-management section discovery. |
| C3 | [Clerk migration guide](https://clerk.com/docs/guides/development/migrating/overview) | Import, user export, password-hash export. |
| C4 | [How Clerk works](https://clerk.com/docs/guides/how-clerk-works/overview) | Architecture, sessions, quotas, data ownership questions. |
| C5 | [Clerk security](https://clerk.com/security) and [processing agreement](https://clerk.com/legal/dpa) | Public security claims and legal evidence; not an audit by us. |
| K0 | [Keycloak homepage](https://www.keycloak.org/) and [license](https://github.com/keycloak/keycloak/blob/main/LICENSE.txt) | Identity, releases, open-source rights. |
| K1 | [Keycloak server administration](https://www.keycloak.org/docs/latest/server_admin/index.html) | Login, passkeys, sessions, organizations, UI, mail, roles, logging. |
| K2 | [Containers](https://www.keycloak.org/server/containers) and [database setup](https://www.keycloak.org/server/db) | Operating requirements and dependencies. |
| K3 | [Application integration](https://www.keycloak.org/securing-apps/overview) | Standards and framework integration. |
| K4 | [Import and export](https://www.keycloak.org/server/importExport) | Leaving, restoring, and migration requirements. |
| B0 | [Better Auth homepage](https://better-auth.com/) and [introduction](https://better-auth.com/docs/introduction) | Identity, product scope, code in your app. |
| B1 | [Installation](https://better-auth.com/docs/installation) and [database](https://better-auth.com/docs/concepts/database) | Dependencies, framework integration, stored data. |
| B2 | [Organizations](https://better-auth.com/docs/plugins/organization) | Teams, roles, invitations, schema and dependency needs. |
| B3 | [SSO](https://better-auth.com/docs/plugins/sso) | Protocols, plugin boundaries, sales-gated self-service setup. |
| B4 | [Passkeys](https://better-auth.com/docs/plugins/passkey), [sessions](https://better-auth.com/docs/concepts/session-management), and [email](https://better-auth.com/docs/concepts/email) | Login lifecycle, passkey dependency, own message delivery. |
| B5 | [Security](https://better-auth.com/docs/reference/security), [rate limits](https://better-auth.com/docs/concepts/rate-limit), and [admin plugin](https://better-auth.com/docs/plugins/admin) | Controls, limits, and user operations. |
| B6 | [Vercel acquisition announcement](https://vercel.com/blog/vercel-acquires-better-auth) | Current owner transition and MIT license statement. |

### Result for every proposed field

These are findability judgments, not completed feature claims. A hard result is a warning about research effort. A feature can be absent and still be easy to research.

| Field | Clerk | Keycloak | Better Auth | Change to proposal |
| --- | --- | --- | --- | --- |
| F01 Identity | E C0 | E K0 | E B0/B6 | Keep aliases and parent changes. |
| F02 Type and scope | E C0/C4 | E K0/K2 | E B0/B1 | Keep; do not compare all three as hosted services. |
| F03 Lifecycle | E C0/C2 | E K0 | E B0/B6 | Keep current notices separate from feature promises. |
| F04 License | H C0/C5; SDK and service terms differ | E K0 | E B6; plugin licenses need separate checks | Keep per component. |
| F05 Operator | E C4 | E K2 | E B1 | Keep. |
| F06 Eligibility and markets | NP C0/C5 for a complete seller-country list | E–N/A K2; developer chooses deployment | E–N/A B1; developer operates app | Optional; no country claims from headquarters. |
| F07 Self-service and trial | E C1 | E–N/A K0/K2 | E–N/A B0/B1 | Conditional for hosted. |
| F08 Billing definition | E C1 | E–N/A K0 | E–N/A B0/B6 for library | Keep exact unit; Clerk uses returning-user terminology. |
| F09 Free allowance | E C1 | E–N/A K0; no hosted quota | E–N/A B6; license is separate | Keep software and hosted free use apart. |
| F10 Minimum paid cost | E C1 | E–N/A K0; hosting separate | E–N/A B6 for library; enterprise extras separate | Keep deployment scope. |
| F11 Usage formula | E C1 | E–N/A K0 | E–N/A B6 for library | Do not invent a usage bill. |
| F12 Consumer scenarios | H C1: plan/definition checks before calculation | E–N/A K0/K2 for total hosted price | E–N/A B1/B6 for total hosted price | Derived and conditional; do not save a fake $0 total. |
| F13 Business scenarios | H C1: organizations, connections, and plan gates | E–N/A K0/K2 for hosted price | H B2/B3: distinguish code from sales-gated add-ons | Keep conditional; unknown result allowed. |
| F14 Organization fees/limits | E C1 | H K1: behavior documented, no managed price | H B2/B3: open plugin versus paid service boundaries | Keep deployment and feature limits. |
| F15 SSO/SCIM fees | H C1/C2: check connection type and current plan | E–N/A K0 for vendor fees; extensions need review | H B3: self-service setup links to enterprise | Never assume supported means free. |
| F16 Builder seats/projects | E C1 | E–N/A K2 for vendor plan; server configuration differs | E–N/A B1 for vendor dashboard plan | Keep hosted-only. |
| F17 Message costs | H C1/C2: sending limits and provider choice | H K1/K2: mail setup clear, sender bill external | H B4: callback/sender clear, cost external | Required dependencies; external rates researched later. |
| F18 Over-limit behavior | E C1 | E–N/A K2 for vendor billing | E–N/A B1 for vendor billing | Keep quotas distinct from self-hosted capacity. |
| F19 Other charges | H C1: scan add-on tables and footnotes | E–N/A K0/K2 for project bill | H B3/B6: scope paid extras separately | Keep; unknown beats a complete-cost claim. |
| F20 Basic login methods | E C2 | E K1 | E B0/B4 | Keep per method. |
| F21 Social providers | E C2 | E K1 | E B0/B1 | Keep named providers. |
| F22 Passkeys | E C1/C2 for offer; H for all client limits | E K1 | E B4 | Keep implementation and plan detail. |
| F23 MFA/recovery | E C1/C2 for section; H for full recovery detail | E K1 | H B0/B5: extra plugin docs needed | Keep required; do not assume recovery from MFA support. |
| F24 Verification/reset | E C2 | E K1 | E B4 | Keep. |
| F25 Sessions | E C1/C4 | E K1 | E B4 | Keep limits and revocation separately. |
| F26 Business protocols | E C1/C2 | E K1/K3 | E B3 | Keep direction/role. |
| F27 Organizations/roles | E C1/C2 | E K1 | E B2 | Keep. |
| F28 SCIM | H C1/C2: plan and API pages needed | NP K1 in this bounded core-doc check | H B0/B3: separate plugin and license check | Required attempt only for business auth; plugin/core distinction. |
| F29 Ready-made screens | E C0/C1/C2 | E K1 | H B0/B1: headless core and external UI options | Keep without assuming a hosted login page. |
| F30 Branding/domains | E C1/C2 | E K1/K2 | H B1/B4: own UI, hosting, and passkey domain differ | Keep per deployment. |
| F31 Languages/accessibility | H C2; public accessibility evidence not established | H K1; locales easier than accessibility proof | NP B0/B1 for a complete accessibility assessment | Optional; keep unknown, remove numeric accessibility score. |
| F32 Web/runtime | E C2 | E K3 | E B0/B1 | Keep official versus generic protocol support. |
| F33 Mobile | E C2 | H K3: relies on client/protocol integration | H B0/B1: separate integration docs needed | Keep limits; do not infer from web support. |
| F34 Dependencies | E C4 | E K2 | E B1/B4 | Keep. |
| F35 Self-host operations | E–N/A C4 for hosted service | E K2; H for complete backup/restore plan | H B1: app/database operations mostly developer-owned | Require links, not an invented hardware minimum. |
| F36 Custom logic/events | E C2 | H K1: extension-specific docs needed | E B1/B2/B5 for hooks; H for full event scope | Keep public facts, allow incomplete event details. |
| F37 Administration/API | E C2 | E K1 | E B5 | Keep. |
| F38 Linking/guest upgrade | H C2: several flow pages | H K1: linking and guest behavior differ | H B1/B4: additional account/plugin docs needed | Keep; explicit unknown per operation. |
| F39 Export/exit | E C3 for user/hash export; H for all credentials | H K4: method and operational requirements matter | H B1: database owned, migration compatibility still needs work | Keep granular data types; no blanket lock-in score. |
| F40 Import | E C3 | H K4 | H B1/B5: migration is schema/hash dependent | Keep; file export is not proof of compatible import. |
| F41 Deletion/retention | H C2/C5: user API, backups, and contract differ | H K1/K2: developer controls database/backups | H B1/B5: developer controls storage and external senders | Required attempt; exact retention may stay unknown. |
| F42 Data location | H C4/C5: storage, logs, and contractual scope differ | E–N/A K2 for vendor choice; operator chooses | E–N/A B1 for vendor choice; operator chooses | Required for hosted; do not infer from headquarters. |
| F43 Privacy/assurance | E C5 for public claims; H for full gated reports | E–N/A K2 for hosted-service audit | E–N/A B1 for hosted-service audit | Optional evidence only; customer implementation still matters. |
| F44 Abuse protection | E C1/C2/C5 | E K1 | E B5 | Keep default versus optional. |
| F45 Rate limits | H C4/C2: endpoint-specific | H K1/K2: configurable controls, no universal capacity | E B5 for configurable default; no universal capacity | Record limit type; no requests-per-second benchmark. |
| F46 Events/retention | E C1 for plan retention; H for full event schema | H K1: event storage settings matter | H B1/B5: hooks and own storage, not a managed retention promise | Required attempt; no invented retention. |
| F47 Status/SLA | H C0/C1/C5: status and contract need separate pages | E–N/A K2 for vendor SLA | E–N/A B1 for vendor SLA | Conditional for hosted. |
| F48 Maintenance | H C2: SDK-specific policies | E K0 for dated releases; policy needs follow-up | H B0/B6: current project, version support needs follow-up | Required for deployable code; keep unsupported claims unknown. |
| F49 Support | E C1/C2 for routes; H for response promise | H K0/K1: community versus commercial vendors | H B0/B3: community versus enterprise | Unknown response hours allowed. |
| F50 Evidence | E C0–C5 | E K0–K4 | E B0–B6 | Keep per value, not one citation per product. |

### What to keep, narrow, or drop

Basic offer, integration, login methods, UI, and setup facts were usually easy to locate. Pricing needs more work because of counted units, edition boundaries, paid features, and outside delivery costs. Exit facts were available, but no single yes/no field can describe them safely.

Keep price scenarios as derived, conditional fields. Keep country eligibility and accessibility optional. Treat exact retention, mobile limits, support response hours, credential migration, and full data-location scope as fields that may stay unknown. Do not guess them from a marketing page.

Drop a universal self-hosted monthly cost, setup-time estimate, security score, measured latency, measured uptime, vendor market share, and “most popular” rank. The three-app check did not provide comparable public evidence for those claims. No performance tests or customer surveys were run.
