import type { ReactNode } from "react";
import { Callout } from "@/app/ui/callout";
import { Faq as SharedFaq } from "@/app/ui/faq";
import { selfHostingForBeginnersCourse } from "@/lib/self-hosting-for-beginners";
import {
  CourseLessonLink,
  CourseLessonPage,
} from "../../../ui/courses/course-shell";
import { siteSpotCourseArt } from "../../art/site--spot-course";

export function LessonPage({ children, currentSlug, heading }: {
  children: ReactNode;
  currentSlug: string;
  heading: string;
}) {
  return (
    <CourseLessonPage
      course={selfHostingForBeginnersCourse}
      currentSlug={currentSlug}
      entryHeroArt={currentSlug === "" ? siteSpotCourseArt : undefined}
      heading={heading}
    >
      {children}
    </CourseLessonPage>
  );
}

export function LessonLink({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <CourseLessonLink course={selfHostingForBeginnersCourse} slug={slug}>
      {children}
    </CourseLessonLink>
  );
}

export function Faq({ items }: { items: { q: string; a: ReactNode }[] }) {
  return <SharedFaq items={items.map((item) => ({ question: item.q, answer: item.a }))} />;
}
export { Callout };
