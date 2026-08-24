# Writing and SEO plan: Rebuild Window and Read-Error Exposure Calculator

Status: ready
Tool: Rebuild Window and Read-Error Exposure Calculator
Route: `/rebuild-calculator`
Depends on: `competitive-report.md`, `implementation-report.md`, `edge-cases-and-tests.md`, `brief.md`
Input fingerprint: `competitive-report.md sha256:9c0712973b389965bcc4e2fb5e003012cb929750a6ecf4ed1196ebfcea144be8`
Input fingerprint: `implementation-report.md sha256:28ae2ce7cece0f90d1ad070d7c656c96478693451a8535596a4c377e66e59a7a`
Input fingerprint: `edge-cases-and-tests.md sha256:e6fe06615bc359fcaf8ec50951a4bab2a757ed38535b15157433cd1e0575cb63`
Input fingerprint: `brief.md sha256:5ae282ce418fe895f8e8a108ac473d40be985d48180d294b42352f5e9b119810`
SERP checked: 2026-08-23
Search backend: web connector; individual Bing and DuckDuckGo engines unavailable
Visual verification backend: standalone Playwright CLI with Chromium 1.60.0; route preview unavailable without `.env.local`
Primary medium: Tool UI
Prose is the minority: yes
Static prose budget: 5 sections, 560 words maximum

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `RAID rebuild time calculator` | Estimate the copy time and total degraded window from a known layout, capacity, and effective throughput. | Calculator with answer-first time, source bytes, and delay breakdown. | H1, tool form, and result surface. |
| Close | `RAID rebuild URE probability calculator` | Estimate modeled read-error exposure for a specified URE rate and read scope. | Calculator with exact bytes and a labeled probability model. | Result metrics, exposure visual, and compact caveat. |
| Close | `RAID 5 vs RAID 6 rebuild risk` | Compare source-read work and modeled error tolerance without asking for a data-loss verdict. | Standard RAID selector with traceable source-drive count. | Layout choices, details table, and guide explanation. |
| Close | `what is the risk during RAID rebuild` | Understand what the degraded window and modeled exposure do and do not mean. | Short explanation after a working tool. | Supporting guide and next verification step. |

### Intent not targeted

- `RAID MTTDL calculator`, AFR, fleet reliability, or annual data-loss probability: these need a different reliability contract and belong in a separate page.
- Vendor drive recommendations, ZFS resilver prediction, SHR, Unraid, nested RAID, and mixed-drive planning: their implementation-specific behavior is outside this formula contract.

## Page promise

Estimate one simplified rebuild's degraded window, source bytes read, and modeled read-error exposure while seeing the assumptions that keep the result from becoming a data-loss guarantee.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | Short intro before the form | Sentences | Product report primary user and job; COPY-01 | Do not restate the title or result labels. |
| Which inputs, modes, units, sources, or scope choices matter? | Live form and input guide | Tool UI plus Table | Formula contract inputs and normalization | Do not narrate ordinary controls already labeled. |
| How should someone choose meaningful inputs and use it for the real task? | Input guide after the tool | Sentences | Product assumptions; COPY-02 | Explain effective throughput and read scope once. |
| How should the result and its uncertainty be interpreted? | Result metrics and interpretation guide | Exact result visualization plus Sentences | Formula contract and EC fixtures; COPY-03 | Do not repeat displayed numbers in prose. |
| Which concepts commonly surprise users? | RAID model table and caveat | Table plus Sentences | RAID 6 disagreement and primary RAID sources; COPY-04 | Keep source-drive rules in the table, not a comparison paragraph. |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | Limits section after interpretation | Sentences | Product non-goals and exclusions; COPY-04 | No MTTDL, AFR, or data-loss language beyond the boundary. |
| How are user inputs handled? | Privacy sentence after limits | Sentences | Engine and Browser privacy contract; COPY-05 | Say local and transient once. |
| What should the reader verify next? | Closing verification step | Sentences | Intel rebuild guidance and COPY-05 | Point to the live array, not another generic article. |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: Rebuild window and read-error exposure calculator | What can I estimate here? | The tool name and answer promise are immediately clear. | Tool UI | Implementation report and brief | Keep the h1 short; no keyword string. | n/a |
| 2 | Intro below H1 | What is this for? | Name the degraded-window job, key inputs, and main boundary in two or three sentences. | Sentences | Product decision; COPY-01 | Do not repeat result metrics or methodology. | COPY-01 |
| 3 | Calculator inputs | Which values do I control? | Show the four RAID choices and the bounded capacity, throughput, scope, URE, and delay controls. | Tool UI | Implementation report inputs and R2-R5 | Do not narrate ordinary button clicks. | n/a |
| 4 | Calculator form and default result | What answer do my inputs produce? | Enter a standard RAID scenario and see time, read work, exposure, and tolerance together. | Tool UI | Implementation report R1-R7 | The live tool owns all values and actions. | n/a |
| 5 | Degraded-window and exposure bars | How do time and read work relate? | Separate replacement delay, copy time, bytes read, and modeled probability visually. | Exact result visualization | Brief and implementation report | Do not explain the bar with a duplicated number list. | n/a |
| 6 | Exact calculation details | What assumptions produced this answer? | Show layout, member capacity, exact read bytes, URE denominator, scope, and formula version. | Table | Implementation report formula contract | Keep source-drive count in the result, not a prose table duplicate. | n/a |
| 7 | H2: Choose inputs that match the rebuild | Which values should I use? | Use effective rebuild throughput, decimal drive capacity, full-member scope by default, and a datasheet URE specification. | Sentences | Formula contract and primary sources; COPY-02 | Do not give universal speed defaults or drive advice. | COPY-02 |
| 8 | RAID source-read rules | Why do layouts read different amounts? | A compact table shows one source for mirrors, N - 1 for RAID 5, N - 2 minimum for RAID 6, and one mirror source for RAID 10. | Table | Intel and Fujitsu sources; implementation report | Include the RAID 6 caveat once; no broad RAID comparison. | n/a |
| 9 | H2: Read the result as exposure, not a verdict | What does the percentage mean? | The probability is a per-bit exposure model; tolerance and data loss are different concepts. | Sentences | Formula contract and test fixtures; COPY-03 | Do not call it rebuild success or data-loss probability. | COPY-03 |
| 10 | H2: What this model leaves out | What should I not infer? | Exclude second failures, AFR, MTTDL, controller behavior, filesystem behavior, and recommendations. | Sentences | Non-goals and exclusions; COPY-04 | Keep exclusions short and near the claim they limit. | COPY-04 |
| 11 | H2: Verify the live rebuild next | What do I check in my system? | Compare the effective throughput and actual rebuild scope with the controller or filesystem status. | Sentences | Intel degraded-array guidance; COPY-05 | End with a concrete verification step and local privacy note. | COPY-05 |

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Rebuild window | Read work divided by effective throughput, plus replacement delay. | Short sentence beside the result visual. | Product formula contract; Intel degraded-array guidance. | Say throughput is an input, not a drive-interface rating. |
| Source bytes | One failed member uses the layout's minimum reconstruction source count multiplied by member capacity and scope. | Exact details table and RAID source-read table. | Intel RAID guide and Fujitsu whitepaper. | Label RAID 6 as `N - 2` minimum and say real implementations may read more. |
| Read-error exposure | `1 - exp(-bits read / rated bits)` modeled as at least one specified read error. | Exact percentage in the result and one sentence in COPY-03. | Derivation in implementation report; Seagate and WD specifications. | Never label it data loss, rebuild failure, or a guarantee. |

## Metadata proposal

- Registry label: `rebuild calculator`
- Meta title: `RAID rebuild window and read-error exposure calculator`
- Meta description: `Estimate a RAID rebuild window, source bytes read, and modeled URE exposure from your array inputs. See the assumptions and limits behind the result.`
- Page type: `WebApplication`
- Publication recommendation: `Ready to publish with the eight-tool storage batch. The migration is committed but not applied, so the route is not live yet.`

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Out | `/raid-calculator` | Continue from rebuild exposure to theoretical capacity and layout grouping. | `RAID capacity calculator` | Closing next-step sentence. |
| Out | `/zfs-capacity-calculator` | Move to ZFS-specific capacity planning when the user is not modeling standard RAID. | `ZFS capacity calculator` | Limits or next-step sentence. |
| Out | `/storage-tools` | Browse adjacent storage calculations after answering the rebuild question. | `storage tools` | One restrained closing link. |

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Word limit and shape | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | Intro below the title | Identify the user and the two-part answer. | Rebuild window, source bytes, modeled URE exposure, local formula; product report and brief. | 70 words maximum; one short paragraph. | Do not repeat h1, defaults, or a data-loss promise. |
| COPY-02 | Choose inputs that match the rebuild | Explain effective speed, decimal capacity, URE specification, and read scope. | Inputs and normalization; Seagate and WD datasheets; full-member default. | 120 words maximum; two short paragraphs. | No universal speed, vendor ranking, or controller-specific claim. |
| COPY-03 | Read the result as exposure, not a verdict | Explain copy time, degraded window, source bytes, probability, and tolerance. | Formula contract, FF-001 through FF-006, Intel RAID guide. | 130 words maximum; two short paragraphs. | Never call output data-loss probability, rebuild-success probability, or a recommendation. |
| COPY-04 | What this model leaves out | Set the model boundary beside the result. | No second failure, AFR, MTTDL, fleet correlation, filesystem behavior, or controller guarantee; product non-goals. | 110 words maximum; one compact paragraph and one short list if needed. | Do not repeat the formula or create an oversized warning box. |
| COPY-05 | Verify the live rebuild next | Give a concrete next action and scoped privacy statement. | Compare effective throughput and actual rebuild scope with controller or filesystem status; local transient inputs. | 130 words maximum; two short paragraphs with two internal links. | Do not imply the page observed the user's array or sent input to a server. |

### Voice and accuracy constraints

- Follow `stack127_docs/writing-style.md` and `stack127_docs/visual-first.md`.
- Write `stack127`, lowercase.
- Use no em dash or en dash.
- Do not invent facts, numbers, benefits, privacy claims, or implementation behavior.
- Do not repeat a result, table, visual, heading, or prior section.
- Leave unresolved facts as explicit review notes, not plausible copy.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The later writer owns the server-rendered intro and guide after the technical tool is stable.

## Source ledger

- Seagate IronWolf product manual: https://www.seagate.com/www-content/product-content/ironwolf/en-us/docs/100818527d.pdf, checked 2026-08-23. Supports a nonrecoverable read-error specification per bits read.
- WD Red Plus data sheet: https://documents.westerndigital.com/content/dam/doc-library/th_th/assets/public/western-digital/product/internal-drives/wd-red-plus-hdd/data-sheet-western-digital-wd-red-plus-hdd.pdf, checked 2026-08-23. Provides a second vendor URE specification example.
- Intel RAID Software User Guide: https://cdrdv2-public.intel.com/840787/SWUG_full_featured_entry_RAID.pdf, checked 2026-08-23. Supports RAID 6 double parity and its tolerance boundary.
- Intel RSTe degraded-array guidance: https://www.intel.com/content/www/us/en/support/articles/000024286/server-products/server-boards.html, checked 2026-08-23. Supports degraded state and replacement-triggered rebuild behavior.
- Fujitsu RAID Protection whitepaper: https://www.fujitsu.com/us/imagesgig5/Storage-RAID-Fast-Recovery-whitepaper.pdf, checked 2026-08-23. Supports parity reconstruction and mirror rebuild distinctions.
- Search and competitor evidence: `content_docs/rebuild-calculator/competitive-report.md`, checked 2026-08-23 with the web connector and standalone Playwright CLI. Supports current query shapes and result expectations, not primary technical authority.

## Open questions and blockers

- Content plan and integration browser verification are ready. The managed-development preview was removed after QA, no production data was used, and the committed publication migration remains unapplied until release.
