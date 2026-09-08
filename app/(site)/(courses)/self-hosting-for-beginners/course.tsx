import type { ReactNode } from "react";
import { selfHostingForBeginnersCourse } from "@/lib/self-hosting-for-beginners";
import {
  CourseCallout,
  CourseFaq,
  CourseLessonLink,
  CourseLessonPage,
} from "../_components/course-shell";
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

export const Faq = CourseFaq;
export const Callout = CourseCallout;
