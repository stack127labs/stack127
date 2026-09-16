# Competitive report: Docker Compose checker

Status: ready
Tool: Docker Compose checker
Route: `/docker-compose-checker`
Researched: 2026-09-10
Direct competitors reviewed: 10
Saturation exception: no

## Research scope

### Current Stack127 state

[Observed] `/docker-compose-checker` does not currently have a route, tool engine, ownership manifest, test contract, brief, or publication record in this repository. The repository does have Docker Compose examples in the self-hosting course and Compose URLs in self-host app data workflows, but no route-specific checker implementation was found.

[Inferred] The requested surface is a flat, unpublished Stack127 tool for homelab and developer users who have a Compose file and want to know what will fail before they run `docker compose up`.

### Method and coverage

I used the web search connector for discovery and official-source verification. SearXNG was not configured in the environment, so this report does not claim Bing or DuckDuckGo-specific coverage. I used standalone Playwright CLI for live page operation because the Codex in-app Browser runtime reported `No browser is available`. The first Playwright launch hit the documented sandbox OS permission error; the approved read-only run outside the sandbox loaded the public tools below.

- Search backend: web search connector
- Search engines: not individually available
- Visual backend: standalone Playwright CLI, headless Chromium
- Accessed: 2026-09-10, Asia/Kolkata
- Main viewport: 1280 x 900
- Mobile probe: 375 x 812 on the web tools
- Probes: default/sample state, valid structural Compose text with missing dependency, undeclared named volume, and duplicate host port, plus malformed YAML with an unclosed flow sequence
- Limitations: no account creation, file upload, Docker daemon, registry access, external image pull, local filesystem, or runtime launch was attempted. Spoold's editor was not exposed as a textarea or contenteditable in the probe, so custom replacement input was not verified there. YAML Config Validator Pro kept its sample state during the replacement probe, so only its visible live surface was verified, not its custom Compose diagnostics. The interrupted long-running probe means no claim is made about any later pages beyond the completed observations recorded here.

### Search saturation evidence

- Queries tried: `Docker Compose checker validator online`; `validate docker compose file before docker compose up`; `Docker Compose Specification schema unknown keys interpolation profiles includes extends validation`; `docker compose config error unknown fields environment variables profiles depends_on`; `online Docker Compose validator paste YAML checker`; `Docker Compose linter online YAML validator compose file`; `GitHub Docker Compose lint action compose-spec schema validator`; `docker compose checker browser local no signup`; plus community variants for `depends_on`, `.env`, interpolation, and Compose version errors.
- Repeated domains: Docker Docs and the Compose Specification repository dominated technical results. GitHub, Stack Overflow, Reddit, generic YAML validator sites, and several small developer-tool sites repeated in the competitive results.
- Exclusions: Docker Docs and the Compose Specification are technical authorities, not competitors. Hadolint was excluded from the direct count because it lints Dockerfiles, although its open issue requesting Compose lint support is useful demand evidence. Generic YAML validators and Compose editors were kept as adjacent surfaces when they cover the same paste-and-diagnose job without implementing Compose semantics.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Exact checker | `docker compose checker` | A quick answer for whether pasted YAML is acceptable | Small paste-in validators, generic YAML tools, and SEO pages |
| Syntax recovery | `docker compose yaml validator line error` | The exact line and a correction for indentation, quoting, or flow syntax | YAML parsers and formatters |
| Preflight before start | `validate docker compose before up` | Cross-reference and port mistakes before touching Docker | A few browser validators, mostly CLI docs |
| Version confusion | `docker compose version 2 vs 3 depends_on condition` | Whether old `version:` changes the allowed syntax | Docker docs, Stack Overflow answers, stale tutorials |
| Environment resolution | `docker compose variable not set interpolation` | Which value Compose will use and why `.env` or `env_file` did not behave as expected | Docker docs, GitHub issues, forum answers |
| Self-host safety check | `docker compose hardcoded password privileged host port` | A review of obvious risky settings before deploying a homelab app | Security-focused local linters and one reported browser auditor |
| Multi-file model | `docker compose include extends override validate` | What the merged project looks like across files, profiles, and includes | Official CLI, local linters, editor tooling |
| CI enforcement | `docker compose lint github action` | Stable rule codes, severity, and a non-zero CI result | GitHub Actions, DCLint, compose-lint |

[Inferred] The strongest browser intent is not "is this YAML valid?" It is "what will Docker Compose complain about next, and where do I fix it?" Search results still split that job between YAML syntax, `docker compose config`, and security or style linters.

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| `depends_on` syntax changes are confused with YAML errors and Compose versions | [Stack Overflow question on `depends_on` conditions](https://stackoverflow.com/questions/71060072/docker-compose-depends-on-with-condition-invalid-type-should-be-an-array/72520034), accessed 2026-09-10 | Repeated answers and version-specific edits | Explain current Compose Specification behavior and label legacy advice as legacy. |
| Users confuse interpolation variables with container environment variables | [Docker Compose issue 11538](https://github.com/docker/compose/issues/11538) and [issue 9443](https://github.com/docker/compose/issues/9443), accessed 2026-09-10 | Repeated issue history and comments | Show `${VAR}` interpolation separately from `environment:` and `env_file:`. |
| Missing variables produce warnings, blank values, and invalid image or port strings | [Docker Compose interpolation issue 7423](https://github.com/docker/compose/issues/7423) and [Docker interpolation docs](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/), accessed 2026-09-10 | Long-lived recurring issue pattern | Report unresolved, defaulted, and required variables with the exact operator. |
| `.env` location and precedence are hard to predict | [Docker Compose issue 8254](https://github.com/docker/compose/issues/8254), accessed 2026-09-10 | Repeated comments around project directory and `COMPOSE_FILE` | Ask for optional environment text and show the chosen precedence model. |
| Boolean interpolation and typed fields can fail after substitution | [Docker Compose issue 13340](https://github.com/docker/compose/issues/13340), accessed 2026-09-10 | Recent issue with a concrete typed-field failure | Keep unresolved interpolation visibly typed as unresolved; do not silently coerce every string. |
| Health checks are mistaken for a general readiness guarantee | [Stack Overflow healthcheck discussion](https://stackoverflow.com/questions/59062517/docker-compose-healthcheck-does-not-work-in-a-way-it-is-expected-for-making-cont/59062794), accessed 2026-09-10 | Repeated operational question | Explain that a checker can inspect declarations, not prove an application is ready. |
| Users want browser-local checking but distrust pasting secrets into third-party tools | [Reddit discussion of a browser Compose auditor](https://www.reddit.com/r/docker/comments/1rvsom1/free_browserbased-docker-compose-auditor-flags/), accessed 2026-09-10 | Discussion includes explicit privacy concern | Make local processing a visible, testable product property and never send the file by default. |
| Compose linting is still missing from familiar Dockerfile linting workflows | [Hadolint issue requesting Compose support](https://github.com/hadolint/hadolint/issues/1091), accessed 2026-09-10 | Open request, smaller signal | A focused Compose checker can sit beside existing Dockerfile tooling without pretending to replace CI. |

Community sources establish repeated confusion and demand only. Docker's documentation and Compose Specification below establish technical truth.

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| The Compose Specification is the current recommended format; legacy 2.x and 3.x were merged into it | [Docker Compose file reference](https://docs.docker.com/reference/compose-file/), accessed 2026-09-10 | Documented | The browser tool should not offer a fake `version: 2` versus `version: 3` mode as if those were current schemas. |
| Top-level `version` is obsolete, informative, and does not select a schema | [Compose Specification, version and name](https://compose-spec.github.io/compose-spec/spec.html#version-and-name-top-level-elements), accessed 2026-09-10 | Documented | A report can warn that it is obsolete, but should not call a current file invalid only because it contains `version`. |
| `docker compose config` parses, merges, resolves variables, and renders the canonical model | [Docker `docker compose config` reference](https://docs.docker.com/reference/cli/docker/compose/config/), accessed 2026-09-10 | Documented | This is the reference behavior a browser-local checker can explain and partially emulate. `-q` validates without printing. |
| Compose supports `${VAR}`, `$VAR`, defaults, required values, alternatives, nesting, and `$$` escaping | [Docker interpolation reference](https://docs.docker.com/reference/compose-file/interpolation/) and [Docker interpolation guide](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/), accessed 2026-09-10 | Documented | Interpolation applies to YAML values, not ordinary mapping keys, and occurs per file before merge. |
| Shell values take precedence over `--env-file`, then project `.env` when no explicit env file is given | [Docker interpolation guide](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/), accessed 2026-09-10 | Documented | `env_file` under a service supplies container environment values. It is not the same as the CLI `--env-file` used for interpolation. |
| Missing variables may warn and become empty strings unless a required/default operator changes the result | [Docker interpolation guide](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/), accessed 2026-09-10 | Documented | A browser checker can identify the token and likely result, but cannot know the real shell or `.env` values unless the user supplies them. |
| Unknown fields usually warn, and loose mode can ignore unknown fields | [Compose Specification](https://compose-spec.github.io/compose-spec/spec.html#version-and-name-top-level-elements), accessed 2026-09-10 | Documented | The report should separate unknown-key warnings from schema errors and preserve `x-` extension fields. |
| `profiles` selectively activates services; unprofiled services are always enabled | [Docker profiles guide](https://docs.docker.com/compose/how-tos/profiles/), accessed 2026-09-10 | Documented | A checker can show profile membership and dependency reachability for a selected profile set. It cannot know which profiles the user will pass unless asked. |
| `include` loads Compose sub-projects recursively, with paths and interpolation context tied to the included project | [Docker include reference](https://docs.docker.com/reference/compose-file/include/) and [Compose Specification include](https://compose-spec.github.io/compose-spec/spec.html#include), accessed 2026-09-10 | Documented | A single pasted file cannot resolve includes. It can flag that the result is incomplete and name the referenced path. |
| `extends` reuses a service from another file and merges service configuration | [Compose Specification extends](https://compose-spec.github.io/compose-spec/spec.html#extends), accessed 2026-09-10 | Documented | Cross-file resolution needs the referenced files and project directory. |
| `depends_on` names services and can use conditions such as `service_started`, `service_healthy`, and `service_completed_successfully` | [Docker services reference](https://docs.docker.com/reference/compose-file/services/), accessed 2026-09-10 | Documented | `service_healthy` is meaningful only with a declared healthcheck. It does not prove the application protocol is ready. |
| Named volumes, networks, secrets, and configs must be declared or intentionally external where required | [Docker volumes](https://docs.docker.com/reference/compose-file/volumes/), [secrets](https://docs.docker.com/reference/compose-file/secrets/), and [configs](https://docs.docker.com/reference/compose-file/configs/), accessed 2026-09-10 | Documented | A browser can check references inside the pasted model. It cannot prove an external resource exists or that a file-backed secret/config path is readable. |
| Compose can read file references and remote includes with security implications | [Docker Compose trust model](https://docs.docker.com/compose/trust-model/), accessed 2026-09-10 | Documented | A browser-local checker must not fetch remote references or read arbitrary host paths without a deliberate, explicit multi-file feature. |
| A port collision inside one file is statically detectable; a host port collision with another running process is not | [Compose ports reference](https://docs.docker.com/reference/compose-file/services/#ports), accessed 2026-09-10 | Inferred | The first half is a direct model check. The second half follows from the browser having no Docker daemon or host socket. |
| Image existence, build context contents, Dockerfile validity, registry access, engine support, bind-mount existence, and runtime health are not provable from pasted YAML | [Docker `config` options](https://docs.docker.com/reference/cli/docker/compose/config/) plus tool limitations observed in [GenKitLab](https://genkitlab.com/tools/docker-compose-validator/) and [DevTools Hub](https://devstoolshub.com/docker-compose-validator), accessed 2026-09-10 | Documented / Inferred | The product must name these as next checks, not report them as passed. |

## Competitor reviews

The following observations come from live pages loaded with standalone Playwright at 1280 x 900 on 2026-09-10. Mobile scroll-width observations use 375 x 812. `Observed` means visible or exercised. `Documented` means stated by the product or its source repository. `Inferred` means deduced from the probe. `Unknown` means not verified.

### Competitor 1: Spoold Docker Compose Viewer

- URL: [spoold.com/tools/docker/compose-viewer](https://spoold.com/tools/docker/compose-viewer)
- Accessed: 2026-09-10, 1280 x 900 and 375 x 812; HTTP 200. The page was accessible, but the editor was not exposed as a textarea or contenteditable, so custom replacement input was not verified.
- Audience and promise: [Observed] Paste or upload a Compose file and inspect its application model.
- Inputs and defaults: [Observed] Upload, Sample, Clear, a line-numbered sample editor, and views for Services, Graph, Resources, and Model. The page loaded a 3-service sample with ports, volumes, networks, dependencies, and healthcheck data.
- Action and state behavior: [Observed] The sample rendered immediately. Copy report was available. [Unknown] Custom invalid, empty, and loading states were not independently exercised.
- Results and visuals: [Observed] Counters for services, ports, errors, and warnings; service summary; dependency, network, port, volume, and healthcheck details; sensitive-looking environment key warnings.
- Formula or data source: [Inferred] Local YAML parsing plus hand-written Compose-oriented checks. No Docker daemon or registry request was observed. [Unknown] Exact supported schema and rule list.
- Errors and edge behavior: [Observed] Default sample reported "Looks valid" while also showing warnings for token-like values. [Unknown] Custom missing-reference behavior.
- Mobile and accessibility: [Observed] The body scroll width matched 375px in the probe. [Unknown] Full keyboard semantics and screen-reader result order.
- Privacy: [Unknown] No sufficiently clear privacy statement was captured during the bounded probe.
- Performance: [Observed] Page and sample settled after the waiting period without a visible loading failure.
- Search-content structure: [Observed] H1 "Docker Compose Viewer", then tool, guide sections, FAQ, and related-search content.
- What works: It exposes the application model instead of reducing the job to YAML validity.
- What fails: The default sample dominates the first load, and a user cannot tell from this probe how far the checker follows the current Compose Specification.
- Do not copy: [Inferred] Do not copy a large default report that calls a file valid while warnings are visually secondary.

```text
[H1 Docker Compose Viewer]
[Upload] [Sample] [Clear]      [Services 3] [Ports 1] [Errors 0] [Warnings 2]
[line-numbered editor with sample Compose]
[Looks valid] [Copy report]
[Services] [Graph] [Resources] [Model]
[guide, FAQ, related searches]
```

### Competitor 2: GenKitLab Docker Compose Validator

- URL: [genkitlab.com/tools/docker-compose-validator](https://genkitlab.com/tools/docker-compose-validator/)
- Accessed: 2026-09-10, 1280 x 900 and 375 x 812; HTTP 200. Fully accessible for paste and button/file/example/clear controls.
- Audience and promise: [Observed] Catch mistakes that only fail at `up`, especially missing dependencies, undeclared volumes, and duplicate host ports.
- Inputs and defaults: [Observed] Compose textarea, Open a file, Example, Clear, and a checkbox control whose label was not fully exposed in the compact control scan. The default sample had four services and intentional issues.
- Action and state behavior: [Observed] Results update after text entry. Structural probe produced three errors for a missing dependency, undeclared named volume, and duplicate `8080/tcp` host port. Malformed YAML produced a line-specific parse error.
- Results and visuals: [Observed] Project summary, service/port/volume/network/secret/profile counts, host-port summary, issue count, severity, JSON-like path, and explanatory text.
- Formula or data source: [Documented] The page says parsing and validation happen in the browser, no registry is contacted, and no disk path is read. [Inferred] Checks are a local parser plus custom reference and port rules, not the Docker Compose implementation.
- Errors and edge behavior: [Observed] Parse errors stop structural validation. Structural errors coexist with a summary. [Documented] It explicitly lists limits for image existence, build context, `env_file` paths, bind mounts, interpolation values, engine names, and capabilities.
- Mobile and accessibility: [Observed] At 375px the document and body scroll widths reached 624px, so the page has horizontal overflow in the tested state. [Unknown] Full keyboard and screen-reader behavior.
- Privacy: [Documented] It says the file stays in the browser, no upload occurs, no registry is contacted, and no disk path is read.
- Performance: [Observed] The sample and custom probes settled quickly after input.
- Search-content structure: [Observed] H1, workbench, limits section, About section, and explanatory content aimed at "fails at up" searches.
- What works: It gives the most honest boundary statement in the reviewed browser group and reports file paths for structural findings.
- What fails: The mobile overflow is a trust and usability defect for a small diagnostic tool, and the page can visually read as a full validator even though its own limits are narrower.
- Do not copy: Do not imply a browser check replaces `docker compose config` or the Docker engine.

```text
[H1 Docker Compose Validator]
[textarea Compose file] [Open a file] [Example] [Clear]
[project counts: services, ports, volumes, networks, secrets, profiles]
[Issues: severity + message + Compose path]
[limits of a local validator]
[about and supporting copy]
```

### Competitor 3: DevTools Hub Docker Compose Validator

- URL: [devstoolshub.com/docker-compose-validator](https://devstoolshub.com/docker-compose-validator)
- Accessed: 2026-09-10, 1280 x 900 and 375 x 812; HTTP 200. Fully accessible for paste and live results.
- Audience and promise: [Observed] Check undefined services, bad ports, and undeclared volumes or networks.
- Inputs and defaults: [Observed] Textarea, Upload file, Load example, and live result output. No separate submit button was exposed.
- Action and state behavior: [Observed] The structural probe produced separate errors for an undeclared volume and missing `depends_on` service. Malformed YAML produced a line and column parser message. [Unknown] Reset and persistence behavior.
- Results and visuals: [Observed] One error count, message, path, and a short "What this checks" explanation. [Documented] The page describes image/build presence, port ranges, dependency references, and top-level resource declarations.
- Formula or data source: [Documented] The page says it is not a full Compose Specification implementation and does not resolve `.env` interpolation or registry images. [Inferred] Local parser and structural rules.
- Errors and edge behavior: [Observed] Parser messages include a caret location. Cross-reference errors name the missing key and path.
- Mobile and accessibility: [Observed] 375px body and document widths matched the viewport in the probe. [Unknown] Full keyboard semantics.
- Privacy: [Unknown] A clear local-processing statement was not captured in the bounded probe.
- Performance: [Observed] Live updates settled quickly after each input.
- Search-content structure: [Observed] H1, short tool promise, workbench, "What this checks", "What it doesn't do", and FAQ.
- What works: The concise result is easy to scan and separates parser errors from structural errors.
- What fails: It does not make current Specification coverage or `version` behavior the main answer, and it leaves privacy less explicit than the best competitors.
- Do not copy: Do not present a generic structural rule set as a complete Compose validator.

```text
[H1 Docker Compose Validator]
[textarea] [Upload file] [Load example]
[1 error] [path + message]
[What this checks]
[What it doesn't do]
[FAQ]
```

### Competitor 4: Yoryantra Docker Compose Validator

- URL: [yoryantra.com/tools/docker-compose-validator](https://yoryantra.com/tools/docker-compose-validator)
- Accessed: 2026-09-10, 1280 x 900 and 375 x 812; HTTP 200. Fully accessible with explicit submit.
- Audience and promise: [Observed] Inspect YAML structure, cross-references, interpolation clues, named resources, and host-facing settings before running Compose.
- Inputs and defaults: [Observed] Compose textarea, Check Compose File, Load Example, Reset. The page states that one file is read as written and sibling overrides, includes, env files, and shell variables are not loaded.
- Action and state behavior: [Observed] Explicit submit produces "Structural check completed" with review findings. The structural probe reported a missing dependency as a warning, not an error, because it may come from an include or merged model. Malformed YAML produced a parse error with a line marker.
- Results and visuals: [Observed] Services detected, errors, warnings, security/isolation review notes, info count, interpolation token count, and a final `docker compose config -q` instruction.
- Formula or data source: [Documented] Local YAML parsing and local file inspection only. [Inferred] Cross-reference and host-setting checks are custom static rules.
- Errors and edge behavior: [Observed] It preserves the user's text after a parse error and explains that warnings need context.
- Mobile and accessibility: [Observed] 375px body and document widths matched the viewport. [Unknown] Screen-reader announcement and full keyboard path.
- Privacy: [Documented] YAML parsing stays in the browser and no Compose-validation API receives the file. The page also notes that site-wide analytics or advertising may be separate from inspection.
- Performance: [Observed] Explicit submit returned results quickly in the probe.
- Search-content structure: [Observed] H1, tool, limits, "Valid YAML Can Still Be a Broken Compose File", and supporting explanation.
- What works: It is unusually clear about the difference between structural warnings and final Docker validation.
- What fails: Treating a missing service as a warning by default can delay a fix for a genuinely broken single-file project, even if the include caveat is valid.
- Do not copy: Do not make severity depend on an unknown include model without making the reason visible beside the finding.

```text
[H1 Docker Compose Validator]
[textarea one Compose file]
[Check Compose File] [Load Example] [Reset]
[Errors] [Warnings] [Review notes] [Interpolation tokens]
[finding list with paths]
[final docker compose config -q reminder]
```

### Competitor 5: PureDevTools YAML Validator and Formatter

- URL: [puredevtools.tools/yaml-validator](https://puredevtools.tools/yaml-validator/)
- Accessed: 2026-09-10, 1280 x 900 and 375 x 812; HTTP 200. Fully accessible for preset, text, and formatting controls.
- Audience and promise: [Observed] Validate YAML, format it, and inspect JSON without leaving the browser.
- Inputs and defaults: [Observed] Docker Compose, GitHub Actions, Kubernetes Pod, and Invalid test presets; textarea; indentation select; style select; sort-keys toggle.
- Action and state behavior: [Observed] Live parse. Valid structural Compose text was labeled "Valid YAML" even with missing service and volume references. Malformed input was labeled "Invalid YAML" with line and parser message.
- Results and visuals: [Observed] Formatted YAML, JSON equivalent, line count, byte count, and copy actions.
- Formula or data source: [Documented] Browser-local YAML parsing and formatting. [Inferred] No Compose model validation in the exercised flow.
- Errors and edge behavior: [Observed] Good line-specific syntax error. [Unknown] Large-file behavior.
- Mobile and accessibility: [Observed] 375px scroll width reached 426px in the tested state. [Unknown] Full keyboard semantics.
- Privacy: [Documented] The page says all processing happens in the browser and no data is sent to a server.
- Performance: [Observed] Live syntax response was immediate after the probe.
- Search-content structure: [Observed] H1, workbench, explanation of YAML whitespace, and generic YAML guidance.
- What works: It is a strong baseline for syntax recovery and format/JSON inspection.
- What fails: "Valid YAML" is an easy false finish for a Compose user.
- Do not copy: Do not reuse a YAML-only success label on a Compose checker.

```text
[H1 YAML Validator & Formatter]
[Docker Compose] [GitHub Actions] [Kubernetes] [Invalid test]
[textarea] [Indent] [Style] [Sort keys]
[Valid/Invalid YAML + line error]
[formatted YAML] [JSON equivalent]
```

### Competitor 6: YAML Config Validator Pro

- URL: [yamlvalidator.pro/validator/docker-compose](https://www.yamlvalidator.pro/validator/docker-compose/)
- Accessed: 2026-09-10, 1280 x 900 and 375 x 812; HTTP 200. The live sample, controls, FAQ, and page content were accessible. The bounded replacement probe retained the sample, so custom invalid behavior is Unknown.
- Audience and promise: [Observed] Validate, format, convert, and inspect Docker Compose YAML.
- Inputs and defaults: [Observed] Open file, Validate, Format, Convert, Copy Link, Copy, Download, Reset, Raw/Tree views, and FAQ disclosures. It loads a version `3.8` sample.
- Action and state behavior: [Observed] Sample shows Valid and a parsed JSON result. [Unknown] Whether the custom Compose route adds semantic checks beyond YAML parsing.
- Results and visuals: [Observed] Raw YAML, JSON result, character count, tree view, and copy/download actions.
- Formula or data source: [Documented] The page describes browser-local core validation, formatting, conversion, and tree inspection. [Unknown] Compose Specification schema coverage.
- Errors and edge behavior: [Unknown] Custom syntax and semantic error states were not verified because the sample remained active.
- Mobile and accessibility: [Observed] 375px scroll width reached 563px, indicating horizontal overflow in the tested state. [Unknown] Full keyboard semantics.
- Privacy: [Documented] The page says YAML stays in the browser and no sign-up is required.
- Performance: [Observed] Sample rendered without a visible loading failure.
- Search-content structure: [Observed] H1, tool, feature sections, Docker Compose checker copy, and FAQ questions about offline use, privacy, YAML versions, and error reporting.
- What works: It exposes copy, download, and tree/JSON inspection around the source text.
- What fails: Generic conversion controls and the large page frame compete with the actual diagnostic answer.
- Do not copy: Do not bury a Compose finding under formatter and converter actions.

```text
[H1 YAML Config Validator Pro]
[Validate] [Format] [Convert] [Open file]
[textarea with line numbers] [Raw] [Tree]
[Valid] [Parsed JSON]
[Copy link] [Copy] [Download] [Reset]
[FAQ]
```

### Competitor 7: ZeroData Tools YAML Validator

- URL: [zerodatatools.com/yaml-validator](https://zerodatatools.com/yaml-validator/)
- Accessed: 2026-09-10, 1280 x 900 and 375 x 812; HTTP 200. The page and tool directory were accessible. The editor was rendered through a control not captured as a normal textarea in the bounded probe, so custom input behavior is Unknown.
- Audience and promise: [Observed] Browser-only YAML validation and formatting. The directory visibly lists a separate Docker Compose Validator, Docker Compose env_file Mapper, and Docker Compose Diff Tool.
- Inputs and defaults: [Observed] Search, swap, Validate, Format YAML, YAML to JSON, JSON to YAML, Copy, Download, and Clear controls were visible. The editor surface itself was not reliably identified in the probe.
- Action and state behavior: [Unknown] Custom valid, invalid, and semantic Compose states were not exercised.
- Results and visuals: [Observed] The page is organized as a generic input/output converter. [Unknown] Compose-specific result depth.
- Formula or data source: [Documented] Directory positioning is browser/local-tool oriented. [Unknown] Exact parser and Compose schema behavior.
- Errors and edge behavior: [Unknown].
- Mobile and accessibility: [Unknown] Full mobile result behavior was not verified.
- Privacy: [Unknown] No direct privacy statement was captured in the bounded output.
- Performance: [Observed] Page loaded successfully.
- Search-content structure: [Observed] Generic YAML validator page with large tool directory and related Docker tools.
- What works: The directory shows adjacent demand for Compose-specific utilities beyond one validator.
- What fails: The generic surface does not make the Compose model the first question.
- Do not copy: Do not expand one checker into a pile of unrelated YAML converters.

```text
[tool-directory search]
[YAML input/output editor]
[Validate] [Format] [YAML to JSON] [JSON to YAML]
[Copy] [Download] [Clear]
[related Docker Compose tools]
```

### Competitor 8: Compose Toolbox

- URL: [composetoolbox.com](https://composetoolbox.com/)
- Accessed: 2026-09-10, 1280 x 900 and 375 x 812; HTTP 200. Fully accessible as a rendered editor/viewer.
- Audience and promise: [Observed] Docker Compose editor and configuration tool.
- Inputs and defaults: [Observed] A rendered 11-line, 219-character Compose editor with expand controls, Show Details, Toggle View, Help, Shortcuts, and Light theme controls. The default sample contains one service, one volume, ports, environment, and restart policy.
- Action and state behavior: [Observed] It immediately shows "Valid Configuration", one service, one volume, and three suggestions. [Unknown] Custom malformed and multi-service input in this probe.
- Results and visuals: [Observed] Configuration summary, service details, port mapping, environment count, volume mapping, restart, and a volume section.
- Formula or data source: [Inferred] Client-side parser and configuration model. [Unknown] Current Specification coverage and privacy/network behavior.
- Errors and edge behavior: [Unknown].
- Mobile and accessibility: [Unknown] A mobile viewport was loaded, but complete editor reflow and keyboard behavior were not captured before the bounded probe ended.
- Privacy: [Unknown].
- Performance: [Observed] The page settled from "Loading editor" to the rendered configuration during the probe.
- Search-content structure: [Observed] The tool is the page. Supporting navigation is minimal.
- What works: It makes the application model visible without requiring a long article.
- What fails: Suggestions are not clearly separated into schema errors, operational warnings, and style advice.
- Do not copy: Do not make a single "Valid Configuration" verdict hide the rule category and confidence behind it.

```text
[H1 Compose Toolbox]
[Compose editor] [Show Details] [Expand All] [Toggle View]
[Valid Configuration] [3 Suggestions]
[Overview] [Services] [Volumes]
[service details and mappings]
[Help] [Shortcuts] [theme]
```

### Competitor 9: compose-lint

- URL: [github.com/tmatens/compose-lint](https://github.com/tmatens/compose-lint)
- Accessed: 2026-09-10, 1280 x 900 GitHub page; HTTP 200. The repository page and README were accessible. This is a local CLI, not a browser paste tool.
- Audience and promise: [Documented] Security-focused Compose linter for dangerous misconfigurations, grounded in OWASP and CIS Docker Benchmark language.
- Inputs and defaults: [Documented] Auto-detects common Compose filenames, merges a neighboring override by default, supports `--no-merge-overrides`, reads env files only for specific rules, and refuses paths outside the project directory for those rules.
- Action and state behavior: [Documented] Check, explain, dry-run fix, and apply fix. It reports rule codes, severity, references, and a pass/fail verdict. The repository's visible examples show a Docker socket mount, unpinned image, plaintext credential, and behavior-changing fixes.
- Results and visuals: [Documented] Terminal findings are line-oriented with rule code, severity, fix guidance, and references. `explain` provides offline rule documentation.
- Formula or data source: [Documented] Rule definitions and source code are in the repository. [Unknown] Full Compose Specification conformance and runtime coverage.
- Errors and edge behavior: [Documented] The project distinguishes malformed, unknown, and retired rule IDs and has tests for Compose parsing errors.
- Mobile and accessibility: [Unknown] CLI. GitHub README is not a mobile tool interface.
- Privacy: [Documented] Local CLI behavior and refusal to read outside project paths are stated in repository documentation. No web service is required for the core run.
- Performance: [Unknown] No benchmark was run.
- Search-content structure: [Observed] Repository README, install/use instructions, rules, CI, and release history.
- What works: Stable rule IDs, severity, references, and fix preview are better for CI than a generic green/red result.
- What fails: It assumes a local project and is too security-oriented to be the first explanation for a beginner's broken Compose file.
- Do not copy: Do not auto-fix behavior-changing security settings in a browser without a diff, caveat, and explicit user action.

```text
[terminal command]
[file discovery + merged overrides]
[rule code] [severity] [line/path] [finding]
[fix guidance] [reference]
[PASS/FAIL]
[optional explain or fix --dry-run]
```

### Competitor 10: Docker Compose Linter (DCLint)

- URL: [github.com/zavoloklom/docker-compose-linter](https://github.com/zavoloklom/docker-compose-linter)
- Accessed: 2026-09-10, 1280 x 900 GitHub page; HTTP 200. The repository page and README were accessible. This is a local CLI and library surface, not a browser paste tool.
- Audience and promise: [Documented] Validate and enforce best practices in Docker Compose files.
- Inputs and defaults: [Documented] A Compose file or directory, project configuration, schemas, and rule settings. The repository exposes tests, schemas, and a compiled CLI path.
- Action and state behavior: [Documented] The README describes validation and fixing workflows and configurable rule formats. [Unknown] Exact current flags and default rule severities were not independently run.
- Results and visuals: [Documented] Machine-readable and CLI-oriented output is the apparent target. [Unknown] Exact output shape for every formatter.
- Formula or data source: [Documented] Repository schemas and code are the source. [Unknown] Whether the schema exactly tracks the latest Compose Specification features such as `include` and `models`.
- Errors and edge behavior: [Unknown] No local run was authorized or required in this bounded web research stage.
- Mobile and accessibility: [Unknown] CLI.
- Privacy: [Documented] Local repository tool; no hosted paste service was observed.
- Performance: [Unknown].
- Search-content structure: [Observed] GitHub README and repository layout focused on installation, rules, schemas, tests, and releases.
- What works: It demonstrates that serious Compose linting belongs in reproducible local or CI workflows.
- What fails: It does not solve the zero-install, explain-this-line-now search moment.
- Do not copy: Do not expose dozens of policy rules before the checker has answered parse and structural validity.

```text
[CLI input path/config]
[schema/rule engine]
[finding list + severity]
[optional fix or machine-readable output]
[exit status for CI]
```

## Comparison matrix

| Capability | Spoold | GenKitLab | DevTools Hub | Yoryantra | PureDevTools / YAML Pro | Compose Toolbox | compose-lint / DCLint | User value |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Paste or edit in browser | Yes, editor | Yes, textarea | Yes, textarea | Yes, textarea | Yes, textarea | Yes, editor | No, local CLI | High |
| YAML syntax errors with location | Unknown custom probe | Yes, line/path | Yes, line/column | Yes, line | Yes, line | Unknown | Documented parser errors | High |
| Missing service references | Unknown custom probe | Yes | Yes | Yes, warning-aware | No in exercised YAML flow | Unknown | Likely rule/schema dependent | High |
| Named volume/network reference checks | Model view, unclear | Yes | Yes | Yes | No in YAML-only flow | Model view | Rule dependent | High |
| Duplicate host port in same file | Unknown | Yes | Documented scope, not directly confirmed | Host-facing review, exact rule Unknown | No | Unknown | Rule dependent | High |
| Compose Specification version semantics | Unknown | Limits described, exact version coverage Unknown | Says not full schema | Explains final CLI step | No | Unknown | Source/schema dependent | High |
| Interpolation and `.env` explanation | Warning clues, Unknown depth | Explicitly not checked | Explicitly not resolved | Token clues, no env files | No | Unknown | Local env-file rules | High |
| Profiles, includes, extends | Unknown | Counts profiles, resolution Unknown | Explicitly not loaded | Local one-file boundary | Unknown | Override merge documented; full include coverage Unknown | High |
| Secrets/configs distinction | Model fields visible | Counts secrets, not file truth | Not clear | Resource review | No | Volume-focused sample | Rule dependent | Medium |
| Security advisories | Sensitive env warnings | Limits and structural errors | Basic structural scope | Isolation review notes | No | Suggestions, category unclear | Core strength | Medium |
| Browser-local privacy statement | Unknown | Explicit | Unknown | Explicit with analytics caveat | Explicit | Unknown | Local by design | High |
| Copy, download, report | Copy report | File/example/clear | Upload/example | Reset/example | Copy/download/link | Help/details | CLI and CI output | Medium |
| Mobile result behavior | 375px no overflow observed | Overflow to 624px | 375px matched viewport | 375px matched viewport | PureDevTools 426px, YAML Pro 563px | Unknown | Not applicable | High |
| Runtime proof | No | No | No | No | No | No | No, static lint only | Honesty requirement |

The matrix shows a gap between generic YAML parsing and local policy linting. The browser tools that do Compose-aware checks are strongest on a small set of cross-references and ports, while the official Docker command remains the only source that can resolve the user's real file set, environment, and implementation behavior.

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| Should `version: "3.8"` select a legacy schema? | Generic samples still include it; Docker says it is obsolete and ignored | [Docker reference](https://docs.docker.com/reference/compose-file/) and [Compose Specification](https://compose-spec.github.io/compose-spec/spec.html#version-and-name-top-level-elements) | No for the technical rule. Product planning must decide how prominently to explain the warning. |
| Is a missing `depends_on` service an error or warning? | GenKitLab and DevTools Hub treat it as an error; Yoryantra warns because an include or merge may supply it | [Yoryantra](https://yoryantra.com/tools/docker-compose-validator), [GenKitLab](https://genkitlab.com/tools/docker-compose-validator/), and [Docker include](https://docs.docker.com/reference/compose-file/include/) | Yes. Make severity depend on single-file versus supplied multi-file context, and show why. |
| Does `env_file` resolve `${VAR}` in the Compose document? | Users and tools confuse the two meanings of env file | [Docker interpolation guide](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/) and [issue 9443](https://github.com/docker/compose/issues/9443) | No for the rule. The UI needs two separately named inputs or an explicit one-file limitation. |
| Can `service_healthy` prove a dependent application is ready? | Community answers treat it as a startup solution; Docker only defines healthcheck-based dependency behavior | [Docker services reference](https://docs.docker.com/reference/compose-file/services/) and [healthcheck discussion](https://stackoverflow.com/questions/59062517/docker-compose-healthcheck-does-not-work-in-a-way-it-is-expected-for-making-cont/59062794) | No. Report missing healthcheck or dependency shape, never runtime readiness. |
| Should a static checker flag `:latest`, plaintext credentials, privileged mode, or `0.0.0.0`? | Security linters treat these as policy findings; Compose itself can accept them | [compose-lint](https://github.com/tmatens/compose-lint) and [Docker trust model](https://docs.docker.com/compose/trust-model/) | Yes. Keep them as clearly labeled advisories, off the validity verdict, with no claim of vulnerability or safety. |
| Can a browser resolve `include` and `extends`? | Local tools can read the project; paste tools generally do not | [Docker include](https://docs.docker.com/reference/compose-file/include/), [Compose extends](https://compose-spec.github.io/compose-spec/spec.html#extends), and [Docker trust model](https://docs.docker.com/compose/trust-model/) | Yes. Decide whether MVP accepts only one file and flags unresolved references, or adds explicit user-supplied file bundles later. |

## What a browser-local checker can and cannot prove

### Can prove or report from pasted text

- YAML parse errors, line and column, duplicate or malformed structures where the parser exposes them.
- Required top-level shape and service names.
- Unknown top-level and service keys against a pinned Compose Specification schema, with a separate obsolete `version` warning.
- `depends_on` references, profile names, dependency conditions, and missing healthchecks for `service_healthy`.
- Named volume, network, secret, and config references within the supplied model.
- Duplicate published host ports within the same supplied model, with protocol and range checks where the parser can normalize them.
- Interpolation tokens, default and required operators, escaped dollars, likely empty substitutions, and the distinction between `environment`, service `env_file`, and CLI `--env-file`.
- Obvious static advisories such as hardcoded password-like keys, `privileged`, Docker socket mounts, host networking with published ports, and unpinned tags. These are heuristics, not security proof.

### Cannot prove from one browser paste

- Whether an image exists, can be pulled, is compatible with the host architecture, or contains vulnerabilities.
- Whether a build context, Dockerfile, bind-mount source, `env_file`, secret file, or config file exists or is readable.
- Whether an external network, volume, secret, or config already exists.
- Whether a host port is occupied by another Compose project or process.
- Whether a container starts, remains healthy, listens on the expected protocol, or is ready for application traffic.
- The final merged model for `include`, `extends`, override files, remote references, or profile selection unless the user explicitly supplies the necessary files and settings.
- The real shell environment, project directory, `.env`, CLI flags, Docker Engine version, platform, or implementation-specific feature support.
- That a configuration is secure, production-ready, or safe to deploy.

## Evidence-backed opportunities

1. **Make the three validation layers explicit.** Separate `YAML syntax`, `Compose model`, and `static advisories` in the result. PureDevTools and YAML Config Validator Pro are good syntax tools, while GenKitLab, DevTools Hub, and Yoryantra show the demand for cross-reference checks. The distinction would prevent a green "Valid YAML" result from being mistaken for a runnable Compose project.

2. **Explain current Compose version semantics in the finding itself.** Use the current Compose Specification as the default, mark top-level `version` obsolete, and link to the exact reason. This addresses the repeated `version 2 versus 3` and `depends_on` confusion without maintaining fake legacy schemas.

3. **Treat interpolation as a first-class diagnostic.** Show each token, operator, and assumed value state. Let users paste optional `.env` or CLI-style environment text only if the product can preserve the distinction between interpolation inputs and container environment inputs. This is the clearest recurring pain in official issue threads and community questions.

4. **Return line-anchored repairs with a reason and boundary.** Every finding should identify the YAML line or JSON path, say what is wrong, and say whether the checker can prove it. GenKitLab and DevTools Hub show the value of paths; Yoryantra shows the value of a final `docker compose config -q` handoff.

5. **Make privacy visible and testable.** Process the pasted file in the browser, avoid network requests for the checker path, say that no Docker daemon, registry, or host filesystem is contacted, and keep that statement beside the input. The competitors with the clearest local-processing disclosures make the privacy value part of the job, not a buried policy page.

6. **Use a calibrated answer instead of one verdict.** Lead with `No blocking static issues found`, `Static issues found`, or `Cannot fully resolve this file`. Keep policy advisories separate from errors. This combines the useful model summaries of Spoold and Compose Toolbox with the honest scope language of GenKitLab and Yoryantra.

7. **Offer an official next command, not runtime theater.** When a result depends on real files or environment, generate a short next step such as `docker compose config -q` or `docker compose config --environment`, with a reminder to run it in the project directory. The tool should help users reach the authoritative check quickly.

## Recommended product wedge

Build a browser-local, Compose-Spec-aware preflight for one pasted Compose file. Its first answer should distinguish parser failure from model failure and policy advisory, then show line/path findings and a compact service/resource map. The useful difference is not a larger lint rule count. It is helping a homelab user understand why `docker compose config` or `docker compose up` will disagree with the green YAML parser they already tried.

The first version should cover:

- YAML parsing with line and column errors.
- Current Compose Specification keys and types, including obsolete `version` handling and `x-` extensions.
- Services, `depends_on`, profiles, networks, volumes, secrets, configs, ports, healthcheck relationships, and common service/resource references.
- Interpolation token inventory and explicit unresolved-variable warnings.
- Duplicate host port detection within the supplied file.
- A separate, clearly labeled advisory group for obvious plaintext credentials and host-exposure or isolation settings.
- A short result handoff to `docker compose config -q` and `docker compose config --environment`.
- No upload, no registry access, no Docker socket, no host path reads, and no claim of runtime or security proof.

## Table stakes

- Paste and clear, with a useful Compose example.
- File upload only if the browser reads it locally and the privacy statement is true.
- Line-numbered input or a precise path back to the source.
- Valid, invalid, empty, and partially unresolved states.
- A result that survives long service names and long interpolation expressions.
- Copyable findings or a report without requiring an account.
- Keyboard-accessible editor, action, findings, and recovery.
- Narrow-screen layout with no page-level horizontal overflow.
- A visible distinction between blocking errors, warnings, and advisories.
- An honest statement that `include`, `extends`, real environment, host files, Docker Engine, registry, and runtime health may remain unresolved.

## Non-goals and ideas to reject

- **Running Docker in the browser:** reject. A browser-local checker cannot safely or honestly provide a Docker Engine, container runtime, or host filesystem.
- **Pulling images or checking registries by default:** reject. It changes the privacy promise, adds network failure and rate-limit behavior, and still does not prove runtime compatibility.
- **Calling the result a security audit:** reject. Static patterns can be advisories. They cannot prove absence of vulnerabilities or unsafe deployment.
- **Pretending `version: 2` and `version: 3` are current schema modes:** reject. Explain their history and current obsolete status instead.
- **Auto-fixing Compose files in the first version:** reject. Port rebinding, secret movement, read-only flags, or dependency changes can change behavior. A later explicit diff workflow may be considered.
- **Fetching `include`, `extends`, remote Compose, or arbitrary paths automatically:** reject. The trust model and privacy boundary make this unsafe without explicit file selection and a clear merged-model UI.
- **A large security rule catalog before model validation is trustworthy:** reject. It would make a beginner's structural error harder to find and would imitate CI linters without their local project context.
- **A service diagram as the primary result:** reject. A graph can help after the finding list, but it does not identify the line that needs fixing.

## Open questions and blockers

- Which YAML parser and Compose schema version will be pinned, and how will schema updates be reviewed when the Compose Specification changes?
- Does the MVP accept only one file, or can users explicitly add override files and an `.env` text input? The answer changes severity for missing references and interpolation.
- Should unknown keys be errors, warnings, or a separate compatibility notice? The Compose Specification says newer fields may warn, so the UI needs a compatibility mode rather than a blanket red result.
- Which common Compose implementation differences must be named, especially Docker Compose CLI versus Swarm `docker stack deploy` behavior for interpolation?
- How should the checker represent profile-dependent services in the default result when no profile set was supplied?
- Which static advisories are useful for homelab users without creating a security product promise? Start with a short reviewed list and cite the rule rationale.
- Is a local file upload worth its complexity if the first version can use paste only? The privacy promise is easier to test with paste and optional browser `File` reads.
- What exact accessibility contract will the editor use for line numbers, focus, error association, and live result announcements?
- How will the product test that no checker-path network requests occur in production, including analytics or error reporting?

## Sources

Technical authority and current behavior:

- [Docker Compose file reference](https://docs.docker.com/reference/compose-file/), accessed 2026-09-10. Documented current Compose Specification and legacy 2.x/3.x relationship.
- [Docker `docker compose config` reference](https://docs.docker.com/reference/cli/docker/compose/config/), accessed 2026-09-10. Documented merge, interpolation, canonical rendering, environment, profile, and quiet validation options.
- [Compose Specification](https://compose-spec.github.io/compose-spec/spec.html), accessed 2026-09-10. Documented version/name, services, profiles, interpolation, `include`, `extends`, and unknown-field behavior.
- [Compose Specification JSON schema](https://github.com/compose-spec/compose-spec/blob/main/schema/compose-spec.json), accessed 2026-09-10. Documented current schema shape and additional-property constraints for selected maps.
- [Docker interpolation guide](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/), accessed 2026-09-10. Documented syntax, precedence, `.env`, `--env-file`, and unresolved-variable behavior.
- [Docker interpolation reference](https://docs.docker.com/reference/compose-file/interpolation/), accessed 2026-09-10. Documented value-only interpolation, nesting, and escaped dollars.
- [Docker profiles guide](https://docs.docker.com/compose/how-tos/profiles/), accessed 2026-09-10. Documented profile activation and dependency resolution.
- [Docker services reference](https://docs.docker.com/reference/compose-file/services/), accessed 2026-09-10. Documented service keys, dependency conditions, healthchecks, ports, and service configuration.
- [Docker volumes reference](https://docs.docker.com/reference/compose-file/volumes/), accessed 2026-09-10. Documented named-volume declarations.
- [Docker secrets reference](https://docs.docker.com/reference/compose-file/secrets/), accessed 2026-09-10. Documented top-level secret definitions and service grants.
- [Docker configs reference](https://docs.docker.com/reference/compose-file/configs/), accessed 2026-09-10. Documented top-level config definitions and service grants.
- [Docker include reference](https://docs.docker.com/reference/compose-file/include/), accessed 2026-09-10. Documented recursive includes and path/project-directory behavior.
- [Docker Compose trust model](https://docs.docker.com/compose/trust-model/), accessed 2026-09-10. Documented remote includes, file references, interpolation, and the need to inspect the fully resolved model.

Live competitors and adjacent tools, all accessed 2026-09-10:

- [Spoold Docker Compose Viewer](https://spoold.com/tools/docker/compose-viewer). Observed browser viewer, model tabs, counters, sample, and report action.
- [GenKitLab Docker Compose Validator](https://genkitlab.com/tools/docker-compose-validator/). Observed browser structural checks, line-specific parse errors, local-processing limits, and mobile overflow.
- [DevTools Hub Docker Compose Validator](https://devstoolshub.com/docker-compose-validator). Observed browser structural checks, parser errors, and scope explanation.
- [Yoryantra Docker Compose Validator](https://yoryantra.com/tools/docker-compose-validator). Observed explicit-submit workflow, warning-aware structural output, local-only statement, and Docker handoff.
- [PureDevTools YAML Validator](https://puredevtools.tools/yaml-validator/). Observed browser-local YAML parse, format, JSON, preset, and line-error behavior.
- [YAML Config Validator Pro Docker Compose page](https://www.yamlvalidator.pro/validator/docker-compose/). Observed browser-local validation, conversion, tree/raw views, file and copy actions, and FAQ structure.
- [ZeroData Tools YAML Validator](https://zerodatatools.com/yaml-validator/). Observed generic YAML converter surface and related Compose utility directory; custom editor probing remained Unknown.
- [Compose Toolbox](https://composetoolbox.com/). Observed editor, configuration model, service/volume view, valid state, and suggestions.
- [compose-lint](https://github.com/tmatens/compose-lint). Documented local security linting, rule codes, override merge behavior, explain, and fix workflow.
- [Docker Compose Linter, DCLint](https://github.com/zavoloklom/docker-compose-linter). Documented local validation, best-practice rules, schemas, tests, and fixing workflow.

Community demand and pain:

- [Docker Compose issue 13340](https://github.com/docker/compose/issues/13340), accessed 2026-09-10. Documented typed-field interpolation confusion.
- [Docker Compose issue 11538](https://github.com/docker/compose/issues/11538), accessed 2026-09-10. Documented confusion between interpolation and container environment values.
- [Docker Compose issue 9443](https://github.com/docker/compose/issues/9443), accessed 2026-09-10. Documented `env_file` versus interpolation confusion.
- [Docker Compose issue 8254](https://github.com/docker/compose/issues/8254), accessed 2026-09-10. Documented `.env` location and project-directory confusion.
- [Docker Compose issue 7423](https://github.com/docker/compose/issues/7423), accessed 2026-09-10. Documented missing-variable warnings and blank substitution.
- [Stack Overflow `depends_on` condition question](https://stackoverflow.com/questions/71060072/docker-compose-depends-on-with-condition-invalid-type-should-be-an-array/72520034), accessed 2026-09-10. Demand evidence for version and dependency syntax confusion.
- [Stack Overflow healthcheck question](https://stackoverflow.com/questions/59062517/docker-compose-healthcheck-does-not-work-in-a-way-it-is-expected-for-making-cont/59062794), accessed 2026-09-10. Demand evidence for readiness assumptions.
- [Reddit browser auditor discussion](https://www.reddit.com/r/docker/comments/1rvsom1/free_browserbased-docker-compose-auditor-flags/), accessed 2026-09-10. Demand and privacy concern for browser-local Compose review.
