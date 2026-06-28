# Self-Host App Data Workflow

This temporary guardrail file defines how to build and test the workflow for gathering and maintaining data for self-hosted app pages only. version127 may grow into blogs, tools, hardware guides, RAID calculators, and other surfaces later, but this workflow is scoped to the self-hosted apps directory and app detail pages.

This is not the final long-term workflow documentation. After the scripts and process are proven, replace or split this into cleaner durable docs, likely:

- Agent-facing app content instructions.
- Agent-facing self-host app automation instructions.
- Script-level command docs.

Current working files:

- `content/categories.json` is the local source for category slugs, names, descriptions, and icon keys.
- `content/app-drafts/*.generated.json` is for generated GitHub-first drafts and subagent test output.
- `content/apps/*.json` is for reviewed app records that can pass strict validation and be upserted.
- `scripts/self-host-apps/README.md` documents the runnable script commands.

## Goals

- Make adding one app faster without lowering quality.
- Keep GitHub-derived facts automated where they are reliable.
- Keep version127 editorial writing human-reviewed and original.
- Avoid seed-SQL editing for normal app content updates.
- Make local JSON the working source for app content before database upsert.
- Keep every database write scoped to the app being added or updated.
- Build a workflow that a future agent can follow from docs with minimal prompting.
- Use subagents only to test the workflow, not to design or refine it.
- Test on big, mid-size, small, and sparse-data projects so the workflow handles real variance.
- Automate as many reliable steps as possible while keeping uncertain or editorial fields manual.
- Prefer accuracy over speed. The target is roughly 5 minutes per normal app only after the workflow proves itself.

## Hard Rules

- A question is not a task. If the user asks a question, answer it and do not change files.
- Do not make file, database, or process changes unless the user explicitly asks for action.
- Local database writes are allowed when explicitly testing import/upsert scripts.
- Local database writes must be scoped to the app or category data being tested and must be clearly reported.
- Production database writes are not allowed unless the user explicitly asks for production.
- Do not mark the workflow complete while any subagent, script, server, or command needed for the task is still running.
- Do not let subagents make overlapping changes.
- Do not run multiple writing subagents at once unless their output paths and database behavior are fully isolated.
- Do not ask subagents to refine docs, scripts, schema, or process.
- Do not let subagents write to the database unless that specific isolated workflow test requires it and the main agent is monitoring it.
- Do not use broad website scraping as the primary data source.
- Do not copy website, README, docs, or video text into version127 copy.
- Do not publish raw automation output as final app content.

## Source Priority

Use GitHub first for structured automation:

- Repository metadata.
- License.
- Stars, forks, issues, pull requests.
- Releases and release count.
- Last commit and commit activity.
- Topics and primary language.
- Dockerfile and compose-file hints.
- README links as candidates only.
- Repo image/icon candidates only.

Use targeted manual verification for:

- Official website.
- Official docs.
- Install docs.
- Docker image or package page.
- Demo link.
- Screenshots.
- Client apps.
- YouTube video.
- Deployment dependencies.

## Automation Responsibilities

Scripts should help create and maintain structured app JSON:

- Generate a draft from a GitHub repo.
- Refresh GitHub stats on an existing app JSON.
- Validate app JSON before database writes.
- Upsert one app JSON into the local database for testing.
- Support production upsert later, but only behind explicit user approval.

Automation may suggest values, but it should leave uncertain fields blank, null, or unknown.

Current commands:

```sh
npm run selfhost:draft -- --repo owner/name
npm run selfhost:github -- --file content/apps/name.json
npm run selfhost:validate -- --file content/apps/name.json
npm run selfhost:upsert -- --file content/apps/name.json
```

Use draft validation for incomplete generated files:

```sh
npm run selfhost:validate -- --file content/app-drafts/name.generated.json --draft
```

Use dry-run before the first real local database upsert for a new app:

```sh
npm run selfhost:upsert -- --file content/apps/name.json --dry-run
```

Do not move a generated draft from `content/app-drafts` to `content/apps` until the manual fields are written, candidate links are verified, and strict validation passes.

## Manual Responsibilities

The agent must manually write or verify:

- App name and capitalization.
- Description.
- Categories.
- Get started.
- Verdict.
- Good fit.
- Watch outs.
- Known issues.
- Storage and data notes.
- Backup details.
- RAID notes.
- Hardware recommendation.
- Final screenshots.
- Final links.
- Data confidence and notes.

All editorial copy must be original version127 writing for smart beginners.

Manual verification should use official sources first. A product website can be opened to verify a specific official link, screenshot, docs page, or install page, but broad website scraping should not be used as an app-draft source.

## Subagent Testing Protocol

Subagents are workflow testers.

The main agent builds and refines scripts and docs. A subagent should only be asked to run the workflow as written and create a test app record.

Use minimal prompts, such as:

```text
Follow the version127 self-host app data workflow and add data for owner/repo. Return what you did, what file you created, commands run, and anything uncertain.
```

Do not give the subagent extra hidden instructions beyond the workflow docs. The point is to see whether the workflow itself is clear.

### Workflow Test Mode

When a task is delegated by a main agent for workflow testing, the subagent must treat it as test mode unless the prompt explicitly says to promote the app into the reviewed dataset.

In workflow test mode, the subagent should:

- Create or refresh the generated GitHub draft under `content/app-drafts/<slug>.generated.json`.
- Create the reviewed test record under `content/app-drafts/subagent-<slug>.reviewed.json`.
- Run strict validation against that reviewed test record.
- Run local database upsert with `--dry-run` only.
- Report whether a real local upsert would likely pass.

In workflow test mode, the subagent must not:

- Write to `content/apps`.
- Run a committed database upsert.
- Edit scripts, schema files, migrations, package scripts, or workflow docs.
- Clean up unrelated files.

Only the main agent should decide whether a subagent output becomes a reviewed `content/apps/*.json` record.

After each subagent run, the main agent must check:

- Did the subagent use the intended workflow?
- Did it create only the expected file or output?
- Did it leave placeholders?
- Did validation pass?
- Did it choose correct categories?
- Did it confuse candidate links with verified links?
- Did it copy source text?
- Did it make unsupported claims?
- Did it correctly flag uncertainty?
- How long did it take?

Then the main agent refines the workflow, scripts, or docs based on observed mistakes.

Run a new subagent only after the previous subagent output is reviewed and any needed workflow fixes are made.

Subagent prompts should stay vague on purpose. The workflow docs and scripts should carry the detail. If a subagent needs extra explanation to avoid a mistake, improve the workflow docs instead of giving the next subagent a more detailed prompt.

## Completion Criteria

The workflow is not considered done until:

- Core scripts exist and pass basic checks.
- Local database upsert has been tested with scripts.
- At least several varied apps have been tested.
- Tests include mature large projects, mid-size projects, small new projects, and projects with sparse or messy metadata.
- Subagent workflow tests have been reviewed.
- Mistakes from tests are reflected in docs or automation.
- Generated clutter has been removed or clearly isolated.
- Every subagent is finished or closed.
- The user gets a clear summary of what changed and what remains uncertain.
