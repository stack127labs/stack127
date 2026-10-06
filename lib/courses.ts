export type CourseLesson = {
  title: string;
  updatedAt: string | null;
  order: number;
  published: boolean;
  sidebarLabel: string;
  slug: string | null;
};

export type CourseDefinition = {
  author: {
    avatarUrl: string;
    name: string;
  };
  basePath: `/${string}`;
  intro_markdown: string;
  content_markdown: string | null;
  card_name: string;
  card_description: string;
  card_icon_key: string | null;
  card_art_key: string | null;
  lessons: CourseLesson[];
  navigationLabel: string;
  registrySlug: string;
  title: string;
};

export function courseLessonHref(
  course: Pick<CourseDefinition, "basePath">,
  lesson: Pick<CourseLesson, "slug">,
) {
  return lesson.slug ? `${course.basePath}/${lesson.slug}` : course.basePath;
}

export function courseLessonNeighbors(course: CourseDefinition, slug: string) {
  const published = course.lessons.filter((lesson) => lesson.published);
  const currentIndex = published.findIndex((lesson) => lesson.slug === slug);

  return {
    previous: currentIndex > 0 ? published[currentIndex - 1] : null,
    next:
      currentIndex >= 0 && currentIndex < published.length - 1
        ? published[currentIndex + 1]
        : null,
  };
}
