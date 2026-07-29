import Link from "next/link";
import type { ReactNode } from "react";
import { getPublishedPage, getRequiredPublishedPage } from "@/lib/page-registry";
import { buildBreadcrumbStructuredData } from "@/lib/seo";
import { lessonHref, lessonNeighbors, lessons } from "@/lib/self-hosting-for-beginners";
import { AppShell, SidebarLabel } from "../../app-shell";
import { JsonLd } from "../../json-ld";
import { proseClassName } from "../../prose";
import { SidebarList } from "../../sidebar-list";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "../../sidebar-panel";

const courseAuthor = {
  name: "Raviteja KNTS",
  avatarUrl: "https://www.gravatar.com/avatar/b04b086ad0ea05d503673f6f563a080b?s=96&d=identicon",
};

const courseFallbackUpdatedAt = "2026-07-07";

function formatUpdated(value: Date | string) {
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function CourseSidebar({ currentSlug, label }: { currentSlug: string; label: string }) {
  return (
    <div className={`${sidebarPanelClassName} course-sidebar-panel`}>
      <div className={sidebarPanelHeadingClassName}>
        <SidebarLabel>{label}</SidebarLabel>
      </div>
      <nav aria-label="Self-hosting course lessons">
        <SidebarList
          ordered
          items={lessons.map((lesson) => {
            const number = String(lesson.order).padStart(2, "0");

            if (!lesson.published) {
              return { href: "", label: lesson.sidebarLabel, number, tag: "soon" };
            }

            return {
              active: lesson.slug === currentSlug,
              href: lessonHref(lesson),
              label: lesson.sidebarLabel,
              number,
            };
          })}
        />
      </nav>
    </div>
  );
}

function LessonNav({ currentSlug }: { currentSlug: string }) {
  const { prev, next } = lessonNeighbors(currentSlug);

  if (!prev && !next) {
    return null;
  }

  return (
    <nav className="lesson-nav" aria-label="Course navigation">
      {prev ? (
        <Link className="lesson-nav-link lesson-nav-prev" href={lessonHref(prev)}>
          <span className="lesson-nav-dir">← previous</span>
          <span className="lesson-nav-title">{prev.sidebarLabel}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link className="lesson-nav-link lesson-nav-next" href={lessonHref(next)}>
          <span className="lesson-nav-dir">next →</span>
          <span className="lesson-nav-title">{next.sidebarLabel}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

/** Wraps the lesson's mark phrase in <mark> for the accent h1 treatment. */
function renderLessonHeading(heading: string, mark?: string) {
  if (!mark) {
    return heading;
  }
  const index = heading.indexOf(mark);
  if (index === -1) {
    return heading;
  }
  return (
    <>
      {heading.slice(0, index)}
      <mark>{mark}</mark>
      {heading.slice(index + mark.length)}
    </>
  );
}

export async function LessonPage({
  currentSlug,
  heading,
  children,
}: {
  currentSlug: string;
  heading: string;
  children: ReactNode;
}) {
  const lesson = lessons.find((entry) => entry.slug === currentSlug);
  const registrySlug = lesson ? lessonHref(lesson).slice(1) : null;
  // The registry row powers the visible updated date. The fallback keeps draft
  // previews from losing the course byline while registry rows are missing.
  const [page, coursePage] = await Promise.all([
    registrySlug ? getPublishedPage(registrySlug).catch(() => null) : Promise.resolve(null),
    getRequiredPublishedPage("self-hosting-for-beginners"),
  ]);
  const updatedAt = page?.updated_at ?? courseFallbackUpdatedAt;

  const crumbs = [
    { name: "version127", path: "/" },
    { name: "Self-hosting for beginners", path: "/self-hosting-for-beginners" },
  ];
  if (lesson && lesson.slug) {
    crumbs.push({ name: lesson.sidebarLabel, path: lessonHref(lesson) });
  }

  return (
    <AppShell
      mainLabel={heading}
      menuLabel="Lessons"
      sidebar={<CourseSidebar currentSlug={currentSlug} label={coursePage.label} />}
      sidebarLabel="Self-hosting course sidebar"
    >
      <JsonLd data={buildBreadcrumbStructuredData(crumbs)} />
      <article className={`lesson-page ${proseClassName}`}>
        <header className="lesson-header">
          <h1>{renderLessonHeading(heading, lesson?.headingMark)}</h1>
          <div className="lesson-byline">
            <img
              alt=""
              className="lesson-author-avatar"
              decoding="async"
              height="40"
              loading="lazy"
              referrerPolicy="no-referrer"
              src={courseAuthor.avatarUrl}
              width="40"
            />
            <p>
              <span>By {courseAuthor.name}</span>
              <span>Updated {formatUpdated(updatedAt)}</span>
            </p>
          </div>
        </header>
        {children}
        <LessonNav currentSlug={currentSlug} />
      </article>
    </AppShell>
  );
}

/**
 * A short list of real questions with direct answers, rendered near the end of
 * a lesson. Questions should match how people actually phrase searches.
 */
export function Faq({ items }: { items: { q: string; a: ReactNode }[] }) {
  return (
    <section className="lesson-faq">
      <h2>Common questions</h2>
      {items.map((item) => (
        <div className="lesson-faq-item" key={item.q}>
          <h3>{item.q}</h3>
          <p>{item.a}</p>
        </div>
      ))}
    </section>
  );
}

/**
 * Links to another lesson, but only if that lesson is published yet.
 * Unbuilt lessons render as plain text, so forward references never 404.
 * They start linking automatically once the target page is added.
 */
export function LessonLink({ slug, children }: { slug: string; children: ReactNode }) {
  const target = lessons.find((entry) => entry.slug === slug);
  if (target?.published) {
    return <Link href={lessonHref(target)}>{children}</Link>;
  }
  return <span className="lesson-link-soon">{children}</span>;
}

/** Compact callout for recommendations, warnings, or notes. */
export function Callout({
  tone = "note",
  title,
  children,
}: {
  tone?: "recommend" | "warning" | "note";
  title: string;
  children: ReactNode;
}) {
  return (
    <aside className={`lesson-callout lesson-callout-${tone}`}>
      <p className="lesson-callout-title">{title}</p>
      <div className="lesson-callout-body">{children}</div>
    </aside>
  );
}
