import type { ReactNode } from "react";
import { selfHostingForBeginnersCourse } from "@/lib/self-hosting-for-beginners";
import {
  CourseCallout,
  CourseFaq,
  CourseLessonLink,
  CourseLessonPage,
} from "../_components/course-shell";

export function LessonPage({ children, currentSlug, heading }: {
  children: ReactNode;
  currentSlug: string;
  heading: string;
}) {
  return (
    <CourseLessonPage
      course={selfHostingForBeginnersCourse}
      currentSlug={currentSlug}
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
