# Competitive report: NGINX proxy_pass URI Calculator

Status: ready
Tool: NGINX proxy_pass URI Calculator
Route: `/nginx-proxy-pass-calculator`
Researched: 2026-08-09
Direct competitors reviewed: 5
Saturation exception: yes

## Research scope

### Current version127 state

The route, docs folder, tests, scripts, and engine did not exist at intake. The route is locked to the flat canonical URL `/nginx-proxy-pass-calculator`, with source under `app/(site)/(tools)/nginx-proxy-pass-calculator/`. The existing opportunity report scores the idea 23/25 and limits the first release to deterministic, source-backed URI construction. The repository has extensive user-owned route-flattening work in progress, so all new work must remain route-owned and unpublished.

The idea passes the surface decision rule because the answer is a deterministic transformation over user-provided configuration and request data. It does not require curated coverage or a live upstream. It serves the technical person who runs their own reverse proxy and remains useful as one focused URL.

### Method and coverage

Four search shapes were checked in Google, Bing, and web index search:

- exact: `nginx proxy_pass URI calculator`;
- job: `nginx proxy_pass trailing slash online tool`;
- specialist: `nginx location proxy_pass URI rewrite tester`;
- pain: `nginx preserve request URI proxy_pass confusion`.

Google and Bing were inspected in the in-app Browser at a desktop viewport on 2026-08-09. Google returned Server Fault, a location matcher, articles, Stack Overflow, and official documentation, and explicitly marked several results as missing `calculator`. Bing showed about 10,900 indexed results, led by Stack Overflow, official documentation, and explainers. That count is result density, not search volume. Neither engine showed a direct calculator for the final upstream URL.

Five closest interactive workflows were inspected at desktop width. Four loaded and were operated. Slopstore was indexed but its page did not become usable before the Browser navigation timeout. The accessible tools cover generic config linting, one-location matching, simplified rewrite simulation, or a full sandbox. None accepts the matched prefix location, incoming request target, and `proxy_pass` URL and then returns the exact final upstream target with a trace.

### Search saturation evidence

- Queries tried: `nginx proxy_pass URI calculator`, `nginx proxy_pass trailing slash online tool`, `nginx location proxy_pass URI rewrite tester`, `nginx preserve request URI proxy_pass confusion`, `online nginx location tester tool`, `online nginx config validator proxy_pass trailing slash`, `nginx playground online proxy_pass`, and exact quoted variations for config testers and location matchers.
- Repeated domains: nginx.org, docs.nginx.com, Stack Overflow, Server Fault, SokuTools, generic developer-tool portfolios, and explanatory blogs repeated across the searches.
- Exclusions: documentation and articles are not interactive competitors; Q&A pages do not calculate an answer; generic regex tools do not model NGINX URI replacement; config generators produce configuration but do not resolve a request; full sandboxes require running a configuration and interpreting upstream logs. Five adjacent interactive workflows exhausted the distinct direct shapes that appeared.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Exact calculation | `nginx proxy_pass URI calculator` | The upstream target for one request and configuration | Q&A, docs, one location matcher, explainers |
| Trailing slash comparison | `nginx proxy_pass trailing slash` | See exactly what one slash changes | Articles and worked tables |
| Prefix replacement | `nginx location proxy_pass URI rewrite` | Know which request prefix is retained or replaced | Docs, Q&A, simplified rewrite tools |
| Preserve original request | `nginx preserve request URI proxy_pass` | Choose between original and normalized URI behavior | Stack Overflow and mailing-list answers |
| Diagnose unsupported scope | `proxy_pass cannot have URI part regex location` | Know when NGINX cannot determine the part to replace | Error excerpts and official docs |

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| A trailing slash unexpectedly strips or retains `/api/` | https://serverfault.com/questions/607615/using-trailing-slashes-in-nginx-configuration/607731 and https://www.reddit.com/r/nginx/comments/1ew7god | Repeated across years and current explainers | Put the exact final target first and show a slash comparison |
| Users confuse an omitted `proxy_pass` URI with a `/` URI | https://stackoverflow.com/questions/5834025/how-to-preserve-request-url-with-nginx-proxy-pass | More than 200,000 visible historical views in the indexed result and repeated related questions | Distinguish authority-only from URI-bearing targets explicitly |
| URI replacement uses the normalized request URI | https://trac.nginx.org/nginx/ticket/1216 and https://mailman.nginx.org/pipermail/nginx/2018-March/055835.html | Documentation ticket plus repeated encoding threads | Show both original request target and normalized path boundaries; do not claim byte preservation in replacement mode |
| Variables change the meaning of the `proxy_pass` URI | https://trac.nginx.org/nginx/ticket/803 and https://mailman.nginx.org/pipermail/nginx/2009-February/009606.html | Long-lived official ticket and mailing-list confusion | Mark variable-bearing targets unresolved unless the supported variable values fully determine the target |
| Regex and named locations cannot use ordinary prefix replacement | https://www.reddit.com/r/nginx/comments/rspon8 and official `proxy_pass` docs | Repeated configuration errors | Return an unsupported or invalid result instead of guessing |
| Existing online linters can confidently misparse valid nested configuration | Browser-operated Aback Tools probe on 2026-08-09 | One direct controlled probe | Base trust on official rules and real NGINX fixtures, not heuristic linting |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| With a URI in `proxy_pass`, replace the normalized request URI prefix that matched the prefix location | https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass | Documented | Applies when NGINX can determine the matched part |
| Without a URI in `proxy_pass`, pass the original request URI for an unchanged request | https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass | Documented | If processing a changed URI, NGINX passes the full normalized changed URI |
| A lone `/` after the upstream authority is a URI | https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass | Documented | `http://backend` and `http://backend/` are different contracts |
| Regex and named locations must not use a URI-bearing ordinary `proxy_pass` | https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass | Documented | The replaced part cannot be determined |
| `rewrite ... break` can make the `proxy_pass` URI ignored and pass the full changed URI | https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass and https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#rewrite | Documented | Launch support should be limited to a precisely modeled `break` rewrite or excluded |
| `rewrite ... last` starts a new location search | https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#rewrite | Documented | A single-location calculator cannot resolve the final target without the later location set |
| New rewrite arguments append old arguments unless replacement ends with `?` | https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#rewrite | Documented | Query behavior needs separate fixtures |
| When variables are used in `proxy_pass`, a URI in the directive is passed as specified after variable expansion | https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass | Documented | Static calculation is safe only for a closed supported variable set with user-provided resolved values; otherwise unknown |
| Query strings do not participate in prefix-location matching | https://nginx.org/en/docs/http/ngx_http_core_module.html#location | Documented | The location matches the normalized URI path, then arguments follow the chosen URI behavior |
| Current verification baseline is NGINX stable 1.30.4 and mainline 1.31.3 | https://nginx.org/en/download.html | Documented | Checked 2026-08-09; fixture script should record the exact image/version used |

## Competitor reviews

### Competitor 1: Aback Tools Nginx Config Validator

- URL: https://abacktools.com/tools/data/validators/nginx-validator
- Accessed: 2026-08-09 at desktop width; fully accessible and operated.
- Audience and promise: [Observed] DevOps users who want a client-side syntax, security, and configuration validator.
- Inputs and defaults: [Observed] One large configuration textbox, optional upload, and an extensive example placeholder. No request URI input exists.
- Action and state behavior: [Observed] Explicit Validate Nginx action, disabled while empty, Clear All, line/key/error counters, and inline result list.
- Results and visuals: [Observed] Error and warning counts with line references, plus a long guide. It does not calculate an upstream URI.
- Formula or data source: [Unknown] The page claims local JavaScript parsing but does not identify a real NGINX parser or fixture version.
- Errors and edge behavior: [Observed] A compact valid configuration containing `events`, `http`, `server`, `location`, and `proxy_pass` was incorrectly reported with `Unknown listen flag "location"` and `Unknown listen flag "/api/"` while also saying `Valid Nginx`.
- Mobile and accessibility: [Observed] The form has a discoverable textbox and buttons, but the page sits inside a dense portfolio shell. Mobile was not needed to establish the product gap.
- Privacy: [Documented] The page states processing is local and inputs do not leave the browser.
- Performance: [Observed] Initial load was delayed by a very large navigation and article surface; validation itself returned promptly.
- Search-content structure: [Observed] H1, tool, benefits, use cases, six-part guide, related tools, and FAQ. The tool is followed by a long SEO article.
- What works: It accepts full pasted configuration and reports line-oriented findings.
- What fails: It produced contradictory and technically unreliable output for the controlled valid probe and never resolves the requested upstream URI.
- Do not copy: The broad promise, card-heavy tool directory shell, long article, or heuristic confidence.

```text
[portfolio sidebar] | Nginx Config Validator
                    | promise paragraph
                    | [large config textarea]
                    | [Validate] [Clear]
                    | counters + validation list
                    | long guide + FAQ + related cards
```

### Competitor 2: SokuTools Nginx Location Matcher

- URL: https://sokutools.com/en/tools/nginx-location-matcher/
- Accessed: 2026-08-09 at desktop width; fully accessible and operated.
- Audience and promise: [Observed] Users debugging which NGINX `location` wins.
- Inputs and defaults: [Observed] Request path and location definitions, one per line.
- Action and state behavior: [Observed] Explicit Match and Copy actions, an empty result area, local-processing note, and no URL state.
- Results and visuals: [Observed] Intended to return a selected location and trace, not an upstream target. In the controlled three-location probe, the visible result remained blank after Match.
- Formula or data source: [Documented] The page links NGINX location and request-processing docs, while labeling its own rule set simplified.
- Errors and edge behavior: [Observed] It states invalid regexes become warnings and named locations are non-URI match targets; rewrites and `try_files` are excluded.
- Mobile and accessibility: [Observed] Labels were associated with the input controls and buttons were keyboard discoverable.
- Privacy: [Documented] The page states the tool runs in the browser and sends no input to a server.
- Performance: [Observed] The small tool shell loaded promptly after ad scripts settled.
- Search-content structure: [Observed] H1, one-sentence promise, tool, short notes, compact rule list, references, FAQ, and related diagnostic links.
- What works: It keeps scope narrow and admits simplifications.
- What fails: It only chooses a location and cannot explain `proxy_pass` URI construction; the controlled visible result did not populate.
- Do not copy: Simplified matching claims or empty-output behavior.

```text
Nginx Location Matcher
[Match] [Copy]
Request path       [________________]
Location lines     [________________]
Result             [________________]
Status
short notes + references + related tools
```

### Competitor 3: SokuTools Nginx Rewrite Checker

- URL: https://sokutools.com/en/tools/nginx-rewrite-checker/
- Accessed: 2026-08-09 at desktop width; fully accessible.
- Audience and promise: [Observed] Users simulating ordered `rewrite` and `return` lines.
- Inputs and defaults: [Observed] Initial path, one rule per line, and maximum hops defaulting to 12.
- Action and state behavior: [Observed] Explicit Run and Copy actions, result textarea, status, and local-processing note.
- Results and visuals: [Observed] A rewrite transition trace. It does not accept `location` plus `proxy_pass` or construct the upstream authority.
- Formula or data source: [Documented] The page cites the NGINX rewrite module but calls its behavior a simplified model.
- Errors and edge behavior: [Observed] It limits loops by hop count and warns that variables, subrequests, module settings, location branching, and `try_files` can differ.
- Mobile and accessibility: [Observed] Controls are plainly labeled and appear in a single vertical tool flow.
- Privacy: [Documented] It states browser-local processing.
- Performance: [Observed] The page loaded promptly.
- Search-content structure: [Observed] H1, tool, brief notes, supported-directive list, two FAQ items, sources, and related tools.
- What works: It exposes ordered trace and honest limitations.
- What fails: It separates rewrite behavior from the proxy target and cannot answer the primary job.
- Do not copy: A generalized rewrite simulator or the arbitrary hop model.

```text
Nginx Rewrite Checker
[Run] [Copy]
Initial path       [________________]
rewrite/return     [________________]
Max hops           [12]
Simulation result  [________________]
Status
short limits + sources
```

### Competitor 4: SEOWebChecker NGINX Config Tester

- URL: https://seowebchecker.com/nginx-config-tester
- Accessed: 2026-08-09 at desktop width; fully accessible and operated.
- Audience and promise: [Observed] Developers wanting one browser-based linter, regex tester, rewrite simulator, snippets library, and reference.
- Inputs and defaults: [Observed] One configuration editor. Separate tabs expose a location regex pattern and request URI, or a rewrite pattern, replacement, flag, and test URI.
- Action and state behavior: [Observed] Explicit Test Config, Format, Clear, and Copy actions. A valid compact proxy configuration returned `Configuration looks valid!`.
- Results and visuals: [Observed] Validation messages plus separate regex and rewrite results. No tab combines location selection, `proxy_pass`, request arguments, and final upstream URL.
- Formula or data source: [Unknown] The page says client-side parsing but does not pin an NGINX version or real-instance fixture set.
- Errors and edge behavior: [Observed] Empty guidance is clear. The controlled valid config was accepted, but no upstream URI trace was offered.
- Mobile and accessibility: [Observed] The editor and result tabs expose accessible names; the page is visually dense with feature grids and a long article.
- Privacy: [Documented] The page calls the workflow client-side and privacy-friendly, without a tool-specific data-flow proof.
- Performance: [Observed] The page became interactive after a moderate initial load.
- Search-content structure: [Observed] H1, feature strip, tabbed tool, eight feature blocks, four-step guide, deep-dive article, related tools, and FAQ.
- What works: Multiple adjacent diagnostics are reachable in one interface and the valid probe produced a consistent result.
- What fails: Users must manually join separate regex and rewrite simulations, and correctness is not pinned to an NGINX release.
- Do not copy: The all-in-one tab inventory, marketing labels, long deep dive, or unversioned confidence.

```text
NGINX Config Tester
feature strip
[config editor] [Format] [Clear] [Copy] [Test]
[Validation | Regex Tester | Rewrite Sim | Snippets | Reference]
active result
feature grid + four steps + deep dive + FAQ
```

### Competitor 5: UUUP Nginx Location Tester

- URL: https://uuup.net/en/tools/dev/nginx-location-tester
- Accessed: 2026-08-09 at desktop width; fully accessible and operated.
- Audience and promise: [Observed] Users testing one location modifier and pattern against one request path.
- Inputs and defaults: [Observed] Modifier select, URI pattern, and test URL path. Defaults are a plain prefix, `/api/`, and `/api/users?id=1`.
- Action and state behavior: [Observed] Live result, Load API example, Reset, favorite, copy-link, and share controls. Selecting `^~` for `/api/` against `/api/users?id=1` returned `MATCHED`.
- Results and visuals: [Observed] A large binary matched status. It does not show which part of the request is replaced or calculate an upstream URL.
- Formula or data source: [Unknown] No primary formula or version anchor is shown in the tool surface.
- Errors and edge behavior: [Documented] The FAQ states it does not replace a real NGINX reload and excludes upstream chains, rewrites, and full config parsing.
- Mobile and accessibility: [Observed] Native select and textboxes are keyboard reachable; inputs lacked strong programmatic label text in the Browser snapshot.
- Privacy: [Documented] The page states local browser processing.
- Performance: [Observed] The page loaded promptly and live result updated without a submit round trip.
- Search-content structure: [Observed] H1, tool, use cases, short how-to list, one example, two FAQ items, and related tools.
- What works: Fast time to a simple match and an honest scope boundary.
- What fails: Binary match is insufficient for URI construction and `^~` matters only in competition with regex locations, which the single-rule interface cannot model.
- Do not copy: A binary success badge without transformation evidence or favorite/share chrome inside the primary workflow.

```text
Nginx Location Tester
[Load example] [Reset]
Modifier     [prefix v]
Pattern      [/api/________]
Request path [/api/users___]
             MATCHED
use cases + how to + example + FAQ
```

## Comparison matrix

| Capability | Aback Validator | Soku Location | Soku Rewrite | SEOWebChecker | UUUP Location | User value |
| --- | --- | --- | --- | --- | --- | --- |
| Full config input | Yes | No | No | Yes | No | Low for this focused job |
| Request path input | No | Yes | Yes | Separate tabs | Yes | High |
| `proxy_pass` target input | Only inside config | No | No | Only inside config | No | High |
| Exact upstream URL | No | No | No | No | No | High |
| Prefix replacement trace | No | Location trace only | Rewrite trace only | No combined trace | No | High |
| Query handling | No result | Path only | Partly | Separate rewrite tab | Path only | High |
| Variables boundary | No | No | Caveat only | No | No | High |
| Regex/named-location boundary | Generic lint only | Partial | No | Regex test only | Single rule | High |
| Real NGINX fixture version | Unknown | Unknown | Unknown | Unknown | Unknown | High |
| Browser-local calculation | Claimed | Claimed | Claimed | Claimed | Claimed | Medium |
| Honest unsupported result | No | Some notes | Some notes | No combined result | FAQ scope note | High |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| Does `http://backend/` merely add a slash? | Generic validators describe a trailing-slash mismatch as a warning, while official docs define `/` as a URI that triggers prefix replacement | Official `proxy_pass` docs plus real NGINX fixtures | No: model URI presence, not a generic slash warning |
| Is a config parser enough to determine the final target? | Config testers validate structure but do not combine request processing state | Official proxy and rewrite module docs | No: the tool needs explicit request and matched-location inputs |
| Can regex or named locations replace a matched prefix? | Location tools model matching, while official docs prohibit a URI-bearing ordinary `proxy_pass` where the replaced part cannot be determined | Official `proxy_pass` docs | No: classify unsupported or invalid rather than calculate |
| Is variable-bearing `proxy_pass` equivalent to a static URL? | Some generic tools accept the syntax without a changed result model | Official `proxy_pass` docs and ticket 803 | Yes: product planning must define a closed supported subset or return unknown |
| Which request representation is used? | Articles often say original path, while official docs distinguish original request URI from normalized URI replacement | Official docs and official mailing-list clarification | Yes: fixture exact normalization and escaping before implementation |

## Evidence-backed opportunities

1. **One answer, not a linter**: accept the four pieces users already have and return the exact upstream target as the strongest element.
2. **Make replacement visible**: show matched prefix, retained suffix, replacement URI, and final query as a compact ordered trace.
3. **Compare slash variants without retyping**: show the current answer beside the target with its terminal slash toggled, while clearly labeling this as a comparison rather than a recommendation.
4. **Say unknown when NGINX needs more state**: variables, `rewrite last`, named locations, regex locations with URI parts, and unmodeled normalization must never produce a plausible URL.
5. **Version-backed trust**: derive fixtures from NGINX 1.30.4 stable, cross-check mainline 1.31.3 when feasible, and expose the verification version/source date.

## Table stakes

- Prefix location input, incoming request target, and `proxy_pass` URL.
- Exact distinction between no URI and `/` URI.
- Preserved query arguments for ordinary static cases.
- Explicit validation and no stale result after an invalid edit.
- One primary calculate action, repeat calculation, reset, copy result, and keyboard submit.
- Local-only processing with no configuration or request data sent or stored.
- An unsupported result with a reason for regex, named, variable, or rewrite cases outside the verified contract.
- A next-step command or method to verify against the user's own NGINX and upstream logs.

## Ideas to reject

- Full `nginx.conf` parser: it expands scope, repeats generic tools, and still cannot safely model every module and internal redirect.
- Universal variable evaluator: runtime variables depend on request, maps, captures, DNS, and module state.
- Automatic recommendation that one slash style is correct: the correct target depends on what the upstream expects.
- Regex-location URI calculation: official docs say the replaced part cannot be determined, so a deterministic answer would be false confidence.
- `rewrite last` simulation without a complete location set: it triggers a new search and cannot be resolved from one location.
- Security or deployment score: it does not help the URI job and would imply a broader audit.
- Generated production config: the tool should explain the current transformation, not prescribe an unreviewed deployment.

## Open questions and blockers

- Product planning must choose whether launch includes one narrowly specified `rewrite ... break` form or excludes all rewrites. The safest initial scope is static prefix replacement without rewrites, with explicit unsupported outcomes for rewrite cases.
- Exact normalization and percent-encoding behavior must be locked using real NGINX 1.30.4 fixtures before the engine is accepted.
- No research blocker remains for the deliberately small static-prefix contract.

## Sources

- NGINX `proxy_pass` directive: https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass, accessed 2026-08-09. Documented URI construction and unsupported cases.
- NGINX rewrite module: https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#rewrite, accessed 2026-08-09. Documented rewrite flags and argument behavior.
- NGINX location directive: https://nginx.org/en/docs/http/ngx_http_core_module.html#location, accessed 2026-08-09. Documented normalized URI matching.
- NGINX reverse proxy guide: https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/, accessed 2026-08-09. Documented prefix replacement example.
- NGINX downloads: https://nginx.org/en/download.html, accessed 2026-08-09. Documented current stable 1.30.4 and mainline 1.31.3 versions.
- NGINX ticket 1216: https://trac.nginx.org/nginx/ticket/1216, accessed 2026-08-09. Documented terminology confusion.
- NGINX ticket 803: https://trac.nginx.org/nginx/ticket/803, accessed 2026-08-09. Documented variable behavior confusion.
- NGINX mailing-list preservation explanation: https://mailman.nginx.org/pipermail/nginx/2018-March/055835.html, accessed 2026-08-09. Documented normalized replacement versus original preservation.
- Stack Overflow preserve-request question: https://stackoverflow.com/questions/5834025/how-to-preserve-request-url-with-nginx-proxy-pass, accessed 2026-08-09. Observed recurring user pain.
- Server Fault trailing-slash question: https://serverfault.com/questions/607615/using-trailing-slashes-in-nginx-configuration/607731, accessed 2026-08-09. Observed recurring user pain.
- Aback Tools validator: https://abacktools.com/tools/data/validators/nginx-validator, Browser-operated 2026-08-09.
- SokuTools location matcher: https://sokutools.com/en/tools/nginx-location-matcher/, Browser-operated 2026-08-09.
- SokuTools rewrite checker: https://sokutools.com/en/tools/nginx-rewrite-checker/, Browser-inspected 2026-08-09.
- SEOWebChecker config tester: https://seowebchecker.com/nginx-config-tester, Browser-operated 2026-08-09.
- UUUP location tester: https://uuup.net/en/tools/dev/nginx-location-tester, Browser-operated 2026-08-09.
- Navendu NGINX playground: https://navendu.me/playgrounds/nginx/, Browser-operated 2026-08-09. Adjacent sandbox reference; default run returned `request failed` and was not counted as one of the five direct comparison rows.
- Slopstore location regex tester: https://slopstore.org/app/free-nginx-location-block-regex-tester-validator-twdmyp, accessed attempt 2026-08-09. Indexed adjacent tool, but Browser navigation timed out and it was excluded from the competitor count.
