# Writing and SEO plan: Home Assistant Energy Entity Eligibility Checker

Status: ready
Tool: Home Assistant Energy Entity Eligibility Checker
Route: `/home-assistant-energy-entity-checker`
Depends on: `competitive-report.md`, `implementation-report.md`, `edge-cases-and-tests.md`, `brief.md`
Input fingerprint: `competitive-report.md sha256:d2a2d93cc0b54c03db997f41b8b2db7804c0b33f282e047eefaac875a29829d4`
Input fingerprint: `implementation-report.md sha256:6577e618adfdcef489bcc050c3ecea0d06e9c212e90a3081c2d59ba427695991`
Input fingerprint: `edge-cases-and-tests.md sha256:4248041fa35ac3fdeeb975323eb2f6e4a9590eefed5c1fcff062c2e5d141be5a`
Input fingerprint: `brief.md sha256:1eaa3fd5444c83e5a4ac22414fe535672fcf72c6526a6dc1dbbd2d52cabec632`
SERP checked: 2026-08-09
Primary medium: Tool UI
Prose is the minority: yes
Static prose budget: 4 sections, 480 words maximum

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `Home Assistant entity not showing in Energy dashboard`, `Home Assistant Energy entity checker` | Find the exact attribute rule preventing one entity from appearing in an intended Energy field | Interactive checker with a field-specific verdict and failed-rule evidence | The tool asks for the intended field, checks copied attributes locally, and returns an Energy conclusion plus scoped rules |
| Close | `Home Assistant power entity not showing in Energy dashboard` | Distinguish an instantaneous power sensor from an accumulated energy sensor and test the right picker field | Role-aware diagnostic rather than generic YAML advice | The visible roles and requirement table separate power `measurement` inputs from accumulated energy totals |
| Close | `Home Assistant Energy dashboard unit not supported` | Compare the current unit with the exact accepted family and character form | Exact received-versus-accepted evidence | The dynamic trace shows the received unit, accepted units, scope, and pass or fail result |
| Close | `Home Assistant sensor not showing long term statistics` | Learn whether current attributes can produce statistics without confusing that with Energy picker eligibility | Separate statistics conclusion with a recorder boundary | The result evaluates the statistics attribute contract independently and keeps live recorder checks unresolved |

### Post-build competitive re-review

- The exact checker phrase still surfaced no dedicated standalone checker in the current web index. Result shapes remain official Home Assistant documentation, community troubleshooting, Reddit discussions, videos, and integration-specific advice.
- Missing-entity and unit variations continue to lead with the official Energy overview and FAQ, followed by recent community questions. The FAQ still sends users through States, attribute checks, and Statistics as separate steps.
- Long-term-statistics variations continue to surface the Home Assistant Data Science Portal, sensor developer documentation, and discussion threads rather than a role-aware attribute checker.
- A recent community case from 2026-04-25 still demonstrates the power-versus-energy confusion: a `W` sensor was missing until `device_class: power` and `state_class: measurement` were supplied.
- The ready competitive report already contains same-day Google and Bing Browser observations. The in-app Browser backend was unavailable during this bounded handoff, so the re-review used those same-day observations plus a fresh current web-index check. No intent shift or new direct competitor was found.
- Current behavior covers the remaining competitive requirements: role-first selection, manual and pasted inputs, independent Energy and statistics conclusions, scoped received-versus-accepted rules, release provenance, local evaluation, and explicit live-instance checks. No P0 or P1 technical gap remains.

### Intent not targeted

- Home Assistant installation or Energy dashboard setup: this page diagnoses one existing entity, not the whole dashboard.
- Power-to-energy conversion, template sensors, or generated YAML: ownership and sampling choices require a separate guide or the official integration documentation.
- Statistics history recovery, database repair, and sum adjustment: these require the user's live Home Assistant instance.
- General sensor validation: the checker is limited to Energy-related roles and the pinned statistics boundary.

## Page promise

Compare one sensor's current attributes with the selected Home Assistant Energy field and the long-term-statistics attribute contract, then see the exact rules that passed or failed. The checker runs locally but cannot inspect recorder health or guarantee picker visibility.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | H1 introduction | Sentences | `brief.md`; competitive search intent | Define the missing-entity job once and do not repeat the promise below the tool |
| Which inputs, roles, units, and scope choices matter? | Role choices, manual fields, paste input, and role requirement reference | Tool UI | Implementation input contract and pinned role matrix | Do not narrate ordinary controls in prose |
| How should someone choose meaningful inputs and use it for the real task? | `Choose the Energy field before judging the sensor` | Sentences | Energy overview; implementation product thesis | Explain role choice and copied current attributes, not button clicks |
| How should the two conclusions and uncertainty be interpreted? | Dynamic conclusions, scoped trace, and `Energy and statistics answer different questions` | Exact result visualization | Implementation resolution order; FF-017 | Explain the boundary once and do not restate trace rows |
| Which concepts, syntax, ordering, or edge cases commonly surprise users? | Role requirement table and one power-versus-energy example | Table | Energy FAQ; Core 2026.8.1 fixtures | Keep exact role facts out of paragraphs |
| What does the tool not inspect, prove, recommend, or guarantee? | Dynamic instance checks and `A matching result still needs Home Assistant` | Sentences | Implementation non-goals; Energy FAQ | Put each caveat beside the affected claim and avoid a generic warning panel |
| How are user inputs handled? | Local handling statement beside the form | Tool UI | Static architecture tests and implementation privacy contract | Do not imply that ordinary page requests or site analytics are absent |
| What should the reader verify next? | Final live-instance section and official links | Sentences | Energy FAQ and Developer Tools workflow | One short verification path, not a Home Assistant tutorial |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: `Home Assistant Energy Entity Eligibility Checker: find the failed picker rule` | What does this check and what answer will I get? | Name the intended-field check, copied attributes, separate statistics answer, local handling, and live-instance boundary | Sentences | `brief.md`; implementation product decision and non-goals | One paragraph; no role matrix or setup lesson | COPY-01 |
| 2 | Interactive entity checker | What should I provide? | Select the exact Energy field, then enter or paste current entity attributes | Tool UI | Implementation inputs and interaction contract | Keep visible labels primary; no helper-copy walkthrough | n/a |
| 3 | Dynamic Energy and statistics conclusions | Do these attributes match each contract? | Keep the two answers independent and mark the live checks as not inspected | Exact result visualization | Implementation R3; FF-003 and FF-017 | Do not merge the conclusions or call either one guaranteed eligibility | n/a |
| 4 | Scoped received-versus-accepted trace | Which exact rule changed the answer? | Show Both, Energy, or Statistics scope with received value, accepted values, and result | Exact result visualization | Implementation rule order; EC-004 and EC-006 | Do not narrate rows in later prose | n/a |
| 5 | H2: `Choose the Energy field before judging the sensor` | Why can the same entity be accepted in one picker and rejected in another? | Accumulated energy and optional power use different class, state-class, and unit contracts | Sentences | Energy overview and FAQ; implementation role matrix | Two short paragraphs; no conversion tutorial | COPY-02 |
| 6 | H3: `Each Energy field accepts a specific attribute combination` | What combination does each role expect? | Compare the nine visible roles by device class, state class, and unit family | Table | Core 2026.8.1 validator and frontend 20260729.6 | One compact table; group roles only when every repeated field is identical | n/a |
| 7 | H2: `Energy and statistics answer different questions` | How can an entity fail Energy while its statistics attributes still match? | Energy applies the selected role matrix; statistics applies its own sensor, numeric-state, and state-class boundary | Sentences | Core sensor recorder; implementation step 7; FF-017 | One power/measurement/W example; do not imply recorder health was checked | COPY-03 |
| 8 | Counter suitability beside total results | Does `total_increasing` fit the way this value moves? | Keep pass, fail, or unknown suitability separate from both attribute conclusions | Exact result visualization | Sensor developer docs; FF-013 to FF-016 | No universal `total_increasing` recommendation | n/a |
| 9 | H2: `A matching result still needs Home Assistant` | What remains unknown after the local rules match? | Verify Statistics issues, stored units, recorder inclusion, and live Energy validation in the user's instance | Sentences | Energy FAQ; implementation non-goals | One short next-step section; no repair or YAML instructions | COPY-04 |
| 10 | Instance-only boundary | Which checks were not performed? | List statistic metadata, stored units, and Energy validation as not checked | Table | Implementation instance-check contract | Do not repeat this list in COPY-04 word for word | n/a |
| 11 | Result provenance | Which rules produced this answer? | Show Core 2026.8.1, frontend 20260729.6, formula v1, and checked date | Exact result visualization | Pinned implementation contract | Keep metadata quiet; no timeless-rule claim | n/a |

No marker art, clean chart, screenshot, FAQ, methodology section, or generic YAML example is justified. The checker, independent conclusions, scoped trace, role table, and instance-boundary facts are the useful visuals.

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Intended Energy field | The role determines the accepted device class, state class, and unit family | Role choices and role requirement table | Core 2026.8.1 `energy/validate.py`; frontend 20260729.6 | State beside COPY-02 that a role mismatch does not automatically invalidate statistics |
| Shared prerequisites | Both conclusions require a `sensor` entity with a numeric current state | Scoped Both rows in the trace | Implementation steps 2 and 3 | Current numeric state does not prove usable history |
| Independent statistics contract | Statistics evaluates the sensor, numeric-state, and supported state-class boundary separately from the selected Energy role | Second conclusion and Statistics-scoped trace row | Core 2026.8.1 sensor `recorder.py`; FF-017 | Recorder inclusion, metadata, and historical unit stability remain unchecked |
| Counter suitability | `total_increasing` is for a positive total that can restart at zero, while `total` can increase or decrease | Dynamic counter result and COPY-03 adjacency | Sensor developer documentation | Suitability is separate from attribute compatibility and may remain unknown |
| Exact units | Energy units compare case and Unicode characters exactly | Received and accepted trace cells | Energy FAQ; FF-010 to FF-012 | A statistics match does not make an Energy unit valid |
| Version boundary | Results use frozen Core, frontend, formula, and source-date receipts | Result provenance | Implementation formula v1 | Do not imply automatic tracking of future Home Assistant releases |

## Metadata proposal

- Registry label: `energy entity checker`
- Meta title: `Home Assistant Energy Entity Eligibility Checker: find failed rules`
- Meta description: `Check an entity's Energy role, device class, state class, and unit against Home Assistant rules. Results stay local and still require recorder checks.`
- Page type: `WebApplication`
- Publication recommendation: `Keep unpublished until final prose, full page QA, explicit publication approval, and the central registry update are complete.`

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Out | `/privacy` | Explain the sitewide request and analytics boundary without weakening the tool-specific statement that evaluated attributes stay in the browser | `stack127 privacy policy` | Final live-instance section, only if privacy needs a second level of detail |
| In, deferred | Future published home-automation tools collection, no route exists yet | Let readers discover the checker from the correct collection after that collection is designed and published | `Home Assistant energy entity checker` | Collection listing, not page prose |

No existing stack127 guide directly continues this missing-entity task. Do not add an unrelated self-hosting or generic tools link merely to create an internal link.

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Word limit and shape | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | H1 introduction | Define the user, intended-field check, two bounded answers, local evaluation, and main live-instance limit | `brief.md`; implementation product decision, R3, and R11 | 65 words maximum in one paragraph | No best, only, guarantee, ranking, setup lesson, role list, or claim that ordinary page requests are local-only |
| COPY-02 | `Choose the Energy field before judging the sensor` | Explain why accumulated energy and optional power require different metadata | Home Assistant Energy overview and FAQ; implementation role matrix | 100 words maximum in two short paragraphs | No button instructions, generated YAML, Riemann-sum tutorial, or repetition of the role table |
| COPY-03 | `Energy and statistics answer different questions` | Explain the independent decision boundaries with one exact power/measurement/W example | Core 2026.8.1 Energy validator and sensor recorder; implementation step 7; FF-017 | 125 words maximum in two short paragraphs | No combined verdict, recorder guarantee, unit-history claim, or narration of every trace row |
| COPY-04 | `A matching result still needs Home Assistant` | Give the shortest honest verification path after local attributes match | Energy FAQ missing-entity workflow; implementation non-goals and instance checks | 100 words maximum in one paragraph plus at most three concise next checks | No repair instructions, database edits, YAML generation, picker guarantee, or repetition of the instance-boundary table |

### Voice and accuracy constraints

- Follow `stack127_docs/writing-style.md` and `stack127_docs/visual-first.md`.
- Write `stack127`, lowercase.
- Use no em dash or en dash.
- Do not invent facts, numbers, benefits, privacy claims, or implementation behavior.
- Do not repeat a result, table, trace, heading, or prior section.
- Call a local pass an attribute match, never proof that the entity will appear.
- Keep Energy and statistics conclusions independent in every sentence.
- Do not turn the page into an installation guide, repair guide, generic state-class reference, FAQ, or methodology article.
- Leave unresolved facts as explicit review notes, not plausible copy.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The user supplies them in a later content pass under `$stack127-tool-writing`.

## Source ledger

- Home Assistant Energy FAQ: https://www.home-assistant.io/docs/energy/faq/, checked 2026-08-09. Supports missing-entity attributes, exact exponent characters, sensor domain, Statistics repair surface, and the live-instance boundary.
- Home Assistant Energy overview: https://www.home-assistant.io/docs/energy/, checked 2026-08-09. Supports Energy roles and the difference between accumulated energy and optional power inputs.
- Home Assistant sensor developer documentation: https://developers.home-assistant.io/docs/core/entity/sensor/, checked 2026-08-09. Supports state classes, long-term-statistics semantics, and counter behavior.
- Home Assistant Data Science Portal statistics documentation: https://data.home-assistant.io/docs/statistics/, checked 2026-08-09. Supports measurement versus total aggregates and statistics metadata boundaries.
- Home Assistant Core 2026.8.1 Energy validator: https://github.com/home-assistant/core/blob/2026.8.1/homeassistant/components/energy/validate.py, checked 2026-08-09. Supports the pinned Energy role matrix and validation boundary.
- Home Assistant Core 2026.8.1 sensor recorder: https://github.com/home-assistant/core/blob/2026.8.1/homeassistant/components/sensor/recorder.py, checked 2026-08-09. Supports the independent statistics state-class contract.
- Home Assistant frontend 20260729.6 Energy configuration: https://github.com/home-assistant/frontend/tree/20260729.6/src/panels/config/energy, checked 2026-08-09. Supports visible Energy field roles and picker filters.
- Recent Home Assistant Community power-entity case: https://community.home-assistant.io/t/energy-dashboard-my-devices-power-entity-isnt-listed-as-an-option/1007080, checked 2026-08-09. Supports continuing demand for power versus energy attribute diagnosis.

## Open questions and blockers

- None. The route remains unpublished. Any change to the competitive, implementation, test, or brief artifact invalidates these fingerprints and requires this plan to be reviewed again.
