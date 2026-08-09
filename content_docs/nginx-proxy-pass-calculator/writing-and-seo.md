# Writing and SEO plan: NGINX proxy_pass URI Calculator

Status: ready
Tool: NGINX proxy_pass URI Calculator
Route: `/nginx-proxy-pass-calculator`
Depends on: `competitive-report.md`, `implementation-report.md`, `edge-cases-and-tests.md`, `brief.md`
Input fingerprint: `competitive-report.md sha256:f78bf0883e6c127eccafe1488f0478b657149d12435c901690727dde2dd2b281`
Input fingerprint: `implementation-report.md sha256:e1ec0f2ae6c975838c41c96583afad859e93748094407951ad7b951cc6f8e974`
Input fingerprint: `edge-cases-and-tests.md sha256:68d07b318ea32b6996e320dd6dd9dc0bdfb50e18aa3e4abe17810992d4e15d1c`
Input fingerprint: `brief.md sha256:4c4ec377863d3627db8c4dc7aa78088a9bf569f21833c85d70656599c6603be3`
SERP checked: 2026-08-09
Primary medium: Tool UI
Prose is the minority: yes
Static prose budget: 4 sections, 520 words maximum

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `nginx proxy_pass URI calculator`, `nginx proxy_pass URL calculator` | Calculate the exact upstream URL for one matched location and request | Final URL plus a visible replacement trace | The tool returns the authority, retained suffix, replacement URI, final path, and arguments |
| Close | `nginx proxy_pass trailing slash` | See what changes when the target ends in `/` | Exact current and toggled URLs | The optional slash comparison changes only the target's final slash and recommends neither form |
| Close | `nginx proxy_pass preserve request URI` | Distinguish an omitted target URI from a `/` URI | Small configuration comparison | The guide table contrasts authority-only, root URI, and prefixed URI targets |
| Close | `proxy_pass cannot have URI part regex location` | Know whether a static calculation is safe | Unknown result with an honest next step | Regex, named, rewrite, variable, query-bearing, and normalization-sensitive cases show no plausible URL |

### Post-build competitive re-review

- A fresh exact Bing Browser query on 2026-08-09 showed about 425 results. The leading shapes were official NGINX documentation, reverse-proxy guides, Server Fault questions, and other articles. No result on the first page was a final-upstream-URL calculator.
- The operated adjacent tools still split the job across full-config linting, one-location matching, or simplified rewrite simulation. None combines a supplied matched location, incoming request target, static `proxy_pass` URL, exact final URL, and transformation trace.
- The implemented page now covers that gap with a real NGINX 1.30.4 receipt, an explicit omitted-URI distinction, literal slash comparison, raw request arguments, and no-guess unknown states. No P0 or P1 competitive gap remains inside the approved static scope.

### Intent not targeted

- Full NGINX configuration validation or location selection: the user supplies the location NGINX already matched.
- Rewrite simulation, variables, regular-expression replacement, or named-location execution: these need more runtime or configuration state than this calculator has.
- Upstream availability, DNS, headers, redirects, response behavior, or security review: the page calculates only the request URL construction step.
- Configuration generation: the tool compares inputs and does not prescribe a production configuration.

## Page promise

Enter the matched static location, incoming request target, and `proxy_pass` URL to calculate the final upstream URL and see the literal replacement trace. Unsupported runtime-dependent cases show no URL and must be checked in NGINX.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | H1 introduction | Sentences | `brief.md`; primary search intent | Define the one-request debugging job once |
| Which inputs, modes, and scope choices matter? | Tool labels and supported-case section | Tool UI and table | Implementation input contract | Do not narrate every radio or button |
| How should someone choose meaningful inputs and use it for the real task? | `Use the location NGINX actually matched` | Sentences | Implementation assumption and NGINX location docs | Explain the source of inputs, not click instructions |
| How should the result and its important terms be interpreted? | Dynamic result trace and `Read the result as one replacement chain` | Exact result visualization and sentences | Formula steps 7 to 11 | Do not repeat each visible trace row |
| Which concepts, syntax, ordering, or edge cases commonly surprise users? | Configuration table and slash comparison | Table and Tool UI | FF-001 to FF-007 | Keep repeated examples out of paragraphs |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | `When the answer needs live NGINX` | Table | Implementation exclusions and unknown states | State each boundary once |
| How are user inputs handled? | H1 introduction and limit table | Sentences and table | Static privacy tests and implementation R14 | Scope the claim to calculator inputs |
| What should the reader verify or do next? | `Verify the target in the running configuration` | Sentences and primary-source links | NGINX docs and fixture verifier | One short verification path, no deployment guide |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: `NGINX proxy_pass URI Calculator: see the upstream URL` | What answer will I get? | Name the three inputs, final URL and trace, browser-local calculation, and live-instance boundary | Sentences | `brief.md`; implementation R8 and R14 | 65 words maximum; no formula lesson | COPY-01 |
| 2 | Interactive calculator and dynamic result | What does this configuration do? | Calculate only after submit; show answer, trace, comparison, or no-guess recovery | Tool UI | Implementation and test contract | Keep the tool primary | n/a |
| 3 | H2: `Use the location NGINX actually matched` | Which values should I enter? | Use the selected literal prefix or exact location, raw request target, and directive URL | Sentences | NGINX location and proxy docs | 90 words; no full location-selection tutorial | COPY-02 |
| 4 | H3: `Common static cases` | How do omitted URI and slash forms differ? | Compare four exact configurations and final paths | Table | Real NGINX FF-001 to FF-005 | No recommendation column | n/a |
| 5 | Slash comparison | What does only the target's final slash change? | Show the current and toggled full URL without labeling either one correct | Exact result visualization | Implementation R9; FF-001 to FF-004 | Keep the primary URL unchanged | n/a |
| 6 | H2: `Read the result as one replacement chain` | How was the path constructed? | Explain retained suffix, replacement URI, literal concatenation, and unchanged arguments | Sentences | Formula steps 7 to 11 | 105 words; do not narrate table cells | COPY-03 |
| 7 | H2: `When the answer needs live NGINX` | Why did the tool refuse to calculate? | Map regex, named, rewrites, variables, target queries, and normalized paths to the missing state | Table | Official proxy and rewrite docs; unknown fixtures | Keep no-URL boundary explicit | n/a |
| 8 | Result provenance | Which implementation and NGINX receipt produced this answer? | Show formula v1 and NGINX 1.30.4 quietly with the success result | Exact result visualization | Fixture receipt and implementation R17 | No timeless compatibility claim | n/a |
| 9 | H2: `Verify the target in the running configuration` | What should I check next? | Inspect effective configuration and observe the upstream request URI | Sentences | NGINX docs; implementation verification boundary | 95 words; no safety guarantee | COPY-04 |

No marker art, screenshot, clean chart, FAQ, methodology section, or general reverse-proxy tutorial is justified. The live transformation trace, slash comparison, exact configuration table, and limits table are the useful visuals.

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| URI omitted | An authority-only `proxy_pass` retains the supported request path | Dynamic trace and common-cases table | FF-001 and FF-006 | Changed or normalized request states remain excluded |
| URI present | The matched literal location prefix is replaced by the target URI | Dynamic trace and common-cases table | FF-002 to FF-005 | Only supplied prefix and exact locations are calculated |
| Literal slash behavior | NGINX does not invent a separator between replacement URI and retained suffix | Slash comparison and `/v2` versus `/v2/` rows | FF-003, FF-004, and FF-007 | Neither form is universally recommended |
| Request arguments | Supported incoming arguments follow the calculated final path unchanged | Arguments trace row | FF-001, FF-005, and FF-006 | A query on the `proxy_pass` target is deferred |
| Unknown state | A plausible URL is more dangerous than no URL when processing state is missing | Unknown result and limit table | FF-008 to FF-014 | Give an NGINX verification step instead of a guess |
| Version boundary | Static cases are pinned to formula v1 and a real NGINX 1.30.4 receipt | Quiet result provenance | Receipt JSON and verifier | Do not imply automatic coverage of future NGINX behavior |

## Metadata proposal

- Registry label: `proxy_pass calculator`
- Meta title: `NGINX proxy_pass URI Calculator: see the upstream URL`
- Meta description: `Calculate the final upstream URL for one NGINX location, request target, and static proxy_pass URL. See the replacement trace and slash difference.`
- Page type: `WebApplication`
- Publication recommendation: `Keep unpublished until final page QA and explicit publication approval update the central registry.`

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Out | `https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass` | Read the primary directive rules and unsupported-location boundary | `official proxy_pass documentation` | Final verification section |
| Out | `https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#rewrite` | Understand why `break` and `last` need broader processing state | `NGINX rewrite documentation` | Live-NGINX limits table |

No existing version127 page directly continues this URI-construction task. Do not add an unrelated internal link only for link count.

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Word limit and shape | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | H1 introduction | Define the inputs, answer shape, local handling, and verification boundary | `brief.md`; implementation R8 and R14 | 65 words maximum in one paragraph | No best, only, guarantee, full-parser, or security-review claim |
| COPY-02 | `Use the location NGINX actually matched` | Explain where the three values come from and the supported literal scope | NGINX location docs; implementation assumptions | 90 words maximum in two short paragraphs | No button instructions or location-selection algorithm |
| COPY-03 | `Read the result as one replacement chain` | Explain suffix retention and literal replacement without repeating the trace | Formula steps 7 to 11; FF-003 and FF-004 | 105 words maximum in two paragraphs | No normalization claim or universal slash advice |
| COPY-04 | `Verify the target in the running configuration` | Give the shortest honest next step for success or unknown | Official proxy and rewrite docs; implementation exclusions | 95 words maximum in one paragraph plus two concise checks | No deployment, reload, safety, or backend-correctness guarantee |

### Voice and accuracy constraints

- Follow `version127_docs/writing-style.md` and `version127_docs/visual-first.md`.
- Write `version127`, lowercase.
- Use no em dash or en dash.
- Do not invent facts, numbers, benefits, privacy claims, or implementation behavior.
- Do not repeat a result, table, trace, heading, or prior section.
- Call the output a calculated URL, never proof that NGINX selected the supplied location or reached the intended backend.
- Keep the omitted-URI and `/` URI forms distinct in every example.
- Leave unresolved facts as explicit review notes, not plausible copy.

### Tool-build exclusion

`$version127-tool-build` must not draft or integrate these sections. The later `$version127-tool-writing` stage owns content integration.

## Source ledger

- NGINX `proxy_pass` directive: https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass, checked 2026-08-09. Supports URI presence, prefix replacement, unchanged request behavior, variables, regex and named locations, and rewrite boundaries.
- NGINX rewrite directive: https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#rewrite, checked 2026-08-09. Supports the `break` and `last` processing boundaries.
- NGINX location directive: https://nginx.org/en/docs/http/ngx_http_core_module.html#location, checked 2026-08-09. Supports matching against a normalized URI path.
- Real NGINX 1.30.4 receipt: `tests/pages/nginx-proxy-pass-calculator/fixtures/nginx-1.30.4.json`, checked 2026-08-09. Supports the seven static URI-construction fixtures and pinned image digest.

## Open questions and blockers

- None. The route remains unpublished. Any change to the competitive, implementation, test, or brief artifact invalidates these fingerprints and requires this plan to be reviewed again.
