---
name: stack127-directory-writing
description: Plan and write, or rewrite, the title, H1, intro, content, card text, child page copy, and SEO text for a stack127 directory page so people can find, compare, and trust what is listed. Use for new directories and for improving thin or live directory pages. Copy only; data gathering and listing design are separate work.
---

# stack127 directory writing

Read `stack127_docs/writing-style.md` for how to write and search wording, `stack127_docs/shared-ui.md` for components, and `stack127_docs/directory-pages.md` for where directory copy is stored. Read `content_docs/<slug>/` before writing. Check every claim against the records and their sources.

This skill covers words. Each directory gathers and shows its data differently, so the records, filters, and layout are separate work. If the copy can't fix a problem, such as missing data, weak filters, or stale records, report it instead of writing around it.

## Find where the copy lives

Hand-written directory copy lives in the database. The title, intro, content, and card text are in the page's `public.stack127_directory_pages` row. The SEO title and description are on its `public.stack127_pages` row. Don't keep a second copy of these words in code.

Code holds copy only when a sync script fills a template for many child pages from records, such as one page per app. Change that template in the script. See the table in `directory-pages.md`.

Platform fee hub and category copy stays in the database. The fee sync creates missing rows only and never replaces reviewed words or SEO fields.

Section or group intros may live in the directory's data files. Check that the route renders `content_markdown` and that it renders well: with the shared prose styles, normal spacing, and tables that fit on a phone.

If the directory's brief disagrees with this skill, for example about the title, follow the skill, update the brief, and say so in the handoff.

Note each place you changed in the handoff.

## Win the search

The page should be the best place to find, compare, or look up these things. Before planning, look at the top results for the main searches and answer:

1. What is the searcher trying to find, compare, or decide?
2. Where do the top results fail them? Common failures: outdated entries, missing conditions, no sources, padded lists, and paid placements presented as advice.
3. What will this page do better?

Most directory searches are about choosing or checking: "Gumroad fees", "where to launch my app", "VS Code shortcuts". Put the listing and the answer first. Explanations come after.

## Stay on the core

A directory page has two jobs: help the reader find and compare what they came for, and help them trust what they see. Write only what serves those jobs. Typical topics:

- what is listed, and what is left out;
- how to pick the right entry for their case;
- what the key fields or terms on the cards mean;
- how entries are checked, and when;
- the few questions people search about this subject.

There is no fixed list of sections. Judge each one by asking whether a typical visitor would want it. If not, cut it.

Leave out:

- Text that repeats what the cards, filters, or table already show.
- Long background on the subject that doesn't help the visitor choose.
- Every exception from the records. Notes on a card belong on that card.
- Claims of completeness, rankings, or "best" picks that the records don't support.

Longer is not better. A short page that helps someone choose quickly beats a long guide wrapped around a list. Most directory pages need about 150 to 400 words of content. Go past that only when visitors clearly need more. Adding up the card values into a worked example is fine; it shows something the cards alone don't.

## Plan first

Write the plan in a "Copy plan" section of `content_docs/<slug>/brief.md`.

1. Open the live or development page and use it once like a visitor: search, filter, and open a record. Note what a visitor might misread.
2. List the searches and questions people have, from a quick look at the top results and "People also ask". Keep only the ones a typical visitor would have.
3. Map each one to where it is answered: the title, intro, cards, filters, content, or a child page.
4. Outline the content with question headings, and pick a format for each from `writing-style.md`.
5. List what you left out on purpose, and where it is handled instead.
6. Note the facts the page states, their sources, and the stack127 pages to link.

## Page structure

| Part | Where it shows | What to write |
| --- | --- | --- |
| SEO title | Search results | What the visitor can find or compare, in search words. Name well-known entries when people search for them. |
| Title (H1) | Page heading | Close to the SEO title and plain. Not a bare category name. |
| SEO description | Search results | What is listed, what can be compared, and why to trust it, in about 150 characters. |
| Intro | Above the listing | 2 to 3 sentences. What is here, how to start, and when entries were checked if the records say so. |
| Content | After the listing | Short sections with question headings, each answered in its first sentence. |
| Card name and description | Homepage, catalogs, and sidebars | Short and focused on the task. |

Counts change. Use a count in a title only when the page computes it from the records.

### Child pages

When child pages share a template, such as one page per app or per section, write the template once and fill it from the records. Change the template in the sync script or route, so the copy stays correct as records change. Check two or three filled pages, including one with sparse records.

## Keep it short and visual

- Use a table, list, or short example when it shows the idea better than a paragraph.
- Use only existing components.
- Say each idea once. The intro, cards, and content must not repeat each other.
- Say whether a figure is exact, a starting rate, or depends on conditions.
- Link to stack127 tools and directories the visitor would use next.

## Apply and check in development

Apply the copy to development with `scripts/stack127/directory-pages/update-content.mjs --environment development`. It previews and rolls back unless you add `--apply`. Use `--meta-title` and `--meta-description` for SEO fields. Don't rerun a directory's full sync just to change copy, because it may reload records in the shared development database. For a child page template, run the sync only when the brief allows it, and check that rows outside your change stay the same.

A changed copy or SEO field moves the public date and queues a cache refresh. A child edit also moves its directory ancestors' dates. Record imports do this automatically where covered. For meaningful code record changes, use the development touch command or `touch_reason` in a reviewed publisher batch. Skip explicit touches for typo fixes. See `directory-pages.md`. A worktree preview needs the local cache watcher pointed at its port; see `homelab-development.md`. The watcher clears the events it handles from the shared queue, so run it only for as long as you need.

Open the real page at desktop and mobile width in both themes. Read it as a first-time visitor. Check that the title, intro, listing, and content work together and that nothing repeats.

Never publish or change production. Release goes through the coordinator.

## Final pass

Reread everything as a first-time visitor. Cut repetition, padding, and any section that goes beyond the core. Remove research notes and insider wording. Keep source links that help the visitor.

## Hand off

Return:

- the pages changed, with development links;
- the SEO title, SEO description, H1, intro, and word count of the content before and after;
- each file, script, and row you changed, and how the copy was applied;
- what you left out and where it is handled;
- problems the copy can't fix, such as data, filters, or layout, for other lanes;
- sources for factual claims.
