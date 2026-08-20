# Competitive report: `.dockerignore` Pattern Tester

Status: ready
Tool: `.dockerignore` Pattern Tester
Route: `/dockerignore-tester`
Researched: 2026-08-07
Direct competitors reviewed: 6
Saturation exception: yes

Six comparison surfaces were operated in total: **only 2 are materially direct Docker-specific tools; 4 are adjacent glob tools used as dialect and interaction benchmarks**. The repository pipeline's reviewed-competitor count includes all operated comparison surfaces; it must not be read as six Docker-semantic competitors.

## Research scope

### Current stack127 state

[Observed] The flat route is locked and unpublished. At intake there was an idea entry, but no route, engine, ownership manifest, or tool tests. This passes the surface rule because the answer is computed from universal user-provided rules and paths; it needs no curated coverage and makes no safety guarantee.

### Method and coverage

[Observed] Six comparison surfaces were operated at 1280×720 with mixed paths, nested directories, exclusions, and negation: two direct Docker-specific tools and four adjacent generic glob tools. The two direct tools and five of the six total surfaces were also checked at 390px. A seventh adjacent validator informed failure-state analysis but is not counted. [Documented] Docker build-context documentation, `moby/patternmatcher`, and the BuildKit v0.29.0 filesystem filter are the technical authorities. [Observed] A real isolated Docker build was added after the first research pass to correct a stale parent-directory assumption.

### Search saturation evidence

- Queries tried: `.dockerignore pattern tester`, `how to test dockerignore file`, `dockerignore negate pattern not working`, `dockerignore pattern syntax checker`.
- Repeated domains: Docker documentation, Stack Overflow, GitHub/gists, CloudOps Toolkit, generic glob testers, and generator sites recurred.
- Exclusions: documentation, shell scripts, gists, generators without path evaluation, and validators without match results are not direct testers. After two Docker-specific tools, results repeated those shapes; four adjacent tools were operated to expose dialect differences.

## Search intent

| Intent | Example query | Need now | Current shape |
| --- | --- | --- | --- |
| Test rules | `.dockerignore pattern tester` | Included/excluded verdict | 2 direct tools; generic testers |
| Debug | `how to test dockerignore file` | Reproduce Docker locally | Q&A, scripts |
| Explain | `dockerignore negate pattern not working` | Winning line and ordering | Docs/Q&A |
| Validate | `dockerignore pattern syntax checker` | Find misleading rules | Validator/generators |

## User pain evidence

| Repeated problem | Evidence | Signal | Product implication |
| --- | --- | --- | --- |
| No obvious way to test without a build | https://stackoverflow.com/questions/38946683/how-to-test-dockerignore-file | Repeated answers | Evaluate pasted paths locally |
| Negation/order is misunderstood | https://stackoverflow.com/questions/tagged/dockerignore | Recurring tagged questions | Show every match and winning line |
| Matcher edge cases require upstream clarification | https://github.com/moby/patternmatcher/issues | Active issue surface | Version-anchor behavior and fixtures |

## Technical truth to verify

| Claim | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| Context-root `.dockerignore` removes files before transfer | https://docs.docker.com/build/concepts/context/#dockerignore-files | Documented | A Dockerfile-specific ignore file takes precedence |
| Patterns use Go `filepath.Match` plus Docker `**` and cleanup | https://docs.docker.com/build/concepts/context/#syntax | Documented | `.` is historically ignored; slashes are normalized |
| Last matching rule decides; `!` re-includes | https://docs.docker.com/build/concepts/context/#negating-matches | Documented | Order must remain visible |
| Parent-match state is carried per pattern during filesystem traversal | https://github.com/moby/patternmatcher/blob/main/patternmatcher.go#L343-L392 | Documented | It is useful trace evidence, not a separate final verdict |
| BuildKit keeps walking an excluded directory when a later exception can match below it | https://github.com/moby/buildkit/blob/v0.29.0/vendor/github.com/tonistiigi/fsutil/filter.go | Documented | An exact exception such as `!docs/README.md` prevents `docs` from being pruned |
| Exact implementation behavior is upstream code/fixtures | https://github.com/moby/patternmatcher | Documented | Do not substitute minimatch/picomatch |

### Current Docker build discovery

[Observed] On 2026-08-07, an isolated Linux/arm64 build using Docker Engine 29.4.0 (`daa0cb7f`), BuildKit v0.29.0, and Buildx v0.33.0 (`f7897eba`) succeeded with exit status 0. The context contained `.dockerignore` with `docs` then `!docs/README.md`, a Dockerfile with `FROM scratch` then `COPY docs/README.md /README.md`, and `docs/README.md`. BuildKit transferred the context and completed the `COPY`. This directly disproves an `Excluded by parent` classification for that case. The first rule's inherited match remains useful in an ordered trace, but the final user-facing verdict is `Included` because the later exception matches the file.

## Competitor reviews

### Competitor 1: CloudOps Toolkit `.dockerignore` Pattern Tester

- URL: https://www.cloudopstoolkit.com/dockerignore-pattern-tester
- Accessed: 2026-08-07; fully accessible.
- [Observed] Patterns and paths are separated by `---`; Test is explicit. [Observed] Results show sent/excluded, winning pattern, summary, findings, copy/report/download, and examples. [Documented] Processing is local-only. [Documented] The site admits possible divergence for unusual character classes/escaping. [Observed] Mixed negation worked and the layout reflowed at 390px. [Unknown] Keyboard semantics beyond native controls were not audited.
- What works: quickest complete Docker-specific answer. What fails: admitted semantic gap weakens trust. Do not copy: report-heavy hierarchy.

```text
[H1 + example]
[patterns --- paths]
[Test]
[summary] [findings]
[path verdict + winning rule...]
[copy | report | download]
```

### Competitor 2: FreeToGenerate Dockerignore Generator/Checker

- URL: https://freetogenerate.com/dockerignore-generator
- Accessed: 2026-08-07; fully accessible.
- [Observed] Live rules plus one path produce a verdict, deciding line, and normalized form. [Observed] Presets and `.gitignore` comparison support generation. [Observed] A root-only `node_modules` probe returned immediately. [Documented] Processing is local-only. [Observed] It reflowed at 390px. [Unknown] Upstream Docker fixture parity is not disclosed.
- What works: clear one-path explanation. What fails: one path cannot diagnose a tree. Do not copy: generator-first scope.

```text
[H1 + presets]
[rules editor]
[single path]
[live verdict]
[deciding line + normalized pattern]
```

### Competitor 3: Flavio Copes Glob Tester (adjacent dialect benchmark)

- URL: https://flaviocopes.com/tools/glob-tester/
- Accessed: 2026-08-07; fully accessible.
- [Observed] Generic and `.gitignore` modes accept multiple patterns/paths. [Observed] Live counts and deciding labels are compact. [Observed] State is encoded in the URL. [Inferred] Results follow minimatch/Git behavior, not Docker. [Observed] Braces/directory cases diverged from Docker expectations. [Observed] It reflowed at 390px.
- What works: shareable multi-path debugging. What fails: dialect ambiguity. Do not copy: `.gitignore` as a Docker proxy.

```text
[mode]
[patterns] [paths]
[match counts]
[path + deciding label...]
[shareable URL]
```

### Competitor 4: Globster (adjacent dialect benchmark)

- URL: https://globster.xyz/
- Accessed: 2026-08-07; fully accessible.
- [Observed] One pattern highlights a visual file tree live. [Observed] Examples and sharing aid discovery. [Observed] There is no ordered-rule trace, negation explanation, or textual verdict. [Inferred] It is generic glob behavior, not Docker. [Observed] The Apply control is a focusable `span`. [Observed] It remained usable at 390px.
- What works: spatial comprehension. What fails: weak semantics/accessibility. Do not copy: tree-only answers.

```text
[pattern] [Apply]
[examples | share]
[visual directory tree]
[matched nodes highlighted]
```

### Competitor 5: DigitalOcean Glob Tool (adjacent dialect benchmark)

- URL: https://www.digitalocean.com/community/tools/glob
- Accessed: 2026-08-07; fully accessible.
- [Observed] Controls cover dotfiles, comments, filter mode, tree/NPM input, URL state, extglob, and braces. [Observed] Results appear as a match tree. [Inferred] Its dialect is not Docker. [Observed] Advanced controls increase first-screen load. [Observed] At 390px the body retained roughly 925px scroll width. [Unknown] Docker ordering behavior is not offered.
- What works: broad glob exploration. What fails: horizontal overflow and irrelevant syntax. Do not copy: option density.

```text
[glob input + options row........]
[tree/NPM data...................]
[match tree......................]
<--- horizontal overflow --->
```

### Competitor 6: RapidToolSet Glob Pattern Tester (adjacent dialect benchmark)

- URL: https://rapidtoolset.com/en/tool/glob-pattern-tester
- Accessed: 2026-08-07; fully accessible.
- [Observed] Pattern plus multiple paths yields a result table. [Observed] Case and dotfile options are exposed. [Observed] Export and privacy messaging are visible. [Inferred] Picomatch powers generic matching. [Observed] Brace/negation behavior is not Docker behavior. [Observed] It reflowed at 390px.
- What works: useful result table/export. What fails: generic options suggest false compatibility. Do not copy: dialect-free verdicts.

```text
[pattern]
[case] [dotfiles]
[paths]
[results table]
[export] [privacy]
```

## Comparison matrix

| Capability | CloudOps | FreeToGenerate | Flavio | Globster | DO | Rapid | Value |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Docker-specific | Yes | Yes | No | No | No | No | High |
| Multiple paths | Yes | No | Yes | Tree | Tree | Yes | High |
| Winning rule | Yes | Yes | Label | No | No | No | High |
| Ordered negation | Yes | Yes | Git mode | No | No | No | High |
| Share/export | Export | No | URL | Share | URL | Export | Medium |
| 390px usable | Yes | Yes | Yes | Yes | No | Yes | High |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| Matcher dialect | Docker vs minimatch/Git/picomatch | `moby/patternmatcher` | No: Docker only |
| Classes/escaping | CloudOps admits divergence | Upstream fixtures | Yes: implementation mechanism |
| Braces/extglob | Generic tools expose them | Docker syntax docs | No: do not imply support |
| Parent-directory re-inclusion | Older reports and generic ignore-file assumptions can imply that an excluded parent always blocks a child exception | Current Docker docs, `patternmatcher`, BuildKit v0.29.0 filter, and the successful Engine 29.4.0 build above | No: `docs` plus `!docs/README.md` includes the file; parent matches belong in the trace, not an `Excluded by parent` verdict |

## Evidence-backed opportunities

1. **Canonical trace, not another checker:** show every matching line, inherited parent-match context, the final rule, and the normalized path, verified against upstream fixtures and current BuildKit behavior.
2. **Batch diagnosis without uploads:** accept a pasted tree, keep processing local, and make the result usable at narrow widths.
3. **Precedence mode:** explain context-root versus Dockerfile-specific ignore-file precedence.

The broad “no Docker tester exists” opening is closed. The remaining opening is narrow but still credible: publish a fixture- and build-verified Docker matcher with a complete ordered trace and source-precedence explanation. That is more technically auditable than CloudOps' admitted edge-case divergence and more useful for many paths than FreeToGenerate's one-path checker. Parent blocking is not a differentiator and must not be presented as one.

## Table stakes

- Local-only evaluation, examples, explicit Test, included/excluded counts, winning line, reset/copy, keyboard labels, and responsive results.

## Ideas to reject

- Home-grown glob-to-regex: too easy to misstate Docker.
- Generator/preset library: dilutes the debugging job.
- File upload or repository scan: unnecessary privacy risk.
- Generic extglob/braces toggles: unsupported dialect clutter.
- “Safe” verdict: inclusion does not prove a build is safe.

## Open questions and blockers

- Product planning must choose a fixture-verifiable implementation path and prove unusual character classes, escaping, Windows separators, negation, and inherited parent-match tracing without inventing a parent-blocker verdict. If it cannot, stop the tool. No research blocker remains.

## Sources

- Docker build context and `.dockerignore`: https://docs.docker.com/build/concepts/context/#dockerignore-files, accessed 2026-08-07. [Documented]
- Moby patternmatcher: https://github.com/moby/patternmatcher, accessed 2026-08-07. [Documented]
- Moby patternmatcher parent-result implementation: https://github.com/moby/patternmatcher/blob/main/patternmatcher.go#L343-L392, accessed 2026-08-07. [Documented]
- BuildKit v0.29.0 filesystem filter: https://github.com/moby/buildkit/blob/v0.29.0/vendor/github.com/tonistiigi/fsutil/filter.go, accessed 2026-08-07. [Documented]
- Isolated Docker build discovery: Docker Engine 29.4.0, BuildKit v0.29.0, and Buildx v0.33.0 on 2026-08-07; exact context and successful `COPY` are recorded above. [Observed]
- Six operated competitor URLs above, accessed 2026-08-07. [Observed]
- Stack Overflow testing question: https://stackoverflow.com/questions/38946683/how-to-test-dockerignore-file, accessed 2026-08-07. [Observed demand]
