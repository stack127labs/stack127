# Page content

Page content lives in code, beside the page's route. Data lives in the database. This split keeps content free to use any shared component, and keeps data that changes on its own, such as self-host apps, in one place for automation.

## What lives where

| In code, beside the route | In the database |
| --- | --- |
| The introduction, usage text, article content, and content blocks of tool, directory, catalog, and site pages | The publication registry, page titles, descriptions, SEO fields, card text, versions, and dates |
| | Every data record: self-host apps, TLDs, shortcuts, launch directories, and the rest |

Child pages built from records use one template in code that reads the records. Never write one content file per record.

A content change ships with a release, like code. Pages not yet moved still read their content from the database until they move.

## Files

Each page keeps its content in a `content/` folder beside its `page.tsx`:

| File | Holds |
| --- | --- |
| `content/intro.mdx` | The introduction under the title. One or two short paragraphs. |
| `content/usage.mdx` | Optional. Tool pages only: how to use the tool, shown after it. |
| `content/article.mdx` | The supporting content: how it works, examples, and questions. |
| `content/<section>.mdx` | One file per section, for pages that place content in several spots. Name each file for what it holds, such as `content/disclaimer.mdx`. |

The route imports the files and passes them to the page's layout, so TSX keeps the layout and anything interactive, and MDX keeps the words:

```tsx
import Intro from "./content/intro.mdx";
import Article from "./content/article.mdx";

<ToolPageHeader icon={…} intro={<Intro />} toolPage={toolPage} />
<CacPaybackCalculator />
<ToolPageArticle><Article /></ToolPageArticle>
```

MDX renders on the server, so pages stay static and send no extra script.

## Writing in MDX

MDX is Markdown that can hold our components. Write ordinary Markdown for headings, paragraphs, lists, links, tables, and code. Use a component only for the blocks below.

| Block | Write |
| --- | --- |
| Note | `<Note title="About this estimate">…</Note>` |
| Warning | `<Warning title="Before changing DNS records">…</Warning>` |
| Recommendation | `<Tip title="Start small">…</Tip>` |
| Formula | `<Formula title="Conversion rate">…</Formula>` |
| Worked example | `<Example title="400 visitors">…</Example>` |
| Terms and their meanings | `<Terms>` holding `<Term name="Churn">…</Term>` items |
| Chart | `<UiStaticChart spec={…} />`. Use `<UiChart spec={…} />` only when the reader needs hover, toggles, or ranges. |
| Data table with row headers or mobile rows | `<UiDataTable … />` |
| Marker art | `<MarkerArt figure="catalog/zfs-capacity" alt="…" />` |

`title` is optional on every callout. The words inside a block are ordinary Markdown.

`mdx-components.tsx` lists every component content may use, and `scripts/stack127/content/allowed-components.mjs` lists the same names for the content check. Content can't import anything, so a page can only use what those allow. Add a component there only when it is a shared component in `app/ui/` and documented in [shared-ui.md](shared-ui.md).

`UiChart` is the one exception: it loads the chart script, so it isn't in `mdx-components.tsx`. A page whose content needs it passes it from the route, so only that page loads the script:

```tsx
import { UiChart } from "@/app/ui/charts/chart";

<Article components={{ UiChart }} />
```

## Rules

These keep every page in one style. `npm run quality` checks the ones a script can see.

- Content never has its own h1. The page title comes from the database.
- Headings go down one level at a time: `##`, then `###`. Never skip a level.
- No eyebrows, kickers, or labels above a heading, and no bold line standing in for a heading.
- No raw HTML, `style`, or class names. Use Markdown or a listed component.
- No `import` or `export` in content files.
- One idea per paragraph. Follow [writing-style.md](writing-style.md) for words, formats, and visuals.
- Links to other stack127 pages use the plain path, such as `/raid-calculator`.

Section order for each page family:

| Family | Order |
| --- | --- |
| Tool | Title and intro, the tool, usage, then the article: how it works, examples, and questions |
| Directory | Title and intro, the listing, then the sections the page places |
| Catalog | Title and intro, the cards, then the article |
| Site | Title and intro, then the article |

## Dates and versions

Titles, descriptions, SEO fields, versions, and dates stay in the database for every page. When a content change matters to readers, move the page's public date with the publish command in the same release. Copy fixes, such as a typo, leave the date alone.

## Move a page from the database to code

1. Export its content: `npm run stack127:content:export -- --slug <slug>`. It writes the `content/` files and turns callouts, terms, charts, and marker art into components.
2. Read every file and clean it to the rules above. Keep the reader's text the same unless a sentence breaks a rule.
3. Change the route to import the files.
4. Check the page at desktop and mobile width in both themes. Compare its visible text with the live page; only intended edits may differ. Check that the title, description, and SEO tags are unchanged.
5. Run `npm run quality`.

The database columns for moved content stay in place until every page has moved, then retire in one migration.
