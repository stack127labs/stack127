import type { ReactNode } from "react";
import { Callout } from "@/app/ui/callout";
import { Faq as SharedFaq } from "@/app/ui/faq";
import { getSelfHostingForBeginnersCourse } from "@/lib/self-hosting-for-beginners";
import {
  CourseLessonLink,
  CourseLessonPage,
} from "../../../ui/courses/course-shell";
import { cardArt } from "@/lib/card-art";

export async function LessonPage({ children, currentSlug, title }: {
  children: ReactNode;
  currentSlug: string;
  title: string;
}) {
  const course = await getSelfHostingForBeginnersCourse();
  return (
    <CourseLessonPage
      course={course}
      currentSlug={currentSlug}
      entryHeroArt={currentSlug === "" ? cardArt(course.card_art_key) ?? undefined : undefined}
      title={title}
    >
      {children}
    </CourseLessonPage>
  );
}

export async function LessonLink({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <CourseLessonLink course={await getSelfHostingForBeginnersCourse()} slug={slug}>
      {children}
    </CourseLessonLink>
  );
}

export function Faq({ items }: { items: { q: string; a: ReactNode }[] }) {
  return <SharedFaq items={items.map((item) => ({ question: item.q, answer: item.a }))} />;
}
export { Callout };
