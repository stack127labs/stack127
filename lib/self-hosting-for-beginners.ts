import { notFound } from "next/navigation";
import { getRequiredCourse } from "./course-pages";

export const courseBasePath = "/self-hosting-for-beginners";

export function getSelfHostingForBeginnersCourse() {
  return getRequiredCourse("self-hosting-for-beginners");
}

export async function getLesson(slug: string) {
  const course = await getSelfHostingForBeginnersCourse();
  const lesson = course.lessons.find((entry) => entry.slug === slug);
  if (!lesson?.published || lesson.slug === null) notFound();
  return { ...lesson, slug: lesson.slug };
}
