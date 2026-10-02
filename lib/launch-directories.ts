import { getPool } from "./db";
import { unstable_cache } from "next/cache";
import { LAUNCH_DIRECTORIES_TAG } from "./cache-tags";

export type LaunchDirectory = {
  slug: string;
  name: string;
  website_url: string;
  submit_url: string | null;
  submission_status: "verified" | "unavailable" | "not_found";
  categories: string[];
  summary: string;
  best_for: string;
  cost_kind: "free" | "free_and_paid" | "paid" | "unknown";
  cost_label: string;
  review_time_label: string;
  link_type_kind: "dofollow" | "nofollow" | "ugc" | "sponsored" | "multiple" | "varies" | "estimated_nofollow" | "none" | "unknown";
  link_type_label: string;
  eligibility_label: string;
};

export const launchCategories = [
  { value: "launch-boards", label: "Launch boards", iconKey: "activity" },
  { value: "prelaunch-beta", label: "Prelaunch and beta", iconKey: "calendar" },
  { value: "startup-software", label: "Startup and software listings", iconKey: "briefcase" },
  { value: "software-reviews-alternatives", label: "Reviews and alternatives", iconKey: "bookmark" },
  { value: "ai-tools", label: "AI tools", iconKey: "bot" },
  { value: "developer-open-source", label: "Developer and open source", iconKey: "code-2" },
  { value: "app-stores-integrations", label: "App stores and integrations", iconKey: "box" },
  { value: "design-nocode-creator", label: "Design, no-code, and creator", iconKey: "pen-tool" },
  { value: "specialist-regional", label: "Specialist and regional", iconKey: "map" },
  { value: "community-posts", label: "Community posts", iconKey: "message" },
] as const;

async function loadPublishedLaunchDirectories(): Promise<LaunchDirectory[]> {
  const result = await getPool().query<LaunchDirectory>(`
    select slug, name, website_url, submit_url, submission_status, categories, summary, best_for,
      cost_kind, cost_label, review_time_label, link_type_kind,
      link_type_label, eligibility_label
    from public.launch_directories
    where is_published = true
    order by name
  `);
  return result.rows;
}

export const getPublishedLaunchDirectories = unstable_cache(loadPublishedLaunchDirectories, ["stack127-launch-directories"], {
  revalidate: false, tags: [LAUNCH_DIRECTORIES_TAG],
});
