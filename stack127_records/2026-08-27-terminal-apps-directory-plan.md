# Terminal apps directory record

## Decision

stack127 will build a broad terminal apps directory at `/cli-apps`.

This directory is separate from `public.open_projects`. It may contain open-source, source-available, freeware, freemium, paid, hosted, and closed-source terminal apps. An optional link to an open project may be kept when one exists, but the terminal app record owns the directory entry.

The goal is exhaustive discovery with clean publication. The collection workflow should gather every candidate it can find from the approved sources, preserve duplicates and unresolved records for review, and publish only records with enough verified information.

The first release will contain:

- one directory at `/cli-apps`
- a searchable and filterable server-rendered app list
- a separate candidate queue for discovered apps that are not yet ready to publish
- source and verification data for every published record
- no requirement that an app be open source

The first release will not contain one indexable page for every app, comparison pages, installation scripts, user accounts, submissions, ratings, or a newsletter. Individual app pages can be added later when the directory has enough verified coverage and search demand.

## What `/cli-apps` does

The directory helps a visitor find a terminal application by what it does, where it runs, how it installs, and whether it is maintained.

The page should contain:

- a clear title explaining that it is a directory of terminal apps
- a short explanation that the directory includes open and closed tools
- a searchable list of apps
- filters for app type, category, platform, language, install method, pricing, license, and maintenance
- sorting by name, popularity, recent release, and maintenance health
- concise summaries and official links
- a visible distinction between verified published records and unknown values

The main content should be a structured list or card grid with repeated facts shown as fields. It should not become a long article about command-line software.

## Scope

Include end-user software that is run from, inside, or directly alongside a terminal:

- command-line utilities
- TUI applications
- terminal emulators
- shells and shell environments
- terminal multiplexers
- shell prompts and terminal customization tools
- command launchers and environment managers
- developer and DevOps CLIs
- cloud, database, networking, security, media, and productivity CLIs
- local AI tools and AI coding agents used from a terminal
- terminal file managers, editors, monitors, browsers, mail clients, and games
- official vendor CLIs for commercial or hosted products

Do not publish libraries, SDKs, TUI frameworks, shell builtins, random scripts, GUI apps that merely expose a developer CLI, or packages that are not intended for direct end-user use. Keep those as excluded candidates with a reason when they appear during discovery.

## Data model

Create a dedicated `public.terminal_apps` table. Do not force closed or hosted tools into `public.open_projects`.

Each published terminal app should support at least:

- stable slug
- display name
- aliases and command names
- one-sentence summary
- primary type and additional types
- one to three reviewed categories
- supported platforms
- implementation language when known
- install methods
- official website
- official documentation URL
- repository URL when one exists
- source model: open source, source available, closed source, freeware, or unknown
- pricing model: free, freemium, paid, subscription, usage based, or unknown
- latest version and release date when available
- GitHub stars and last commit date when a repository exists
- maintenance status
- icon or generated fallback
- screenshot URL when available and useful
- last verified date
- provenance for each imported fact

Keep an optional `open_project_id` relationship for records that also exist in `public.open_projects`. This relationship must not be required for publication.

Create a separate discovery queue, preferably `public.terminal_app_candidates`, with:

- discovered name
- canonical URL candidate
- source URL
- source type
- raw source payload or source snapshot reference
- normalized dedupe key
- discovery date
- candidate status: discovered, duplicate, needs review, enriched, published, excluded, or failed
- exclusion or review reason
- linked published record when one exists

The candidate queue is important. It lets us be broad without polluting the public directory with unverified or duplicate records.

## Discovery sources

Use all of the following as discovery inputs. Do not treat their descriptions, licenses, stars, versions, or categories as final facts without checking the official project source.

### Direct terminal directories

- [TerminalDock](https://terminaldock.com/), including its [tools directory](https://terminaldock.com/tools). Useful for kinds, categories, tags, languages, platforms, features, and terminal-focused records.
- [Terminal Trove](https://terminaltrove.com/). Useful for TUI and terminal tool discovery, categories, languages, screenshots, and newly added tools.
- [TerminalApps](https://terminal-apps.dev/). Useful for TUI discovery, GitHub links, stars, language, license, and summaries.
- [CLI Directory](https://www.cli.directory/). Useful for task-oriented CLI discovery and install signals.
- [CLIs.dev](https://clis.dev/). Useful for category-based CLI discovery and install information.
- [CLI Radar](https://cliradar.com/). Useful for trending CLI, TUI, and terminal AI agent discovery.
- [getcli.dev](https://getcli.dev/). Useful for curated CLI records and install methods.
- [clitui.com](https://clitui.com/). Useful as an additional CLI and TUI discovery source when accessible.

### Community-maintained lists

- [awesome-cli-apps](https://github.com/agarrharr/awesome-cli-apps)
- [awesome-cli-apps-in-a-csv](https://github.com/toolleeo/awesome-cli-apps-in-a-csv), which currently exposes a large CSV-backed catalogue with categories and source links
- [awesome-modern-cli](https://github.com/thegdsks/awesome-modern-cli)
- [awesome-tuis](https://github.com/rothgar/awesome-tuis)
- [GitHub CLI topic](https://github.com/topics/cli)
- [GitHub TUI topic](https://github.com/topics/tui)
- [GitHub terminal topic](https://github.com/topics/terminal)
- [GitHub command-line topic](https://github.com/topics/command-line)
- [GitHub terminal emulator topic](https://github.com/topics/terminal-emulator)
- [GitHub shell topic](https://github.com/topics/shell)

### Package and distribution catalogues

Use these for additional discovery and install-method evidence. They are not proof that a package is a useful end-user terminal app.

- [Homebrew formulae](https://formulae.brew.sh/formula/)
- [Homebrew casks](https://formulae.brew.sh/cask/)
- [WinGet package source](https://github.com/microsoft/winget-pkgs)
- [Scoop](https://scoop.sh/)
- [NixOS packages](https://search.nixos.org/packages)
- [Arch Linux packages](https://archlinux.org/packages/)
- [Ubuntu packages](https://packages.ubuntu.com/)
- [Repology](https://repology.org/)
- [npm](https://www.npmjs.com/)
- [PyPI](https://pypi.org/)
- [crates.io](https://crates.io/)
- [Go Packages](https://pkg.go.dev/)

### Community discovery

Use community pages to find obscure or newly released tools, then verify each candidate elsewhere:

- [r/commandline](https://www.reddit.com/r/commandline/)
- [r/tui](https://www.reddit.com/r/tui/)
- [r/terminal](https://www.reddit.com/r/terminal/)
- GitHub releases, discussions, trending repositories, and topic pages

### Official verification sources

For each candidate that may be published, prefer the official website, official documentation, official repository, official release page, and official package listing. Use the source that owns the fact, not a directory that copied it.

## Exhaustive collection rules

The collection task must be an exhaustive best-effort crawl of the approved source set, not a small hand-picked seed list.

The agent must:

- process every available page, API result, CSV row, sitemap entry, topic page, and package result that the source exposes
- continue through pagination until the source is exhausted or rate-limited
- record the source, URL, timestamp, and collection result for every candidate
- preserve candidates that are duplicates, incomplete, inaccessible, ambiguous, or excluded
- merge duplicates only after retaining every source URL and alias
- never silently discard an app because it is small, unpopular, closed source, commercial, or difficult to classify
- never stop at an arbitrary limit such as 100, 500, or 1,000 records
- record rate limits, blocked pages, failed requests, and unsupported source formats
- produce a source coverage report with discovered, deduplicated, excluded, enriched, published, and failed counts
- state clearly that the result is exhaustive across the attempted sources, not proof that every terminal app in existence has been found

## Data quality rules

- Use official names and official URLs.
- Keep summaries concise, original, and factual.
- Do not copy directory descriptions as public copy.
- Keep open and closed source status separate from pricing status.
- Do not infer a license from a repository badge, package manager label, or directory entry alone.
- Do not call an app active, maintained, secure, official, or agent-ready without evidence.
- Use `unknown` or `null` instead of guesses.
- Preserve source provenance and last-verified dates.
- Treat package names and executable names as aliases, not automatically as product names.
- Do not publish a record that has no reliable official URL or source page.

## Implementation order

1. Read this plan and inspect the existing self-host apps directory, page registry, database conventions, scripts, tests, and design system.
2. Research and validate the source access methods.
3. Add migrations and schema for `terminal_apps`, `terminal_app_candidates`, and provenance if needed.
4. Build a repeatable discovery script that imports candidates from the approved sources without arbitrary caps.
5. Build normalization, deduplication, exclusion, enrichment, and publish workflows.
6. Populate the first complete data batch and generate a source coverage report.
7. Build `/cli-apps` using the existing directory shell and visual patterns.
8. Add the ownership manifest, page brief, tests, route registry entry, and SEO checks.
9. Verify server-rendered records, filters, links, mobile layout, unknown values, and large-result behavior.
10. Run the relevant quality gates and report all incomplete or blocked source work.

## Explicit non-goals for the first version

- no requirement that records be open source
- no forced reuse of `public.open_projects`
- no user-submitted records
- no ranking claim that implies objective quality
- no copied descriptions from competitor directories
- no per-app SEO pages until the directory data and coverage are trustworthy
- no automatic publication of every scraped candidate
- no production deployment as part of this task

## Research notes

Research date: 21 August 2026.

Search backend: web connector.

Browser backend: not used for interactive competitor QA in this planning pass. Direct pages were inspected through the web connector. The implementation agent must not describe this research as a complete browser audit.

The inspected sources show a fragmented but useful landscape. TerminalDock combines kinds, categories, tags, languages, platforms, features, and release-oriented discovery. Terminal Trove and TerminalApps are especially useful for TUI discovery. The CSV-backed awesome list is useful for breadth and category expansion. CLI Directory, CLIs.dev, CLI Radar, and getcli.dev add task-oriented and current CLI discovery. None of these sources should be treated as a complete canonical database.
