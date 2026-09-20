# Tool pipeline

This contract governs new tools and scoped improvements to existing tools. Stage documents explain decisions. The acceptance record connects those decisions to the code, database content, and checks actually reviewed. A ready report or a valid JSON file alone never proves that a tool works.

## Ownership and sequence

The main agent keeps the model selected by the user and owns scope, stage review, coordination, and the final handoff. It must create every worker itself with an explicit model and reasoning setting. Do not rely on inherited models, global defaults, skill metadata, or a worker to delegate its own stage. If an exact model or reasoning setting is unavailable, stop that stage and report it. Do not substitute another model silently.

| Work | Exact spawn model | Exact reasoning | Output |
| --- | --- | --- | --- |
| Competitor analysis followed by technical research | `gpt-5.6-luna` | `max` | One competitive report with operated competitors, primary sources, technical truth, and feasibility |
| Product plan, then interface plan in one retained session | `gpt-6-astra` | `low`, shown as Light in the Codex UI | Implementation report, brief, interface contract, coverage and mode decisions |
| Test design, then technical implementation in one retained session | `gpt-5.6-luna` | `max` | Test contract, failing tests, engine and interface, passing checks |
| Content plan, then public wording in one retained session | `gpt-6-astra` | `low`, shown as Light in the Codex UI | Writing plan and reviewed title, introduction, usage guide, supporting content |
| Content, figure, route, and database integration | `gpt-5.6-luna` | `max` | Applied reviewed content, registered figures, route integration, integration checks |
| Complete-page audit, fixes, and retesting | `gpt-5.6-sol` | `high` | Technical, interface, content, media, accessibility, responsive, data, and evidence audit with corrected findings |

The main agent passes `fork_turns: "none"` unless a bounded stage needs a small, stated slice of recent context. Every spawn passes both `model` and `reasoning_effort`. For Astra, the API value is `low`; Codex presents that setting as Light. The main agent starts each session, reviews the first skill's artifact and runs its gate, then continues the same worker into the paired skill. Workers never start another pipeline worker.

Astra authors public sentences through the writing-only skill. Luna applies the approved words through the separate content-integration skill without silently rewriting their meaning. Sol audits the complete integrated page once, fixes every confirmed issue within scope, and reruns the affected tests and flows. If the main agent finds a remaining issue, it returns that issue to the same Sol session. The main agent reviews every boundary, runs the acceptance gates, and performs the final visual handoff.

Keep dependent stages sequential. Competitor operation starts the Luna research stage and technical research continues from those observations. Product planning requires the completed research; interface planning requires a current product contract; tests and build require the interface decisions. Stabilize the tool before final content planning. Audit the integrated page and repeat affected checks after fixes.

Research, product, interface, tests, engine, usage, content, media, and integration each record their own feasibility decision. At every stage, reconsider whether the promised outcome is feasible with available sources, APIs, permissions, fixtures, renderer support, performance, and maintenance capacity. A core promise that needs a new paid API, account, crawler, scheduled refresh, background worker, queue, storage system, review operation, maintained dataset, or other unapproved ongoing system is blocked. Do not build that infrastructure, replace the promise with a stale snapshot, or present a demo as a finished tool.

Record a discovered blocker immediately, including affected requirements and evidence. Preserve independent authorized work, but stop every dependent stage. The main agent must return the decision to the user with two to four concrete options. Include, when they are honest choices: approve the required dependency or operation; change to a complete manual, static, or offline product; narrow the scope while preserving one coherent job; or keep the work blocked. State what each option delivers and any cost, maintenance, account, or approval it introduces. Do not choose for the user when the choice changes the requested core promise. An unavailable fixture does not become a pass because the UI looks correct.

## What planning must decide

Inventory every input, action, result, important assumption, and explanation. Give each a stable ID. Keep existing `R*`, `UI-*`, and `COPY-*` IDs where they already identify the same requirement. State the expected observable behavior and which check will establish it. Omitted items need a reason; they do not need invented tests.

Choose a format for each explanation before drafting. Supported choices include a sentence, ordered or unordered list, table, exact chart, conceptual marker figure, diagram, screenshot, and interactive output. Lists are appropriate for steps, alternatives, or separate conditions. They are not an excuse to fragment a connected explanation. A chosen medium is required until the owner changes the plan and its fingerprints. A writer cannot replace a planned table or figure with prose merely because prose is easier to integrate.

Media coverage records the question answered, its chosen format, placement, associated requirement, and rendered check. Verify the actual rendered list, rows, chart, figure, or screenshot at desktop and narrow widths in both themes. A Markdown token or imported component proves only that a reference exists. Inspect readability, meaningful labels, overflow, and whether the medium communicates the planned relationship. No medium has a quota.

### Optional basic and advanced modes

Every tool records `single`, `disclosure`, or `basic-advanced`, with a reason. Single mode is the default. Disclosure keeps one input model and may collapse optional refinements or evidence; active result-driving assumptions stay visible in a summary and required decisions stay in the main flow. It does not create a second mode. Split modes only when a common task can use a coherent set of explicit assumptions while advanced controls serve a distinct refinement need.

Both modes call the same engine with the same normalized input contract. Basic mode shows the active result-driving assumptions and how to edit them, even if it presents a fixed assumption summary instead of every control. Required user decisions remain visible. Never silently reset or continue using hidden customized values.

A split-mode contract must define the input mapping, basic assumptions and their sources, what the switch retains or resets, how custom advanced values appear in basic mode, validation and stale-result behavior, focus and announcement, reset, shared URL restoration, and equivalent-input parity. Prefer retaining the values and showing a visible customized-assumptions summary with an edit action. If basic mode requires defaults, require an explicit reset action before replacing customized values. Tests must prove parity and both switching directions, including invalid and restored state. Do not add modes solely to hide a crowded form.

## Page content and safe figures

The server-rendered reading order is title and short introduction, complete interactive workbench including results, usage guide, then supporting content. `usage_markdown` is a separate database field in `stack127_tool_pages`. It explains meaningful input choices, running a representative task, and reading the answer. It must not appear between the form and its results.

Render `usage_markdown` and `content_markdown` as one continuous article with shared reading width and heading rhythm. Do not wrap the usage guide in a card, insert a decorative divider, or require every tool to use the same heading. Supporting content explains concepts, limitations, verification, and related next steps without repeating the guide. The usage guide's length follows the task's difficulty.

Database content remains the only live copy. Reviewed temporary files may supply the content update command; permanent evidence stores hashes, revision, checks, and scope rather than a second live Markdown copy. A copy-only change increments `content_revision`, not `tool_version`. Functional changes follow the version workflow in [tool-pages.md](tool-pages.md). Production writes and publication remain separately authorized operations.

Markdown may reference only explicitly registered, spec-backed figures through the shared renderer's documented syntax. The registry maps a stable identifier to an approved figure type and local spec/artifact. Markdown must never select arbitrary component names, import paths, local files, executable code, or raw HTML. Validate unknown IDs, wrong types, missing specs, and missing generated assets before integration succeeds. Keep captions and accessible descriptions useful; exact values belong in clean charts or tables, not marker art. The renderer and registry contract in [tool-pages.md](tool-pages.md) owns the actual syntax.

## Acceptance record

Use `content_docs/<slug>/pipeline-acceptance.json`. Its machine schema belongs at `scripts/stack127/tool-pipeline/acceptance.schema.json`; its validator belongs at `scripts/stack127/tool-pipeline/validate-acceptance.mjs`. These paths define the implementation contract. Their existence and passing tests must be checked before claiming enforcement is available.

The record is deliberately scoped. It may accept a guide retrofit without accepting the entire historical engine. List what was authored or changed and what remains outside the claim. Register `pipeline-acceptance.json`, its mode contract, and its evidence directory through the page ownership manifest. Final validation rejects an unregistered record. Keep evidence under `content_docs/<slug>/pipeline-evidence/`, with secret-free logs and screenshots. The acceptance file does not hash itself.

Use these fields in schema version `1`. Object schemas reject unknown properties so misspelled fields cannot silently disappear. All IDs are unique within their array; all referenced IDs must exist. Hashes are lowercase SHA-256 of exact file bytes unless the canonical target digest rule below applies.

| Field | Required shape and meaning |
| --- | --- |
| `schemaVersion` | Integer `1` |
| `route` | Flat canonical path such as `/punycode-converter`, matching its directory and ownership manifest |
| `scope` | `{kind, owns, excludes}`. Kind is `new` or `retrofit`; `owns` is a nonempty array drawn from `research`, `product`, `interface`, `tests`, `engine`, `usage`, `content`, `media`, `integration`. Exclusions are concrete strings describing unverified or unchanged work. A new tool owns every stage that applies. |
| `status` | `draft`, `blocked`, or `accepted`. Validator computes whether an acceptance claim is permitted. |
| `authors` | Nonempty array of `{stage, model, reasoning, session}`. Worker stages are `research`, `product`, `interface`, `test-design`, `build`, `content-plan`, `content`, `integration`, and `audit`. Product and interface share one Astra session; test design and build share one Luna session; content planning and writing share one Astra session. Record actual assignments, not intended assignments. The validator derives required roles from scope and enforces the exact model and reasoning table above. |
| `target` | `{commit, files, inputs, content, digest}` as specified below. Commit is a full Git SHA naming the base; file hashes describe uncommitted work too. |
| `feasibility` | Array of `{stage, status, reason, evidenceIds, options}`. Status is `feasible` or `blocked`. Include each owned stage and any later discovery that changes feasibility. A blocked entry has two to four concrete decision options; a feasible entry omits `options`. Do not delete an unresolved blocker. |
| `mode` | `{decision, rationale, contractPath}`. Decision is `single`, `disclosure`, or `basic-advanced`; path identifies the reviewed contract. |
| `coverage` | Nonempty array of `{id, kind, requirement, disposition, reason, checkIds}`. Kind is `input`, `output`, `media`, `usage`, or `requirement`; disposition is `required` or `omitted`. Required items need checks; omitted items need a reason. Media requirements name format and placement in their requirement text. |
| `checks` | Array of `{id, kind, required, status, targetDigest, evidenceIds, reason}`. Kinds and required checks are defined below. Status is `pending`, `passed`, `failed`, or `not-applicable`. A reason is required for failure or inapplicability. |
| `evidence` | Array of `{id, kind, author, recordedAt, targetDigest, path, sha256}` with kind-specific fields below. `recordedAt` is an ISO timestamp, author references a session in `authors`. |
| `findings` | Array of `{id, severity, status, description, checkIds, fix, recheckEvidenceIds}`. Severity is `P0`, `P1`, or `P2`; status is `open`, `fixed`, or `deferred`. Fix is null until implemented, then `{paths, description, targetDigest}`. A fixed finding needs current recheck evidence from the Sol audit session after its correction. |

### Target fingerprints

`target.files` is a sorted nonempty array of `{path, sha256}` for owned source, tests, shared dependencies affecting rendering or calculation, figure registry/spec/assets, and the page manifest. Paths are repository-relative regular files. Reject absolute paths, traversal, duplicate paths, and symlinks escaping the repository. At minimum include the route, its imported tool implementation, shared content renderer and data loader when content is owned, changed relevant shared code, and the actual test files used. Missing relevant dependencies are a review failure even if an incomplete list hashes correctly.

`target.inputs` is a sorted array of `{path, sha256, validation}` for consumed planning documents. Validation is `current` or `legacy-unverified`. Current inputs must pass their existing ready-header and fingerprint validators at the claimed stage. Hashing an old report does not make it current. A required owned-stage dependency cannot remain legacy-unverified for acceptance. Retrofit records can cite historical reports as context and own a new scoped contract instead.

`target.content` is `{environment, revision, toolVersion, fields}`. Environment is `development` or `production`; revision is the observed positive `content_revision`; toolVersion is the observed semantic version. `fields` contains SHA-256 strings for `title`, `intro_markdown`, `usage_markdown`, and `content_markdown`, each computed over exact UTF-8 database text. Normalize a nullable usage field to an empty string only if that is the loader's documented behavior. Never infer a database snapshot from source files. A validator without database access can verify recorded integrity but must report that current database freshness is unverified and cannot certify final acceptance.

Compute `target.digest` as SHA-256 of UTF-8 `JSON.stringify` of `{commit,files,inputs,content}` in that exact property order. File and input entries sort by path and use the property order shown above; content and fields use the property order above. Use no whitespace or trailing newline. A changed input, owned file, content hash, revision, or version produces a new digest. Refresh affected checks against the new target. Old evidence remains history, but does not count as current acceptance evidence.

### Evidence and required checks

Command evidence adds `command` and integer `exitCode`; the referenced file contains the actual command output. Passing requires exit code zero and a meaningful command that exercises the claimed behavior. The validator never executes arbitrary commands copied from a record.

Browser evidence adds `backend`, `viewport` as `{width,height}`, `theme` as `dark` or `light`, and `scenario`. The path names a screenshot or a captured inspection report. A screenshot alone does not establish correctness or successful interaction. Attach a trace or inspection report through another evidence entry when needed. Review evidence contains the reviewer conclusions in its referenced file. Database evidence contains a secret-free receipt of environment, slug, revision, version, and the field hashes.

Every evidence path must exist, be a regular permitted file, and match its recorded hash. Every passing check must reference current evidence for the exact target digest. Timestamps and model names are provenance declarations, not cryptographic proof of execution. The reviewer must inspect outputs; a fabricated log remains a failure even if its hash is correct.

Use these check kinds and derive minimum requirements from scope. Authors cannot bypass the minimum set with `required: false`, empty coverage, or `not-applicable`.

| Kind | When required | What a pass establishes |
| --- | --- | --- |
| `contracts` | Every scope | Current owned contracts, dependency fingerprints, requirement coverage, mode decision, and scoped feasibility |
| `technical` | Engine, tests, or behavioral interface work | Authoritative normal and boundary fixtures, invalid behavior, and relevant security or failure recovery; includes regression for each corrected defect |
| `interaction` | Interface, usage, or integration work | Real representative run, input changes, invalid recovery, result reading, clean URL and applicable restored or mode-switch states |
| `content` | Usage or content work | Every meaningful input and output is explained where needed; claims match actual behavior; no guide/result duplication; correct continuous article order |
| `media` | Media work or a required media coverage item | Selected medium exists, is safe and spec-backed where applicable, and communicates its intended relationship in the rendered page |
| `rendered` | Interface, usage, content, media, or integration work | Complete page including a real result and guide at desktop and narrow widths in both themes; readable hierarchy and no page overflow |
| `database` | Usage, content, or integration work | Current row revision, version, and field hashes match the reviewed content and environment |
| `focused-tests` | Every implementation scope | Relevant page and shared regression checks pass against the current source |
| `build` | Every implementation scope | Production build succeeds |
| `repository-quality` | Every implementation scope | Repository gates were run; any failure remains visible and is classified with evidence |
| `independent-review` | Every acceptance | The Sol audit reviewed the complete claimed scope, corrected confirmed defects, reran affected tests and flows, and closed every P0/P1 finding |

Research or plan-only work can have an accepted scoped record without implementation checks, but the handoff must call it accepted planning, not a completed tool. Content-only work still exercises the real tool to establish that the guide matches its behavior; it need not claim a new engine audit.

A rendered check requires evidence covering at least one desktop viewport and one narrow viewport in both themes. The interface contract can require more widths and states. Coverage requirements may share meaningful checks, but each required input, output, medium, and usage outcome must connect to at least one relevant passing check. Merely connecting every requirement to one generic build command fails review.

Acceptance requires current evidence for every scope-derived required check, no blocked feasibility entry affecting owned work, and no open or deferred P0/P1 findings. It requires Sol audit evidence for the final target. The Sol worker records each defect, fixes confirmed findings, and adds current recheck evidence after the change. The main agent independently inspects the diff and evidence, reruns the required gates, performs the final visual check, and returns any remaining issue to the same Sol session. Safe P2 deferrals need a reason in the finding description and remain in the handoff. A failed repository-quality check remains failed even when evidence shows it is unrelated to the tool. Report that distinction, but do not mark the pipeline accepted until every required check passes.

Test the validator with stale input/code/content/evidence hashes, missing files and IDs, incomplete coverage, missing required checks, unsupported media, blocked feasibility, unclosed findings, and a fixed finding lacking recheck evidence. Also cover valid scoped planning and a valid content retrofit. Schema validation alone is not the acceptance gate.

## Existing tools and rollout

Preserve routes, publication flags, working engines, and current guides while adding support for `usage_markdown`. Existing empty usage fields render no empty heading or space. Schema availability does not mean each guide has been authored or migrated.

Inventory all actual tool routes and their database rows. Track each as not reviewed, planned, authored, integrated, or verified, with a reason for any blocker. Run `node scripts/stack127/tool-pipeline/audit-usage.mjs --environment=development` for the current row inventory. Its `authored` status means only that a nonempty guide exists; planning, integration, and verification status comes from the route's acceptance record. Review each existing guide for useful content before splitting it. Move its task-specific use instructions into `usage_markdown`, retain useful subject explanation in `content_markdown`, and remove duplicated instructions only after comparing both. Write missing guidance from the tool's real inputs and outputs. Do not generate a universal paragraph or mechanically cut at the first heading.

Scope every retrofit record to the actual change. Leave old ready reports and historical evidence unchanged unless that stage is truly reviewed again. Do not mass-rehash their headers to manufacture current certification. Existing full-pipeline validation remains strict for new tools; a new scoped acceptance path handles retrofits without pretending they have repeated historical research, test-first development, or engine verification.

Use `/punycode-converter` as the first modest pilot. It has one domain-or-URL input, local deterministic conversion, distinct Unicode and ASCII forms, copy actions, label and character tables, and explicit validation limits. This makes a focused usage guide and input/output coverage reviewable. Keep a single mode; automatic input detection already handles both conversion directions. Its current interface contract is historical context until explicitly reviewed for the scoped change.

Use `/zfs-capacity-calculator` as the complex pilot. Its topology editor, allocation chart, optional devices, compression scenario, source details, and shared state exercise the broader contract. Evaluate modes explicitly rather than enabling them automatically. Its existing interface report acknowledges missing OpenZFS version fixture receipts. A guide or renderer retrofit can pass its own scope while that external technical-verification blocker remains prominent. Do not claim full tool readiness from the retrofit.

After both pilots, continue through the complete inventory using per-tool authored guides and evidence. Shared renderer tests can be reused as dependency evidence, but each tool still needs a representative interaction, its input/output coverage, and its rendered page review. Report counts and remaining routes accurately. Infrastructure completion, guide migration, verified tool readiness, and production release are separate outcomes.
