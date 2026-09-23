# Self-hosting for beginners

Status: current page-specific guidance

This course takes a beginner from the idea of self-hosting to one working app, then introduces
storage, backups, home access, and remote access when the reader needs them.

## Sources of truth

- `brief.md` defines the reader, job, format mix, and page-family contract.
- `course-outline.md` defines lesson coverage and sequence.
- `lib/self-hosting-for-beginners.ts` defines the live lesson titles, routes, and publication-ready
  state used by the interface.
- `app/ui/courses/course-shell.tsx` owns the reusable course layout.
- `app/(site)/(courses)/self-hosting-for-beginners/course.tsx` binds this course to that layout.

Do not keep a second lesson tracker in docs. The data file and route ownership manifests already
answer what exists.

## Course content

Follow `stack127_docs/writing-style.md` for all writing and visual choices.

The root page is lesson one, not a marketing page. Every lesson should also work for someone who
arrives from search without reading the previous lesson.

Introduce the app chosen for each lesson and explain how it fits the reader's setup.

## Build contract

Lesson routes are static and remain under `/self-hosting-for-beginners/<lesson-slug>`. Add lesson
data before building the route. Wrap lesson content in `LessonPage`, use `LessonLink` for course
links, and use `CodeBlock` for copyable commands.

The shared shell owns the byline, updated date, sidebar, structured breadcrumbs, and previous and
next navigation. Route files do not add their own metadata, canonical URLs, robots rules, sitemap
dates, or JSON-LD.

Publication remains controlled only by `public.stack127_pages`.
