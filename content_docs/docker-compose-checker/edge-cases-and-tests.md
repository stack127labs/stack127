# Edge cases and tests: Docker Compose checker

Status: ready
Tool: Docker Compose checker
Route: /docker-compose-checker
Depends on: competitive-report.md, implementation-report.md, interface-contract.md, brief.md
Input fingerprint: `competitive-report.md sha256:26d81ad5616befbfabba5dda2beed1c8ae8d8f8e6721eb57c9b29d6384118c1a`
Input fingerprint: `implementation-report.md sha256:1c4ef6b5fc05c53b4c82dfb2ebef07201cc004724bb9ee85d31bdea0081ada97`
Input fingerprint: `brief.md sha256:cdddc1c8a8dea42aa26848b792fd2874159f87cb63c7bb996cd8be187aeeda92`
Input fingerprint: `interface-contract.md sha256:15eed95d1a0d2e5c4418c60f9e0ef87c4f8354f2501f2be0d9f44b6a016e7417`

## Risk model

| Priority | Meaning for this tool |
| --- | --- |
| P0 | A false Compose answer, fabricated runtime state, unsafe YAML evaluation, leaked pasted configuration, stale result, or inaccessible primary check. |
| P1 | A common parse, model, recovery, copy, URL, privacy, keyboard, or narrow-layout failure that does not change engine truth. |
| P2 | An uncommon resilience or presentation defect after the answer, privacy boundary, and recovery path remain correct. |

The main hazard is a YAML-only green result that looks like a usable Compose configuration. A parsed result must keep YAML syntax, Compose model, and Static advisories separate, with exact counts, source-anchored diagnostics, completeness, provenance, and limitations. The checker never proves image availability, file existence, host-port availability, container startup, health, readiness, security, or compliance.

## Requirement traceability

| Requirement | Observable requirement | Covered by |
| --- | --- | --- |
| R1 | Clean route owns two editors and explicit actions. | EC-001, EC-034 |
| R2 | One UTF-8 document, BOM/CRLF, locations, limits, and rejected forms. | EC-002 through EC-006, FF-001 |
| R3 | Syntax failures have stable source diagnostics and no semantic result. | EC-006, EC-007 |
| R4 | Targeted Compose fields normalize into the summary. | EC-009, RF-001 |
| R5 | version is obsolete information and never selects a legacy schema. | EC-010, RF-001 |
| R6 | Unknown keys warn, extensions survive, wrong known types error. | EC-011, EC-012 |
| R7 | Missing dependency references error in complete one-file mode. | EC-013, RF-002 |
| R8 | Healthchecks and conditions are checked without runtime claims. | EC-014, RF-002 |
| R9 | Ports normalize and collisions respect host address and protocol. | EC-015, RF-003 |
| R10 | Named resources require declarations; external existence stays unknown. | EC-016 |
| R11 | Profiles are inventoried without inventing an active profile set. | EC-017 |
| R12 | include and extends are incomplete and never fetched or merged. | EC-018, EC-029 |
| R13 | Operators, states, precedence, and unread env_file are explicit. | EC-019, EC-020, RF-004 |
| R14 | Static clues are advisories, not security or runtime verdicts. | EC-021 |
| R15 | Diagnostic schema and ordering are stable. | EC-022, RF-005 |
| R16 | Lead states distinguish syntax, model issues, incomplete, and clean static results. | EC-023, RF-005 |
| R17 | Edit, reset, and example actions clear or replace state correctly. | EC-024, EC-025 |
| R18 | Focus and announcements follow submitted state. | EC-026, EC-027 |
| R19 | Copy is versioned, complete, deterministic, and recoverable after failure. | EC-028, RF-005 |
| R20 | URL, storage, network, clipboard-input, telemetry, and file boundaries hold. | EC-029, EC-030 |
| R21 | Limits, performance, wrapping, and responsive layout hold. | EC-031, EC-032, EC-036 |
| R22 | This stage changes only this document and the route stays unpublished. | EC-033 |
| UI-001 | Initial hierarchy has two editors, one primary, example, reset, and no result. | EC-001, EC-034 |
| UI-002 | Editing does not validate; submit is explicit and the only accent action. | EC-024, EC-034 |
| UI-003 | Labels, descriptions, placeholders, and required semantics persist. | EC-034 |
| UI-004 | The lead distinguishes parsed and parse-failure states. | EC-023, EC-035 |
| UI-005 | Three layer rows are unique and counts are not duplicated into them. | EC-035 |
| UI-006 | Exact counts, including zero, use labeled values, not chart geometry. | EC-009, EC-035 |
| UI-007 | Findings expose severity, code, layer, path, location, excerpt, message, and fix. | EC-022, EC-035 |
| UI-008 | Diagnostic rows reflow without page overflow or hidden fixes. | EC-036 |
| UI-009 | Summary shows names, keys, edges, interpolation, completeness, and reasons without graph/canonical YAML. | EC-009, EC-018, EC-035 |
| UI-010 | Provenance and limitations follow answer, findings, and summary. | EC-035 |
| UI-011 | Focus moves to result, invalid field, editor, or retry region. | EC-025 through EC-027 |
| UI-012 | Copy, edit, and unsupported-state announcements occur once at the right scope. | EC-024, EC-028, EC-029 |
| UI-013 | Failures preserve drafts and remove stale output; reset clears all. | EC-007, EC-024, EC-025, EC-027 |
| UI-014 | Copy includes schema, engine, counts, completeness, summary, and diagnostics. | EC-028, RF-005 |
| UI-015 | Clean and malformed state URLs obey surgical removal. | EC-029 |
| UI-016 | No input-bearing or prohibited request/read occurs. | EC-030 |
| UI-017 | Controls and result regions do not shift when status changes. | EC-028, EC-036 |
| UI-018 | Dark/light themes retain contrast and non-color status labels. | EC-037 |
| UI-019 | Graph, formatter, chart, score, badge, picker, nested cards, and hidden live validation stay omitted. | EC-035, EC-038 |
| UI-020 | Route layout/table reflow belong to route CSS, not global CSS. | EC-033, EC-038 |

## Coverage checklist

| Family | Case IDs or reason |
| --- | --- |
| Input grammar | EC-002 through EC-008, EC-019, FF-001 |
| Numeric boundaries | EC-004, EC-005, EC-006, EC-015, EC-031. No user numeric fields exist; applicable boundaries are bytes, lines, services, resources, tokens, diagnostics, ports, nesting depth, and timing. |
| Configuration dependencies | EC-013 through EC-020, RF-001 through RF-004 |
| Technical truth | EC-009 through EC-023, RF-001 through RF-005 |
| Submission and concurrency | EC-024 through EC-028, EC-031, EC-034 |
| Network and upstream | EC-030. Not applicable: v1 has no upstream, request, cache, timeout, rate-limit, or offline data source; tests prove no such path is introduced. |
| Persistence and sharing | EC-028 through EC-030. Share links, downloads, and saved drafts are deferred. |
| Accessibility | EC-026 through EC-028, EC-034 through EC-037 |
| Responsive and themes | EC-036, EC-037 |
| Security and privacy | EC-003, EC-004, EC-008, EC-018 through EC-021, EC-028 through EC-030 |
| SSR and SEO | EC-033, EC-038. Publication remains unpublished; no route-owned metadata, canonical, sitemap, or JSON-LD. |
| Performance | EC-004, EC-031, EC-032 |

## Result contract

Every non-throwing submission returns:

    status: input-invalid | syntax-invalid | model-invalid | parsed | engine-error
    lead: Input needs attention | YAML syntax needs fixing | Compose model needs fixing | Cannot fully resolve this file | Compose model has blocking issues | No blocking static issues found
    layers: [{ name: YAML syntax | Compose model | Static advisories, status }]
    counts: { services, publishedPorts, namedVolumes, networks, secrets, configs, profiles, interpolationTokens, errors, warnings, advisories }
    findings: Diagnostic[]
    summary: { services, resources, profiles, publishedPortKeys, dependencyEdges, interpolationStates, completeness, incompleteReasons }
    provenance: { schemaVersion: 1, engineVersion: compose-checker-resolution-1, composeSpecSnapshotDate, schemaSnapshotId, parserVersion }
    completeness: { status: complete | incomplete, reasons: string[] }

engine-error is a UI recovery state and has no model result. input-invalid and syntax-invalid have findings but no semantic summary; model-invalid has a Compose model finding but no normalized summary. parsed always has the three layer rows and a summary. severity is exactly Error, Warning, Advisory, or Info. layer is exactly Input, YAML syntax, Compose model, or Static advisories. Input findings identify `compose` or `environment` as their target. code begins with INPUT-, YAML-, or COMPOSE-. path is a Compose-style path or null. line and column are 1-based integers or null. excerpt is a trimmed source line capped at 240 Unicode code points or null. message explains the finding without claiming more than the checker knows. fix gives one repair direction and never edits input.

Findings sort by YAML syntax, model errors, model warnings, advisories, then info, preserving source order within a group. Counts include zero values. No result field may contain container status, image pull status, host filesystem status, daemon output, health result, readiness result, security verdict, or fabricated runtime state.

## Exact deterministic fixtures

All fixtures live under tests/pages/docker-compose-checker/fixtures/. Unit tests load literal source, optional environment text, expected engine version, expected summary, and ordered diagnostics. Expected diagnostics are never generated from the implementation under test.

### YAML and input fixtures

| Fixture | Exact content or construction | Expected result |
| --- | --- | --- |
| valid-current-compose.yml | name: demo; services.web.image: nginx:1.27; services.web.ports: ["8080:80"]; services.web.depends_on.db.condition: service_healthy; services.db.image: postgres:16; services.db.healthcheck.test: ["CMD-SHELL", "pg_isready"]; top-level volumes.data and networks.backend. | parsed, complete, services web and db, published key *:8080/tcp, one named volume, one network, one edge, zero diagnostics. |
| syntax-error.yml | services:\n  web:\n    image: nginx\n    ports: ["8080:80" | One YAML-PARSE-ERROR at the parser-reported closing-list location; semantic findings and summary absent. |
| input-limits.yml | Exact pairs: Compose bytes 262144/262145; physical lines 4000/4001; services 100/101; resources 512/513; interpolation tokens 512/513; diagnostics 1000/1001; environment bytes 65536/65537; environment lines 2000/2001. | Every maximum passes when otherwise valid. Every plus-one input returns one INPUT limit finding and no model. |
| bom-crlf.yml | Begin with U+FEFF, then services:\r\n  web:\r\n    image: nginx:1.27\r\n. | Same result as LF; one BOM is stripped; physical locations remain 1-based. |
| controls.yml | Separate valid files containing legal indentation tab, LF, and CR, then files containing NUL, DEL, and U+0001. | Legal controls pass in context. NUL, DEL, and U+0001 return INPUT-CONTROL-CHARACTER before parsing. |
| multiple-documents.yml | services:\n  web:\n    image: nginx\n---\nservices:\n  db:\n    image: postgres | One-document diagnostic; never merge, choose first, or ignore the second. |
| duplicate-keys.yml | services:\n  web:\n    image: nginx\n    image: caddy | YAML-DUPLICATE-KEY on the second image key, line 4, key column; no semantic result. |
| aliases-and-tags.yml | defaults: &defaults\n  image: nginx:1.27\nservices:\n  web: *defaults\n  tagged:\n    image: !!js/function alert | Standard alias is safe to resolve with source location retained. Unsafe tag is YAML-UNSAFE-TAG, never evaluated. Add an alias-cycle fixture that returns a typed error without recursion. |
| root-shape.yml | Run [], null, hello, and {} as separate documents. | Non-mapping roots return COMPOSE-ROOT-MAPPING. Empty mapping follows the fixed COMPOSE-SERVICES-MISSING contract. No guessed service model. |
| obsolete-version.yml | version: "3.8"\nservices:\n  web:\n    image: nginx:1.27 | One COMPOSE-VERSION-OBSOLETE warning at version, line 1, column 1; current rules are unchanged. |
| unknown-and-extension.yml | x-team:\n  owner: platform\nservices:\n  web:\n    image: nginx:1.27\n    mystery_key: true\n    ports: "8080:80" | x-team has no false error. mystery_key warns. ports has a known-type model error. |

### Semantic and advisory fixtures

| Fixture | Exact content or construction | Expected result |
| --- | --- | --- |
| service-references.yml | services.web.depends_on: [db, absent]; services.db.image: postgres:16. | One valid edge and one COMPOSE-DEPENDENCY-MISSING error at services.web.depends_on[1]. |
| dependency-healthcheck.yml | web depends_on.db.condition service_healthy; db image postgres:16; db.healthcheck.disable true. | COMPOSE-HEALTHCHECK-MISSING at services.web.depends_on.db.condition. Enabled healthcheck passes structure only. Invalid service_ready is COMPOSE-DEPENDENCY-CONDITION. Test short list, long map, required, and restart forms. |
| ports-and-collisions.yml | services.web.ports: ["8080:80/tcp", "8080:81/tcp", "127.0.0.1:8080:82/tcp", "8080:83/udp", "\${HOST_PORT}:84"], environment HOST_PORT=9090. | Wildcard TCP bindings collide with an overlapping explicit address on the same published port; UDP does not. 9090 normalizes. Also test ranges, bracketed IPv6, non-integer, 0, 65536, malformed colon count, omitted host port, and unresolved interpolation. |
| resource-references.yml | web volumes [missing:/data, ./local:/local], networks [missing-net], secrets [missing-secret], configs [missing-config], with top-level volumes.external_data.external true. | Missing named resources error at each service reference. Bind/file paths are never read. External existence is unknown, not an error. |
| profiles.yml | web.profiles [debug, debug, ""]; web depends_on.metrics; metrics.profiles [observability]. | Duplicate and empty profile findings; names debug and observability; active set unknown; cross-profile edge warning/unknown. |
| interpolation.yml | Values include repo:\${TAG:-latest}, $KNOWN, \${EMPTY-default}, \${EMPTY:-default}, \${REQUIRED:?required message}, \${KNOWN:+set}, \${EMPTY:+set}, $$HOME, \${OUTER:-\${INNER:-fallback}}, $MISSING, plus env_file: ./container.env. | Known, empty, defaulted, required-present, alternative, escaped, nested, and unresolved states stay distinct. env_file is unread and reported. |
| incomplete-composition.yml | include [./base.compose.yml]; web.extends.file ./common.yml, service base; web.depends_on [external-db]. | Parsed incomplete result; COMPOSE-INCOMPLETE-MODEL names both boundaries; no fetch/merge; potentially external missing dependency is a warning with reason. |
| risk-advisories.yml | web image nginx:latest, privileged true, pid host, network_mode host, cap_add [SYS_ADMIN], ports ["8080:80"], mounts /var/run/docker.sock and /, environment DB_PASSWORD: plaintext. | Exact advisory codes for floating tag, privileged mode, host PID/network, capability, Docker socket, broad bind, secret-like value, and broad exposure. All Advisory, never security/runtime verdict. |

### Environment precedence fixture

tests/pages/docker-compose-checker/fixtures/interpolation-precedence.json contains literal cases with sources explicitEnvironment, shellUnavailable, serviceEnv, and serviceEnvFile:

- An explicit pasted environment value is known. The real shell is never read.
- environment is a container declaration; only tokens in its values are interpolated.
- env_file is never opened and cannot satisfy a token.
- An explicitly empty value triggers the documented difference between -, :-, +, and :+.
- An unavailable shell or project .env remains unknown. No fixture claims an unobservable precedence.

## Formula or resolution fixtures

| ID | Inputs | Expected classification | Oracle/source | Invariants |
| --- | --- | --- | --- | --- |
| RF-001 | valid-current-compose.yml, then the same text with version: "3.8" at line 1. | Same model; second adds exactly one obsolete-version warning. | Compose Specification and Docker Compose file reference, checked 2026-09-10, cited in implementation-report.md. | version never selects a legacy schema. |
| RF-002 | service-references.yml and dependency-healthcheck.yml, with include/extends absent and present. | Complete mode errors on absent dependency and missing healthcheck. Incomplete mode downgrades potentially external missing dependency to warning with reason. | Compose services and depends_on specification, checked 2026-09-10. | Short and long forms normalize to same edge; declared health is not live health. |
| RF-003 | Port variants with ranges, bracketed IPv6, wildcard, equal/different host IP, protocol changes, omitted host port, unresolved interpolation. | Collision only when normalized host address, published range, and protocol overlap. | Compose services ports specification, checked 2026-09-10, plus tuple derivation. | Target port and host availability never decide collision. |
| RF-004 | All operators, explicit environment variants, nesting depth 8 and 9. | Operator states match Docker interpolation guide; depth 9 warns without fabricated substitution. | Docker interpolation guide/reference, checked 2026-09-10. | Value-only interpolation; keys remain literal; empty differs from unset where required. |
| RF-005 | Multi-layer fixture with syntax error, model error, model warning, advisory, and info. | Exact order, fields, counts, copy schema 1, engine version, summary, completeness, and 240-code-point excerpt cap. | Implementation and interface contracts, independently asserted sort and serialization. | Copy is deterministic and has no runtime state. |

## Edge-case matrix

| ID | Priority | Category | Setup/input | Expected system outcome | Expected user experience | Side effects allowed | Test level/file | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EC-001 | P1 | Initial UI | Open route with no query. | Empty editors, no result, submit available. | Compose editor is first tab stop; no announcement. | No request, URL mutation, storage, cookie, analytics, or clipboard read. | Browser tests/pages/docker-compose-checker/docker-compose-checker.spec.ts | R1, UI-001 |
| EC-002 | P0 | BOM/CRLF/locations | Submit bom-crlf.yml and LF equivalent. | Same model/diagnostics; BOM stripped once; locations 1-based. | Excerpt and editor text remain selectable. | No external read. | Unit tests/pages/docker-compose-checker/docker-compose-checker.test.mjs | R2 |
| EC-003 | P0 | Character safety | Submit controls.yml variants. | Legal tab/LF/CR pass; NUL, DEL, C0 fail before parse/model. | First invalid editor gets associated error; draft remains. | No evaluation, network, storage, or telemetry. | Unit and Browser | R2, UI-013 |
| EC-004 | P0 | Exact limits | Run every maximum and plus-one pair in input-limits.yml. | Max passes; plus-one returns one stable INPUT limit code and no partial summary. | Boundary recovery is precise and stale output absent. | None. | Unit docker-compose-checker.test.mjs | R2, R21 |
| EC-005 | P0 | Multiple documents | Submit multiple-documents.yml. | Reject as one document only; never merge or silently choose. | Syntax/input result; source retained. | No file or network access. | Unit and Browser | R2, R3 |
| EC-006 | P0 | YAML grammar | Duplicate keys, malformed flow, bad indent, unterminated quote, bad block scalar, alias cycle, unsafe tag. | Stable parser finding with location where available; no throw, recursion overflow, constructor execution, or semantic result. | First invalid field focused and announced once. | No code execution or external request. | Unit and Browser | R3 |
| EC-007 | P0 | Syntax isolation | Make a valid result, then submit syntax-error.yml. | Previous result, counts, model, advisories, and completeness removed. | Drafts remain; Compose editor gets focus. | No URL/storage write. | Browser docker-compose-checker.spec.ts | R3, UI-013 |
| EC-008 | P0 | Safe parser/output | Unsafe tags and strings containing HTML and shell syntax. | No tag evaluation; all text is text, never HTML. | No execution or unsafe preview. | No eval, shell, network, or file read. | Unit, static, Browser | R2, R3, R20 |
| EC-009 | P0 | Clean normalization | Submit valid-current-compose.yml. | Exact RF-001 summary, three layers, zero counts, no runtime state. | Lead precedes counts, findings, summary, provenance, limitations. | Synchronous local computation only. | Unit and Browser | R4, UI-005, UI-006, UI-009 |
| EC-010 | P1 | Compose version | Submit obsolete-version.yml, then remove version only. | Exactly one warning added/removed; no rule branch changes. | Warning is qualified with repair direction. | None. | Unit and Browser | R5 |
| EC-011 | P1 | Unknown/extensions | Submit unknown-and-extension.yml. | Extension survives; unknown key warns; wrong known type errors. | Paths and fixes stay distinct. | None. | Unit | R6 |
| EC-012 | P1 | Root shape | Submit every root-shape.yml document. | Non-mapping roots return a `model-invalid` root diagnostic; empty mapping follows fixed missing-services behavior. | Root location explicit or unavailable, never guessed. | None. | Unit | R4, R6 |
| EC-013 | P0 | Service references | Submit missing and valid short/long dependency forms. | Missing name errors in complete mode; valid names create exact edges. | Partial normalized model remains useful and source anchored. | No external file fetch. | Unit and Browser | R7 |
| EC-014 | P0 | Conditions/health | Submit dependency-healthcheck.yml and valid/invalid condition variants. | Allowed conditions only; service_healthy needs enabled declared healthcheck; no runtime health claim. | Fix names declaration to change. | No Docker/process check. | Unit and Browser | R8 |
| EC-015 | P0 | Ports | Submit all ports-and-collisions.yml variants. | Short/long syntax compares; invalid/range values error; tuple collision respects address/protocol. | Paths use ports[index]; host availability stays unknown. | No socket bind or network probe. | Unit and Browser | R9 |
| EC-016 | P0 | Resources | Missing, declared, external, bind, device, file-backed, duplicate resources. | Missing named refs error; external existence unknown; paths never read. | Result describes declarations, not host contents. | No filesystem or Docker read. | Unit and Browser | R10 |
| EC-017 | P1 | Profiles | Submit profiles.yml variants. | Names/membership visible; duplicates/empty error; active set unknown; cross-profile uncertainty warned. | Membership and selection remain separate. | No profile activation. | Unit and Browser | R11 |
| EC-018 | P0 | Incomplete composition | Submit local, absolute, relative, and URL-like include/extends refs. | Incomplete code names boundaries; no fetch/merge/read; potentially external missing refs downgrade with reason. | Lead says cannot fully resolve; partial summary remains. | No network, file, registry, or daemon. | Unit, Browser, request audit | R12, UI-004, UI-016 |
| EC-019 | P0 | Interpolation | Submit interpolation.yml with and without environment. | Every operator state matches RF-004; required missing error; unresolved warning; default info; escaped not substituted. | Token, path, location, state visible; unresolved not empty. | Only pasted environment read. | Unit | R13 |
| EC-020 | P0 | Environment precedence | Run interpolation-precedence.json with malformed/duplicate lines and env_file. | Only pasted values known; malformed/duplicate input fails; env_file never satisfies token; empty/unset operators differ. | Field remains named Interpolation environment. | No shell, .env, host file, storage, or network read. | Unit and Browser | R13, R20 |
| EC-021 | P1 | Static advisories | Submit risk-advisories.yml and clean counterpart. | Exact advisory codes/paths; all Advisory; validity unchanged; no security/runtime verdict. | Advisory layer separate and qualified. | No image, registry, or host check. | Unit and Browser | R14, R16 |
| EC-022 | P0 | Diagnostic schema/order | Multi-layer fixture plus excerpt over 240 Unicode code points. | Required fields, explicit nulls, exact ordering, trimmed/capped excerpt. | Desktop table and mobile labels expose all fields including fix. | None. | Unit and Browser accessibility snapshot | R15, UI-007 |
| EC-023 | P0 | Lead states | Input-boundary, syntax, root-model, model-error, incomplete, advisory-only, and clean fixtures. | Lead maps exactly to state contract; never only Valid YAML, safe, ready, or runtime healthy. | Answer first, layers next, limits after summary. | None. | Unit and Browser | R16, UI-004, UI-010 |
| EC-024 | P0 | Edit clears result | Result then edit, paste, undo, redo, replace-all in either editor. | Result/counts/findings/copy/completeness clear synchronously; draft/caret remain; no live validation. | One polite Inputs changed status per transition. | No URL/storage/network/analytics. | Browser | R17, UI-002, UI-012, UI-013 |
| EC-025 | P1 | Example/reset | Activate from every result and error state. | Example replaces both drafts, clears result, focuses Compose, announces loaded. Reset empties both, clears notices, removes only state, focuses Compose, announces reset. | Actions do not submit implicitly. | Only surgical replaceState for state. | Browser | R17, UI-011, UI-013 |
| EC-026 | P0 | Keyboard/field errors | Submit empty Compose, bad environment, and syntax error by click and keyboard. | First invalid field has aria-invalid, associated error, and focus; Enter in Compose inserts newline. | One actionable announcement; labels stay visible. | No hidden submit/network. | Browser | R18, UI-003, UI-011 |
| EC-027 | P1 | Engine failure | Inject deterministic parser/engine throw after both inputs populated. | Result clears; drafts remain; retry region and Try again recover. | Focus/alert follows contract without duplicate error. | No input loss/persistence. | Unit injection and Browser | R18, UI-013 |
| EC-028 | P1 | Copy report | Copy success/repeat, API failure, fallback failure, HTML-like/Unicode input. | Plain UTF-8 schema 1 includes engine, counts, completeness, summary, ordered diagnostics; failure preserves result. | Status announces; action width does not shift. | Clipboard write only after explicit action. | Unit and Browser | R19, UI-012, UI-014, UI-017 |
| EC-029 | P0 | URL state | Clean route, malformed/repeated state, unrelated query, hash. | Never decode state; remove only state; preserve query/hash; remain clean; refresh stays clean. | One neutral notice, no result focus. | replaceState only for state. | Browser history test | R12, R20, UI-012, UI-015 |
| EC-030 | P0 | Privacy boundary | Instrument requests, storage, cookies, analytics, clipboard read, picker, Docker, registry, schema, include, env, error URLs. | Zero prohibited reads/writes/requests; no input in URL/request; only explicit clipboard write allowed. | Local-only notice is truthful. | None beyond explicit clipboard write. | Production-like Browser audit and static test | R20, UI-016 |
| EC-031 | P0 | Max engine budget | Maximum fixture, 100 services, 512 resources/tokens, 1,000 diagnostics, 20 repeats. | p95 <=250 ms desktop and <=750 ms at 4x CPU; no throw, timeout, order drift, or mutation. | No loading state added. | No worker/network/cache. | Unit and Browser performance test | R21 |
| EC-032 | P1 | Repeat determinism | Every fixture 20 times with LF/CRLF and equivalent forms. | Deep-equal results, copy text, counts, order, locations, summaries; inputs not mutated. | No flicker or layout shift. | None. | Unit | R21 |
| EC-033 | P1 | Ownership/publication | Inspect worktree, route ownership, CSS, publication files. | This stage changed only this document; no route/code/fixture/test/manifest/script/dependency/DB/migration/registry; route unpublished. | No live route claim. | Read-only inspection. | Static policy/worktree check | R22, UI-020 |
| EC-034 | P1 | Labels/hierarchy | Inspect initial/result DOM at 320 and 1440px. | Required Compose editor first, optional environment second, one primary, example, reset, no hidden validation, no nested cards. | Descriptions/placeholders stay attached. | None. | Browser accessibility/DOM test | UI-001, UI-002, UI-003 |
| EC-035 | P1 | Result semantics | Render RF-005, incomplete, advisory-only, clean results. | One lead, three unique layer rows, exact counts once, all diagnostic fields, normalized summary without graph/canonical YAML, provenance/limits last. | Semantic headers and mobile labels remain in accessibility tree. | None. | Browser DOM/accessibility test | UI-004 through UI-010, UI-019 |
| EC-036 | P1 | Responsive/reflow | Long paths, codes, excerpts, service/image names, fixes at 320, 375, 760, 959, 1440px. | Rows stack below 760 with visible labels; no page overflow, clipping, overlap, hidden fix; controls stable. | Touch targets >=44px; source order preserved. | None. | Browser screenshot/style/scrollWidth test | R21, UI-008, UI-017 |
| EC-037 | P1 | Themes/focus | Initial, syntax, semantic, advisory, copy failure, engine failure in dark/light with reduced motion. | Words, borders, code, excerpts, errors, focus, live status readable without color; reduced motion honored. | No focus occlusion or color-only status. | None. | Browser visual/accessibility test | UI-018 |
| EC-038 | P2 | Static omissions | Inspect route source, module CSS, global CSS, rendered DOM. | Route selectors in docker-compose-checker.module.css; no graph/chart/score/badge/picker/formatter/art/nested cards/hidden validation. | Workbench remains shared full-width band. | Read-only. | Static page.test.mjs and Browser | UI-019, UI-020 |

## Test plan

### Pure engine and unit tests

- tests/pages/docker-compose-checker/docker-compose-checker.test.mjs implements RF-001 through RF-005 and EC-002 through EC-023, EC-031, and EC-032 first. Assert literal result objects, locations, excerpts, ordering, no input mutation, parser safety, limits, normalized tuples, interpolation states, and exact copy serialization.
- tests/pages/docker-compose-checker/fixtures/ keeps named source fixtures immutable. Add expected-results JSON only when expected values remain independent of the engine.
- tests/pages/docker-compose-checker/page.test.mjs later checks route ownership, direct YAML parser dependency, no network/storage/HTML injection, local-only boundaries, CSS ownership, workbench hooks, and forbidden UI artifacts.

### Browser tests

- tests/pages/docker-compose-checker/docker-compose-checker.spec.ts implements EC-001, EC-007, EC-018, EC-023 through EC-030, and EC-034 through EC-038 with Playwright.
- Use request interception only to fail if a request occurs. Do not mock a server result because the engine is synchronous and browser-local. Inject engine failure through a test-only seam, not a production query parameter.
- tests/pages/tools/shared/tool-workbench.spec.ts remains the shared workbench check. Add route-specific behavior only in the page test.

### Static and SEO tests

- tests/pages/docker-compose-checker/page.json will later own route, docs, implementation, fixtures, and test paths. It must remain absent until route implementation.
- Existing static and SEO gates must confirm the route remains unpublished. No route metadata, canonical, robots, sitemap, JSON-LD, database row, or migration belongs to this stage.
- A worktree policy check must confirm this stage changed only this file.

## Manual verification

| View/state | Viewport/theme | Exact check | Pass condition |
| --- | --- | --- | --- |
| Clean initial | 320, 375, 760, 1440; dark/light | Identify required input, optional input, primary action, example, reset, and no result. | Reading order is obvious; no decorative or hidden validation UI. |
| Semantic result | 375 and 1440; dark/light | State the lead and the distinct question answered by layers, counts, findings, summary, provenance, and limits. | Each region answers a different question; no repeated exact value or runtime implication. |
| Diagnostic rows | 320 and 375; dark/light | Follow severity, code, layer, path, location, excerpt, message, and fix through one long row. | Every field remains visible, labeled, wrapped, and selectable without page scroll. |
| Incomplete result | 760 and 1440; both themes | Check that include/extends reason sits beside incomplete lead. | Partial checks remain useful without merged-model validity claim. |
| Recovery | 320 and 1440; both themes | Create result, edit, submit invalid text, trigger copy failure, reset. | Drafts remain until reset; stale result clears at edit; focus and announcements are clear. |
| Boundary/privacy | 1440; both themes | Submit secret-like text, URL-like refs, unsafe tags, and maximum fixture while watching requests/storage. | No request, file read, storage write, clipboard read, execution, or runtime fabrication. |

## Test data and mocks

Use deterministic local strings only. Do not use real credentials, host paths, private URLs, project files, Docker sockets, registry access, current time, random IDs, or analytics. Secret-like values use placeholders such as hunter2-test-value, and tests assert they never leave the page. Record fixture provenance beside expected data: source document, checked date, Compose Specification URL, schema snapshot identifier, parser package version after implementation, and whether behavior is documented or independently derived.

The maximum fixture generator belongs only in the later unit test. It uses fixed indices and never generates expected diagnostics. Browser tests use fixed fixture text and inspect request logs, URL, storage, focus, DOM, and screenshots. Clipboard success captures the exact in-memory string. Clipboard API and fallback failure both use deterministic rejected promises.

## Plan completion criteria

- [x] Four ready-artifact fingerprints are recorded.
- [x] Every P0 and P1 case has setup, outcome, UX/recovery expectation, side-effect rule, requirement ID, deterministic fixture or manual procedure, and future test file.
- [x] YAML grammar, BOM/CRLF/control characters, multiple documents, limits, duplicate keys, aliases/tags, root shape, version, unknown keys, and extension fields have exact fixture coverage.
- [x] Services, depends_on forms/conditions, healthchecks, ports/collisions, resources/external resources, profiles, interpolation operators and precedence, unread env_file, incomplete include/extends, and advisories have exact fixture coverage.
- [x] Diagnostic fields, ordering, counts, summary, provenance, completeness, copy output, and prohibition on fabricated runtime state are asserted.
- [x] Privacy, no-network, no-storage, URL-state, copy fallback, deterministic repeat, performance, accessibility, responsive, theme, and recovery tests are assigned.
- [x] Every UI acceptance criterion has automated P0/P1 coverage or a repeatable manual comprehension check.
- [x] The later builder has an ordered focused-test plan and full-quality-gate plan.

## Open questions and blockers

None. The approved YAML package version and checked-in Compose Specification snapshot identifier remain implementation-stage provenance values. If either choice changes parsing, normalization, diagnostics, limits, interpolation, or incomplete-model behavior, stop the build and refresh this document and its fingerprints through the upstream contract workflow.

Status: ready
Changed file: content_docs/docker-compose-checker/edge-cases-and-tests.md
