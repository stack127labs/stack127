export type CourseLesson = {
  heading: string;
  headingMark?: string;
  order: number;
  published: boolean;
  sidebarLabel: string;
  slug: string;
};

export type CourseDefinition = {
  author: {
    avatarUrl: string;
    name: string;
  };
  basePath: `/${string}`;
  fallbackUpdatedAt: string;
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
