export type Lesson = {
  order: number;
  slug: string;
  /** Short label for the course sidebar. */
  sidebarLabel: string;
  /** Conversational H1 shown on the page. */
  heading: string;
  /** True once the page route exists. Unbuilt lessons render as muted outline items. */
  published: boolean;
};

/**
 * The self-hosting course spine. Order and coverage are defined in
 * content_docs/self-hosting-for-beginners/course-outline.md. The sidebar shows every lesson;
 * only `published` lessons link out. Lesson 1 is the landing page and also
 * answers "what is self-hosting", so there is no separate intro.
 */
export const lessons: Lesson[] = [
  {
    order: 1,
    slug: "",
    sidebarLabel: "What self-hosting is",
    heading: "What self-hosting is, and why do you need it?",
    published: true,
  },
  {
    order: 2,
    slug: "what-you-can-host",
    sidebarLabel: "What I host",
    heading: "The stuff I actually run on my server",
    published: true,
  },
  {
    order: 3,
    slug: "basic-setup",
    sidebarLabel: "The basic setup",
    heading: "The five pieces every self-hosting setup has",
    published: true,
  },
  {
    order: 4,
    slug: "pick-your-first-server",
    sidebarLabel: "Pick a server",
    heading: "Picking your first server without overthinking it",
    published: true,
  },
  {
    order: 5,
    slug: "pick-your-operating-system",
    sidebarLabel: "Pick an OS",
    heading: "Which OS you should put on your first server",
    published: true,
  },
  {
    order: 6,
    slug: "install-your-os",
    sidebarLabel: "Install the OS",
    heading: "Getting the OS installed and onto your network",
    published: true,
  },
  {
    order: 7,
    slug: "linux-ssh-basics",
    sidebarLabel: "Linux + SSH",
    heading: "The tiny bit of Linux and SSH you actually need",
    published: true,
  },
  {
    order: 8,
    slug: "install-docker",
    sidebarLabel: "Meet Docker",
    heading: "Meet Docker, and get it installed",
    published: true,
  },
  {
    order: 9,
    slug: "install-your-first-app",
    sidebarLabel: "Install first app",
    heading: "Installing your first app and making it real",
    published: true,
  },
  {
    order: 10,
    slug: "understand-docker-compose",
    sidebarLabel: "Docker Compose",
    heading: "Docker Compose, explained",
    published: true,
  },
  {
    order: 11,
    slug: "storage-and-volumes",
    sidebarLabel: "Storage & volumes",
    heading: "Where your data actually lives, and why it matters",
    published: true,
  },
  {
    order: 12,
    slug: "best-first-apps",
    sidebarLabel: "Best first apps",
    heading: "The apps I'd install next to build confidence",
    published: true,
  },
  {
    order: 13,
    slug: "backups-before-serious-apps",
    sidebarLabel: "Backups",
    heading: "Making backups boring before you trust anything important",
    published: true,
  },
  {
    order: 14,
    slug: "access-apps-safely-at-home",
    sidebarLabel: "Access at home",
    heading: "Reaching your apps at home, nicely",
    published: true,
  },
  {
    order: 15,
    slug: "access-apps-remotely-with-tailscale",
    sidebarLabel: "Remote access",
    heading: "Reaching your apps from anywhere, the easy way",
    published: true,
  },
  {
    order: 16,
    slug: "full-walkthrough",
    sidebarLabel: "Full walkthrough",
    heading: "Hosting a real app from start to finish",
    published: true,
  },
];

export const courseBasePath = "/self-hosting-for-beginners";

export function lessonHref(lesson: Pick<Lesson, "slug">) {
  return lesson.slug ? `${courseBasePath}/${lesson.slug}` : courseBasePath;
}

export function getLesson(slug: string) {
  const lesson = lessons.find((entry) => entry.slug === slug);
  if (!lesson) {
    throw new Error(`Unknown self-hosting lesson slug: "${slug}"`);
  }
  return lesson;
}

/** Previous and next published lessons, for the page footer nav. */
export function lessonNeighbors(slug: string) {
  const published = lessons.filter((entry) => entry.published);
  const publishedIndex = published.findIndex((entry) => entry.slug === slug);

  return {
    prev: publishedIndex > 0 ? published[publishedIndex - 1] : null,
    next:
      publishedIndex >= 0 && publishedIndex < published.length - 1
        ? published[publishedIndex + 1]
        : null,
  };
}
