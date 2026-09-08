# Tool content refresh, September 6, 2026

## Scope

Reviewed the supporting copy of all 34 published tools in the development database. Updated 27 guides or introductions, corrected eight search descriptions and one search title, and fixed the shared supporting-table layout. These changes are not deployed or applied to production.

The interactive engines, input contracts, public routes, publication flags, canonical rules, and repository synchronization records remain unchanged. Domain Expiry has one result-message correction: a disagreement between dates now asks the reader to confirm the renewal deadline with the registrar. It no longer says the registry expiry date governs deletion.

The shared writing-voice, tool-writing, visual-first-content, and test-driven-page skills guided this pass. Page briefs now record the current reader flow and supersede old prose quotas. Ownership manifests reference the writing skills. The database remains the only live copy of tool prose.

## Editorial changes

| Pages | Main correction |
| --- | --- |
| Domain Expiry | Separate expiry, renewal, deletion, and release. Remove a fixed release prediction and outdated interface instructions. |
| Domain Lookup | Describe the public RDAP record, not complete WHOIS history or an unlimited service. Explain missing data and caching. |
| Domain Availability, Multi-TLD Availability | Distinguish no registration record from a name that can actually be purchased. Keep unknown coverage visible. |
| Domain Owner, Domain Registrar | Separate registrant, registrar, registry, reseller, privacy, and proxy roles. Do not promise hidden contacts or successful delivery. |
| Domain Report | Explain mismatches without presenting a safety grade or claiming requests are never stored. |
| Domain Age | Clarify that the fetched response may be cached. Keep the approved detailed guide. |
| Transfer Readiness | Describe public evidence and the implemented waiting-period model without promising approval or an exact unlock date. |
| Punycode Converter | Separate encoding, valid domain names, and impersonation risk. Remove false assurances about lookalike domains. |
| DNS Change Checker, DNS Trace, SOA Checker | Explain source differences, valid empty answers, and what serial agreement cannot prove. Add useful next checks. |
| CAA, DNSSEC, Nameserver checkers | Correct empty-issuer authorization, signature expiry, and the limits of matching nameserver lists. |
| Ceph, SHR, Unraid | Add useful capacity examples and explain failure groups, parity limits, and fresh-plan assumptions. |
| Storage Growth, Storage Layout Advisor | Explain reserve, cost assumptions, candidate ranking, and failure placement without treating a plan as a measured system. |
| SnapRAID and mergerfs | Explain synchronization boundaries and the different jobs of parity, content metadata, and pooled paths. |
| Rebuild Calculator, Drive Reliability | Explain aggregate source reads, modeled read errors, cohort evidence, and why a rate is not an individual drive prediction. |
| Home Assistant Energy Entity Checker | Connect the entered attributes to eligibility and the checks still required in the real instance. |
| ZFS Capacity, RAID Capacity | Explain group boundaries, allocation assumptions, special devices, backup limits, and actual sharing behavior. |

DNS Lookup, Dockerignore Tester, NGINX proxy_pass, NFS Firewall Rules, RAIDZ Expansion, ZFS Padding, and Shortcuts Cheat Sheet Generator did not need a forced rewrite. They remain in the page-wide layout and link checks.

Search descriptions were corrected for Domain Age, Domain Availability, Domain Expiry, Domain Lookup, Domain Owner, Multi-TLD Availability, Punycode Converter, and Transfer Readiness. Domain Lookup's search title now names RDAP without claiming a separate WHOIS search.

## Sources and examples

Reviewed technical claims against existing engines and fixtures, with primary documentation from ICANN, IETF, Google Public DNS, OpenZFS, Ceph, Synology, Unraid, SnapRAID, mergerfs, Home Assistant, Backblaze, Intel, and CISA where relevant. Source links sit beside the claims they support in the database copy.

Examples include Ceph replica and erasure-code ratios, mixed 4 TB and 8 TB SHR tiers, Unraid's largest-drive parity constraint, compounded storage growth, and a rebuild estimate based on aggregate read throughput. Examples explain the existing calculation; they do not introduce new formulas.

The link check found an obsolete CISA destination and a Fujitsu PDF URL that redirects away from the document. Replaced the CISA link and removed the redundant Fujitsu citation. The versioned mergerfs QuickStart and Intel PDF each failed a direct fetch, then returned HTTP 200 on retry. All 58 retained external source destinations were reachable during the check.

## Development revisions

All 27 content updates went through the reviewed content command with a dry run before applying. Domain Age moves from content revision 5 to 6. Rebuild Calculator, Storage Growth Planner, and Storage Layout Advisor move from 1 to 3, including final link or punctuation corrections. The other 23 edited tools move from 1 to 2.

Domain Expiry's result-message patch is tracked separately as tool version 1.1.2. Other tool versions are preserved. SEO-only corrections change registry metadata and its deliberate update date, not content revisions or tool versions. No publication flag or first-publication date changes.

## Verification

- Compared all 34 development tool rows against the pre-edit snapshot and reviewed drafts. Verified all content revisions, eight metadata corrections, the Domain Expiry patch version, and preservation of the seven unchanged guides.
- Standalone Playwright checked 1440px and 390px layouts in dark and light themes: 136 views across 34 tools. No page overflow or browser exceptions remained. Supporting tables fit the desktop reading column; wide mobile comparisons retain their own keyboard-accessible scroll region.
- Checked all 28 distinct internal guide links. Each returned HTTP 200.
- Reviewed populated Domain Expiry, Ceph, and SHR results at both widths in both themes. Domain Expiry's raw response was expanded. Result values and page bounds remained intact.
- The CAA responsive test originally combined eight layouts and sixteen navigations under one timeout. Split it into independent viewport/theme cases, removed redundant reloads, and preserved the assertions. All 16 resulting CAA layout cases passed. The 28-test run that included those cases and the first six mobile-table checks passed.
- Added 22 table regression cases across desktop and mobile projects for wrapping, code identifiers, containment, focus, and actual keyboard scrolling. The last combined run passed 21; the remaining ZFS Padding sizing failure was corrected and both of its project cases passed on rerun. Long status-code tables keep a readable explanation column instead of shrinking it to a few characters.
- Type checking and static policy passed, including 289 route source files. Scoped diff whitespace checks passed.
- Fixed the missing Punycode script-index entry exposed by the repository tests. Its existing Unicode-name refresh script is now indexed; no refresh or data change was run.

- The final `npm run quality` reached 858 unit tests: 844 passed and 14 failed. All tool unit tests passed. The failures concern CLI icons and hardware-directory assets or review data outside this change. The earlier Dockerignore performance failure under concurrent browser load did not recur in this isolated run.
- The development registry check also remains blocked by published directory and keyboard-shortcut rows outside the current published-manifest set. No tool slug, publication flag, or indexing rule was changed to make that check pass.
- The initial 808-case browser run was interrupted under concurrent build load. It is not a full-suite pass. Changed-page, CAA, shared-table, content, link, and representative-result checks were run separately as described above.

- The isolated production-mode build passed with `NODE_OPTIONS=--max-old-space-size=6144 STACK127_TEST_DIST_DIR=.next-content-review npm run build -- --webpack`. Compilation, TypeScript, page generation, and build tracing completed. Removed only the temporary TypeScript include paths added by this build and restored the prior generated route-type import.

The content update is ready for development review, not a production release. No production write, deployment, commit, or push was performed. The working tree contains unrelated existing changes; they were preserved.

Evidence and reviewed temporary drafts are in `/tmp/stack127-tool-content-vWqX7E`. The initial read-only audit is in `/tmp/stack127-tool-review-fKqjKW`. Temporary files are evidence for this development pass, not another durable source of live copy.
