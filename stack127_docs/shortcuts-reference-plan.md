# Keyboard shortcuts reference plan

## Decision

stack127 will build a focused keyboard shortcuts reference, not a copy of the full AltPlusCtrl site.

The first version will contain:

- one directory at `/shortcuts`
- one reference page for each selected app at `/shortcuts/<app-slug>`
- one cheat sheet generator at `/shortcuts-cheatsheet-generator`

The cheat sheet generator is a tool route. Its page source belongs under:

```text
app/(site)/(tools)/shortcuts-cheatsheet-generator/
```

The first version will not contain comparison pages, individual shortcut pages, separate shortcut categories, a shortcut blog, paid custom cheat sheets, donations, or newsletter features.

## What `/shortcuts` does

`/shortcuts` is the directory and entry point for the reference.

It should help a visitor find an app quickly and understand which platforms and shortcut groups are covered. It should link directly to the selected app pages.

The page should contain:

- a clear title explaining that it is a keyboard shortcut directory
- a short explanation of the reference's scope
- a searchable or filterable list of apps when the list becomes large enough to need it
- platform information for each app
- the app's main category or use case
- links to each app reference page
- a small link to the cheat sheet generator

The directory should be primarily a structured list or table. It should not become a collection of decorative cards or a long article about keyboard shortcuts.

## What each `/shortcuts/<app-slug>` page does

Each app page is the complete shortcut reference for one app. All useful shortcut information stays on this page. Individual actions may have in-page anchors for navigation, but they do not become separate indexable URLs.

Each app page should contain:

- the app name and a concise explanation of who the reference is for
- supported platforms, such as Windows, macOS, or Linux
- platform-specific key columns where the combinations differ
- shortcut tables grouped by meaningful tasks
- short notes for important differences, conflicts, or limitations
- links to related apps in the directory
- a link to generate a cheat sheet for the app
- a last-verified or source note when the data depends on a version or official documentation

The main content should be tables. Sentences should explain judgment, platform differences, and confusing behavior. They should not repeat every row in prose.

Possible groups include navigation, editing, search, window management, terminal work, panels, tabs, files, and advanced actions. The exact groups should follow the app rather than forcing every app into the same taxonomy.

## What `/shortcuts-cheatsheet-generator` does

The generator should let a visitor:

1. choose one or more supported apps
2. choose a platform when the app has platform-specific shortcuts
3. choose the shortcut groups to include when useful
4. preview the resulting cheat sheet
5. print or save it as a PDF from the browser

The first version should work without an account, email address, payment, or server-side file upload. It should reuse the same structured shortcut data as the directory and app pages.

The generated output should be designed for printing rather than treated as a screenshot of the website. The tool page should show a real preview of the final artifact and keep the interactive controls separate from the printable result.

## Initial app scope

The first release has two app groups.

### Core 20 to research and finalize

These are the working candidates from the initial Stack127-focused shortlist. They are not final until demand, relevance, shortcut depth, and source quality have been checked.

1. Visual Studio Code
2. Cursor
3. GitHub
4. Docker Desktop
5. Windows Terminal
6. PowerShell
7. iTerm2
8. Vim
9. Neovim
10. Google Chrome
11. Mozilla Firefox
12. Windows
13. macOS
14. Linux GNOME
15. Microsoft Excel
16. Google Sheets
17. Gmail
18. Slack
19. Notion
20. Figma

The final 20 should be selected using a simple scorecard:

- relevance to stack127 readers
- current search demand and user need
- number and usefulness of real shortcuts
- quality of official documentation
- platform coverage and verification confidence
- value to the cheat sheet generator

### Explicit additional app candidates

The following apps are also part of the requested initial scope and should be evaluated alongside the core 20:

- Claude Code
- Codex
- OpenCode
- Grok Build
- Pi coding agent
- Brave Browser
- Ghostty terminal
- Zed IDE
- OrbStack

If every explicit addition is approved, the first release may contain up to 29 app pages: the finalized core 20 plus these nine additions. The additions should not be removed merely to preserve an arbitrary count of 20.

Before publication, verify the official product name, current shortcut support, supported platforms, and official documentation for each addition. If a product has few meaningful shortcuts, it can remain a later candidate even if its name is included in this plan.

## Data contract

The directory, app pages, and generator must use one structured source of truth.

Each app record should provide at least:

- stable app slug
- display name
- category or use case
- supported platforms
- short introduction
- shortcut groups
- shortcut action name
- key combination for each supported platform
- concise explanation or caveat where the action is easy to misunderstand
- official source URL or verification reference
- app version or platform context when it affects accuracy
- last verified date

The data should make incomplete coverage visible. Unknown or unverified values should remain unknown rather than being filled with guesses.

Shortcut rows do not need their own routes. They remain structured records used by the app page and generator.

## URL and publication rules

The canonical public routes are:

```text
/shortcuts
/shortcuts/<app-slug>
/shortcuts-cheatsheet-generator
```

There will be no `/shortcuts/apps` route in this plan.

The directory and generator are separate page responsibilities:

- `/shortcuts` discovers and explains the reference
- `/shortcuts/<app-slug>` provides the full app reference
- `/shortcuts-cheatsheet-generator` creates a printable artifact

Each published app slug must be explicitly registered in `public.stack127_pages` so it can be indexable and appear in the sitemap. App routes that exist in code but are not ready should remain unpublished according to the normal Stack127 route rules.

Route files must not own metadata, canonical URLs, robots rules, sitemap logic, or page JSON-LD. Those remain centralized in the existing Stack127 systems.

## Visual and content format

### Directory

Use a compact, searchable table or list. Repeated facts belong in columns or rows. The directory needs only a few sentences explaining what is covered and how the app pages differ.

### App reference

Use task-based shortcut tables with platform columns. Add short prose only for platform differences, application-specific behavior, and the few mistakes that a table cannot explain.

Use in-page navigation when the table is long. Do not create separate pages just to make the table shorter.

### Cheat sheet generator

Use a real printable preview. The visitor should be able to see what will be printed before saving it. The browser can handle the first version through print CSS and `window.print()`, with a separate PDF dependency considered only if browser printing cannot meet the output requirements.

Marker art is optional and should only be used if it explains a real concept, such as why the same action differs across platforms. It should not decorate the directory or replace exact shortcut tables.

## Implementation order

1. Research and finalize the core 20, while verifying the explicit additions.
2. Define and populate the structured shortcut data contract.
3. Create the `/shortcuts` directory and its ownership manifest.
4. Build a small first batch of app pages and verify the page format.
5. Expand the approved app set in batches.
6. Build the cheat sheet generator from the same data source.
7. Publish only complete, source-checked app pages.
8. Review search usage and visitor behavior before adding more apps or new page types.

## Explicit non-goals for the first version

The following are deliberately out of scope:

- comparison pages
- one-page-per-shortcut SEO content
- thin category landing pages
- a large blog about keyboard shortcuts
- paid custom cheat sheet ordering
- donations and newsletter infrastructure
- copying AltPlusCtrl's branding, copy, page layouts, or full catalogue

The goal is a small, trustworthy reference with app pages that are useful on their own and a generator that turns those pages into a practical printed reference.

