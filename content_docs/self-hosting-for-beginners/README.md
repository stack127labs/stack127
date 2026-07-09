# Self-Hosting 101 Course Plan

Page family: `/self-hosting-for-beginners`

This section should teach self-hosting like a guided course, not like generic docs or a pile of blog posts. Each page should work on its own for search, but the shared sidebar should make the full path feel calm and ordered.

## Goal

Help beginners understand self-hosting from zero to a practical first app without overwhelming them. The course should start with the smallest useful ideas, give the reader an early win, then introduce deeper topics only when they become necessary.

This is the long-term course plan too. Extra pages can be added later for advanced topics, but the main path should stay beginner-first instead of turning into a giant infrastructure manual.

The directory answers: what apps can I run?

This course answers: what do I need to understand to run them without feeling lost?

## Route Model

- Course landing page: `/self-hosting-for-beginners`
- Lesson pages: `/self-hosting-for-beginners/<lesson-slug>`
- Normal pages should be repo-owned Next.js routes under `app/`.
- Keep the route stable and human-readable.
- Do not make this Supabase-backed dynamic routing unless explicitly changed later.
- The course landing page is also the first lesson, not a marketing landing page.

## First Page Promise

The landing page (`/self-hosting-for-beginners`) is also the "what is self-hosting" lesson. Do not write a separate intro or "start here" page. Open on the real question and answer it in the author's voice.

It should land something like:

```text
Self-hosting means the apps you use run on a computer you own instead of somebody else's. You still open them in a browser. The difference is that the app, and everything you put into it, lives on a machine in your home.

So what's the appeal? Some people care about privacy. Some are tired of paying monthly for every little thing. For me, a lot of it is the satisfaction of running my own setup and understanding how it works.

Is it complicated? To be frank, not really. If I can understand it, you probably can. It is a step more technical than making a Google account, but you do not need to know how to program.
```

Keep it confident and relaxed. The reader should feel like there is a path and they do not need to learn everything at once. Tell them plainly that Linux, Docker, DNS, Tailscale, and hardware all come later, only when they need them.

## Writing Style

This is the most important section. These pages should read like one experienced self-hoster wrote them from memory, not like documentation assembled from a template. Match the voice of the published lessons 1-6.

### Voice

- Write in the first person. This is someone sharing what they actually run, broke, kept, and dropped. "I run everything on a small mini PC." "I gave Nextcloud a real go and dropped it." "Honestly, I mostly like tweaking things."
- Be opinionated. Give a real recommendation and say why. "My answer is boring on purpose, and I think it is right for almost everyone: Debian plus Docker." Do not write a neutral both-sides survey when the reader wants to be told what to pick.
- Stay conversational. Talk to the reader as "you". A short rhetorical question to open a section is good ("So what's the appeal?", "Is this going to be complicated?"). Keep it warm but not flippant. Contractions are fine. It should sound spoken.
- Be specific and lived-in. Name the actual app, the actual chip, the actual gotcha. "Immich, and the face search genuinely surprised me" beats "photo apps let you search your library."
- Mix communication and explanation. Even when you go deep, keep the human thread: explain the idea, then the detail, then the caveat, without switching into manual mode.

### Weave, do not list

- Put a beginner mistake where it actually bites: inline in the sentence, or as one short note next to the thing it warns about. Do not collect mistakes into a "Common mistakes" section at the end.
- Explain a new term the first time it appears, in a clause, then move on. "SSH, which is just a secure way to type commands on another machine." Do not add a glossary section.
- Introduce apps as choices you made. "Here is what I run and why" and "here is what you could run that I skipped, and why." Not a generic catalog of every option.

### Links

- Link the official site or docs the first time a lesson tells the reader to install or run a specific app or tool (Excalidraw, Memos, Tailscale, balenaEtcher, and so on).
- When a concept goes beyond the current lesson: if the course covers it later, say so and link the lesson (LessonLink degrades gracefully for unbuilt ones); if it is out of scope for the site, link one good external source (official docs, Wikipedia) instead of half explaining it. The fstab guide link in the backups lesson is the pattern.
- Every FAQ answer that names a tool or a lesson should link it too.

### Avoid

- Em dashes (—) and en dashes (–), anywhere. This is a hard site rule. Use a comma, a colon, or two sentences, and write ranges as "10 to 15W", not "10–15W".
- The "X, not Y" and "it is not just X, it is Y" contrast framing. It reads as marketing. ("Access is a choice, not a default" was cut for exactly this.)
- The punchy two-fragment "mic-drop" summary: a short noun phrase, then another, dropped in as a neat closer ("Five pieces, one app.", "Same app, two places to run it.", "Two containers, one command."). It is an AI tell. Write a normal sentence, or cut the line entirely.
- Robotic section labels used as scaffolding: "Common mistakes.", "Glossary.", "What you get out of it." Headings should sound like something a person would say.
- Hype and filler: `comprehensive`, `robust`, `seamless`, `powerful`, `ultimate`, `effortless`, `simply`.
- Repeating category words like `self-hosted app` or `open source` when they add nothing.
- Front-loading caveats before the reader has context. Keep the first half of each page beginner-safe.
- Explaining a concept the reader does not need yet. Introduce Docker, DNS, remote access, and backups only in the lesson where they first matter, and link back instead of re-explaining later. The Tailscale page can mention Cloudflare Tunnel, WireGuard, reverse proxies, and port forwarding in context without making each one its own lesson.

### Before and after

Bad, template voice:

```text
Access is a choice, not a default. By default, applications are only reachable within the local network. Exposing them externally is a separate configuration step.
```

Good, lived-in voice:

```text
One thing worth knowing early so you don't worry about it: an app on your server doesn't automatically get thrown onto the public internet. By default it only works inside your home. Opening it up is a separate, deliberate step you take later.
```

## Page Anatomy

Each lesson usually has:

- No route-owned SEO metadata. Public metadata belongs in `public.version127_pages`.
- One conversational H1. First person is fine, e.g. "The stuff I actually run on my server".
- A lede that says the useful thing immediately, in voice. Not "by the end of this page you will learn".
- The explanation, carried in short paragraphs with real examples and a clear opinion.
- One strong visual when it earns its place: a custom SVG diagram for a mental model, or a cropped screenshot for a real tool.
- Warnings and mistakes woven inline, or a single `Callout` where one genuinely helps.
- A natural closing line that hands off to the next lesson with a `LessonLink`.

Prev/next links and the sidebar are handled by the shared shell, so pages do not build them by hand.

Do not add: a "common mistakes" list section, a glossary section, or a "what you get out of it" summary. The shared `LessonPage` shell owns the byline and updated date.

## Build Conventions

So every agent builds pages the same way:

- Lessons are static routes: `app/self-hosting-for-beginners/<slug>/page.tsx`, with the root lesson at `app/self-hosting-for-beginners/page.tsx`. Do not use dynamic `[slug]` routing.
- `lib/self-hosting-for-beginners.ts` is the single source of truth for the lesson list. Add the lesson there with slug, sidebar label, H1, and route-built status. The sidebar and prev/next links derive from it.
- Wrap page content in the `LessonPage` shell from `app/self-hosting-for-beginners/course.tsx`.
- Use `CodeBlock` from `app/code-block.tsx` for every copyable command or multi-line snippet. Do not hand-roll bare `<pre className="lesson-code">`.
- Use `LessonLink` for links to other lessons. It renders plain text until the target lesson is published, so forward references never 404 and start linking automatically once built.
- Do not add page metadata, canonical URLs, robots rules, sitemap dates, or JSON-LD in lesson route files.
- Use `Callout` sparingly, `tone="note" | "warning" | "recommend"`, only for a genuine aside or warning. Aim for at most one per page.
- Diagrams are inline SVG using the shared classes `sh-node`, `sh-node-accent`, `sh-label`, `sh-sub`, `sh-line` so they theme correctly in light and dark mode.
- Headings render with normal casing. Keep them short and human, and do not add decorative punctuation.
- Before marking done: `npx tsc --noEmit` is clean and the page renders.

## Visual Rules

- Use screenshots when the page talks about real tools, dashboards, apps, or settings.
- Use custom SVG diagrams for mental models like ports, DNS, reverse proxy flow, LAN vs internet, Docker volumes, and backups.
- Keep diagrams simple enough that a beginner can understand them in 10 seconds.
- Prefer one strong visual over several decorative visuals.
- Do not use abstract stock images.
- Screenshots should be cropped to the exact thing being explained.
- SVG labels should use plain terms like `router`, `server`, `app`, `domain`, `backup drive`, and `phone`.

## Publication Rules

Each lesson should stand alone for readers, but publication is not controlled by the lesson file.

- The sidebar can show course order, but the page intro should not require the previous lesson.
- Use clear internal links between related lessons.
- A built lesson route is not public just because code exists.
- Add `self-hosting-for-beginners` to `public.version127_pages` to make the course root public.
- Child lesson routes under a published `self-hosting-for-beginners` root render as `noindex, follow` unless their exact slug is added to `version127_pages`.
- Add an exact lesson slug such as `self-hosting-for-beginners/linux-ssh-basics` to `version127_pages` only when that lesson should be `index, follow` and included in the sitemap.

## Author Section

Every lesson uses the shared course byline directly below the H1.

The byline should include:

- Author name.
- Gravatar avatar for `ravitejaknts@gmail.com`.
- Last updated date from the page registry, with a stable course fallback for local draft previews.

Example direction:

```text
By Raviteja KNTS / Updated July 7, 2026
```

## Sidebar Rules

- Sidebar labels should be short and easy to scan.
- H1s can be warmer and more conversational.
- Sidebar order should move from basics to advanced.
- Keep the same sidebar across every course page.
- Show the current page state clearly.
- Avoid splitting the course into too many top-level groups. The sidebar should feel like one calm path.

## Launch Scope

Launch with the complete 16-lesson course spine. Order and coverage are defined in `course-outline.md`. Do not expand into separate DNS, reverse proxy, Proxmox, firewall, NAS, or WireGuard pages until the main beginner path is working and the need is clear.

The course should still cover those ideas when useful. The difference is that they appear inside the page where the reader naturally needs them.

Examples:

- DNS can be introduced inside `Access apps safely at home` and `Access apps remotely with Tailscale`.
- Cloudflare Tunnel, WireGuard, reverse proxies, and port forwarding can be compared inside the Tailscale lesson.
- Proxmox, NAS, VPS, mini PCs, and old laptops can be covered inside `Pick your first server`.
- Docker networking, app ports, and container ports can be covered inside the app install and Docker lessons.
- Serious backup detail belongs in `Backups before serious apps`, not before the reader has installed anything.

## Full Lesson Tracker

Order and coverage are defined in `course-outline.md`; this table only tracks build status against it. Check a page done only after its route, content, sidebar link, visual, and internal links are complete. Publishing metadata belongs in `public.version127_pages`, not this tracker.

The 16-lesson route spine is built in the repo and sets the voice. Publication is still controlled only by `public.version127_pages`; each exact lesson slug should stay aligned with the production registry, sitemap checks, and route coverage manifest.

| Done | Order | Sidebar label | Slug | Page H1 |
| --- | ---: | --- | --- | --- |
| [x] | 1 | What self-hosting is | `self-hosting-for-beginners` | What self-hosting is, and why do you need it? |
| [x] | 2 | What I host | `what-you-can-host` | The stuff I actually run on my server |
| [x] | 3 | The basic setup | `basic-setup` | The five pieces every self-hosting setup has |
| [x] | 4 | Pick a server | `pick-your-first-server` | Picking your first server without overthinking it |
| [x] | 5 | Pick an OS | `pick-your-operating-system` | Which OS I'd put on your first server |
| [x] | 6 | Install the OS | `install-your-os` | Getting the OS installed and onto your network |
| [x] | 7 | Linux + SSH | `linux-ssh-basics` | The tiny bit of Linux and SSH you actually need |
| [x] | 8 | Meet Docker | `install-docker` | Meet Docker, and get it installed |
| [x] | 9 | Install first app | `install-your-first-app` | Installing your first app and making it real |
| [x] | 10 | Docker Compose | `understand-docker-compose` | Docker Compose, explained |
| [x] | 11 | Storage & volumes | `storage-and-volumes` | Where your data actually lives, and why it matters |
| [x] | 12 | Best first apps | `best-first-apps` | The apps I'd install next to build confidence |
| [x] | 13 | Backups | `backups-before-serious-apps` | Making backups boring before you trust anything important |
| [x] | 14 | Access at home | `access-apps-safely-at-home` | Reaching your apps at home, nicely |
| [x] | 15 | Remote access | `access-apps-remotely-with-tailscale` | Reaching your apps from anywhere, the easy way |
| [x] | 16 | Full walkthrough | `full-walkthrough` | Hosting a real app from start to finish |

## Page Build Checklist

Use this checklist for each page before marking it done above.

- [ ] Lesson added to `lib/self-hosting-for-beginners.ts` with slug, sidebar label, H1, and route-built status.
- [ ] Static route created at `app/self-hosting-for-beginners/<slug>/page.tsx` (root lesson is `app/self-hosting-for-beginners/page.tsx`).
- [ ] Page uses the `LessonPage` shell and `LessonLink` for internal course links.
- [ ] Page file does not export metadata, robots, canonical, sitemap, or JSON-LD.
- [ ] H1 is conversational and in voice.
- [ ] One strong visual when it earns its place: SVG diagram or cropped screenshot.
- [ ] Concrete, opinionated app or setup examples, not a generic catalog.
- [ ] Beginner mistakes woven inline or in a single Callout, not a list section.
- [ ] No glossary section, no "common mistakes" section, no summary box.
- [ ] Reads in the first-person lived-in voice and passes the Writing Style checks.
- [ ] `npx tsc --noEmit` is clean and the page renders (sidebar, diagram, prev/next).

The sidebar and prev/next links update automatically from `lib/self-hosting-for-beginners.ts`. Sitemap inclusion only comes from `public.version127_pages`.

## Design Direction

- Keep dark mode as the default feel.
- Use the existing shell, typography, spacing, and design tokens.
- The course layout should be readable first, decorative second.
- Sidebar should feel like a course outline.
- Main content should feel like an article with diagrams, not a dense docs page.
- Avoid nested cards.
- Avoid a marketing hero.
- Use compact callouts only when they carry useful warnings, recommendations, or examples.

## Internal Linking Ideas

- Link app examples to `/self-host-apps` when the app is published there.
- Link `popular first apps` to filtered directory states if those become stable.
- Link `Understand Docker`, `Understand Docker Compose`, and `Understand storage and volumes` to app examples that use those concepts.
- Link `Tailscale`, `Cloudflare Tunnel`, `Reverse proxies`, and `Port forwarding` together carefully so readers can compare access models.
- Link the final walkthrough back to the starter lessons instead of re-explaining every concept.

## Open Decisions

- [x] Use `/self-hosting-for-beginners` as the course route.
- [x] Merge the old "start here" and "what self-hosting means" pages into the landing `/self-hosting-for-beginners` lesson.
- [x] Lock the first-person, opinionated, lived-in voice (see Writing Style). Every agent should match the built lessons.
- [x] Reorder the spine into one continuous beginner path with an OS-install step (see `course-outline.md`). Now 16 lessons.
- [ ] Reconcile `lib/self-hosting-for-beginners.ts` and the built pages to the new order (add lesson 6, renumber SSH to 7, split Docker into 8 and 10).
- [ ] Decide whose "I" this is: a single named author voice or a consistent house voice. Needed before there is a lot of copy to re-tone.
- [ ] Decide author name and bio format (author blocks deferred for now).
- [ ] Decide visual asset folder pattern for screenshots and diagrams.
- [ ] Decide the first walkthrough app.
- [ ] Decide whether screenshots should be generated locally from our own test setup, official product screenshots, or hand-built illustrative screenshots.

---

_Internal planning doc. Created 2026-07-03, last updated 2026-07-07._
