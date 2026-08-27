# Self-hosting for beginners

Status: current page-specific guidance

This course takes a beginner from the idea of self-hosting to one working app, then introduces
storage, backups, home access, and remote access when the reader needs them.

## Sources of truth

- `brief.md` defines the reader, job, format mix, and page-family contract.
- `course-outline.md` defines lesson coverage and sequence.
- `lib/self-hosting-for-beginners.ts` defines the live lesson titles, routes, and publication-ready
  state used by the interface.
- `app/(site)/(courses)/_components/course-shell.tsx` owns the reusable course layout.
- `app/(site)/(courses)/self-hosting-for-beginners/course.tsx` binds this course to that layout.

Do not keep a second lesson tracker in docs. The data file and route ownership manifests already
answer what exists.

## Course-specific voice

Write like an experienced self-hoster explaining what they actually run and why. Use first person
when it helps. Give a recommendation instead of hiding behind a broad options list. Explain a term
where it first matters, then keep moving.

The root page is lesson one, not a marketing page. Every lesson should also work for someone who
arrives from search without reading the previous lesson.

Follow `stack127_docs/writing-style.md`, `stack127_docs/visual-first.md`, and
`skills/stack127/unslop/SKILL.md`. Course-specific copy also follows these rules:

- Introduce apps as choices with a reason, not as a catalog.
- Put a warning beside the step where it can save someone trouble.
- Link official instructions the first time a lesson asks the reader to install or run something.
- Use one earned diagram or focused screenshot when prose alone would make the idea harder.
- Do not add a glossary, a generic summary box, or a repeated “what you will learn” section.

## Build contract

Lesson routes are static and remain under `/self-hosting-for-beginners/<lesson-slug>`. Add lesson
data before building the route. Wrap lesson content in `LessonPage`, use `LessonLink` for course
links, and use `CodeBlock` for copyable commands.

The shared shell owns the byline, updated date, sidebar, structured breadcrumbs, and previous and
next navigation. Route files do not add their own metadata, canonical URLs, robots rules, sitemap
dates, or JSON-LD.

Publication remains controlled only by `public.stack127_pages`.
