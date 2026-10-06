import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { notFound } from "next/navigation";
import { directoryTitleParts } from "@/lib/directory-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import Link from "next/link";
import type { ReactNode } from "react";
import type { CourseDefinition } from "@/lib/courses";
import { courseLessonHref, courseLessonNeighbors } from "@/lib/courses";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { buildBreadcrumbStructuredData } from "@/lib/seo";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { JsonLd } from "@/app/ui/site/json-ld";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageMeta } from "@/app/ui/site/page-meta";
import { proseClassName, proseFlowClassName } from "@/app/ui/site/prose";
import { SidebarList } from "@/app/ui/site/sidebar-list";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { EntryHero } from "@/app/ui/site/entry-hero";

function courseName(course: CourseDefinition) {
  return directoryTitleParts(course.title).map(part => part.text).join("");
}

function CourseSidebar({ course, currentSlug, label }: {
  course: CourseDefinition;
  currentSlug: string;
  label: string;
}) {
  return (
    <div className={`${sidebarPanelClassName} course-sidebar-panel`}>
      <div className={sidebarPanelHeadingClassName}>
        <SidebarLabel>{label}</SidebarLabel>
      </div>
      <nav aria-label={`${courseName(course)} lessons`}>
        <SidebarList
          ordered
          items={course.lessons.map((lesson) => {
            const number = String(lesson.order).padStart(2, "0");
            if (!lesson.published) {
              return { href: "", label: lesson.sidebarLabel, number, tag: "soon" };
            }
            return {
              active: lesson.slug === currentSlug,
              href: courseLessonHref(course, lesson),
              label: lesson.sidebarLabel,
              number,
            };
          })}
        />
      </nav>
    </div>
  );
}

function LessonNavigation({ course, currentSlug }: {
  course: CourseDefinition;
  currentSlug: string;
}) {
  const { previous, next } = courseLessonNeighbors(course, currentSlug);
  if (!previous && !next) return null;

  return (
    <nav className="lesson-nav" aria-label="Course navigation">
      {previous ? (
        <Link className="lesson-nav-link lesson-nav-prev" href={courseLessonHref(course, previous)}>
          <span className="lesson-nav-dir">← previous</span>
          <span className="lesson-nav-title">{previous.sidebarLabel}</span>
        </Link>
      ) : <span />}
      {next ? (
        <Link className="lesson-nav-link lesson-nav-next" href={courseLessonHref(course, next)}>
          <span className="lesson-nav-dir">next →</span>
          <span className="lesson-nav-title">{next.sidebarLabel}</span>
        </Link>
      ) : <span />}
    </nav>
  );
}

export async function CourseLessonPage({ children, course, currentSlug, entryHeroArt, title }: {
  children: ReactNode;
  course: CourseDefinition;
  currentSlug: string;
  entryHeroArt?: string;
  title: string;
}) {
  const lesson = course.lessons.find((entry) => entry.slug === currentSlug);
  if (!lesson?.published) notFound();
  const coursePage = await getRequiredPublishedPage(course.registrySlug);
  const heading = directoryTitleParts(title).map(part => part.text).join("");
  const crumbs = [
    { name: "stack127", path: "/" },
    { name: courseName(course), path: course.basePath },
  ];
  if (lesson?.slug) {
    crumbs.push({ name: lesson.sidebarLabel, path: courseLessonHref(course, lesson) });
  }

  const headingBlock = (
    <PageHeader>
      <h1><DirectoryPageTitle title={title} /></h1>
      <PageMeta author={course.author} updatedAt={lesson.updatedAt} />
    </PageHeader>
  );

  return (
    <AppShell
      mainLabel={heading}
      menuLabel={course.navigationLabel}
      sidebar={<CourseSidebar course={course} currentSlug={currentSlug} label={coursePage.label} />}
      sidebarLabel={`${courseName(course)} sidebar`}
    >
      <JsonLd data={buildBreadcrumbStructuredData(crumbs)} />
      {entryHeroArt ? <EntryHero art={entryHeroArt}>{headingBlock}</EntryHero> : null}
      <PageCanvas as="article" flow reading className={`lesson-page ${proseClassName} ${proseFlowClassName}`}>
        {entryHeroArt ? null : headingBlock}
        {children}
        <LessonNavigation course={course} currentSlug={currentSlug} />
      </PageCanvas>
    </AppShell>
  );
}

export function CourseLessonLink({ children, course, slug }: {
  children: ReactNode;
  course: CourseDefinition;
  slug: string;
}) {
  const target = course.lessons.find((entry) => entry.slug === slug);
  return target?.published ? (
    <Link href={courseLessonHref(course, target)}>{children}</Link>
  ) : (
    <span className="lesson-link-soon">{children}</span>
  );
}
