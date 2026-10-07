import { getPool } from "./db";
import { unstable_cache } from "next/cache";
import { LAUNCH_DIRECTORIES_TAG } from "./cache-tags";
import { LAUNCH_DIRECTORY_REVISION_SQL, launchDirectorySources, launchSubmissionDetails, type LaunchDirectorySource, type LaunchSubmissionDetails } from "./launch-directories-data";
import directoryIcons from "./launch-directory-icons.json";

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
  cost_tag: string | null;
  cost_note: string | null;
  review_time_label: string;
  link_type_kind: "dofollow" | "nofollow" | "ugc" | "sponsored" | "multiple" | "varies" | "estimated_nofollow" | "none" | "unknown";
  link_type_label: string;
  eligibility_label: string;
  icon_url: string | null;
  checked_on: string | null;
  example_listing_url: string | null;
  source_links: LaunchDirectorySource[];
  submission_details?: LaunchSubmissionDetails | null;
};

export const launchCategories = [
  { value: "launch-boards", label: "Launch boards", iconKey: "activity" },
  { value: "prelaunch-beta", label: "Prelaunch and beta", iconKey: "calendar" },
  { value: "startup-software", label: "Startup and software listings", iconKey: "briefcase" },
  { value: "software-reviews-alternatives", label: "Reviews and alternatives", iconKey: "bookmark" },
  { value: "ai-tools", label: "AI tools", iconKey: "bot" },
  { value: "developer-open-source", label: "Developer and open source", iconKey: "code-2" },
  { value: "design-nocode-creator", label: "Design, no-code, and creator", iconKey: "pen-tool" },
  { value: "specialist-regional", label: "Specialist and regional", iconKey: "map" },
  { value: "community-posts", label: "Community posts", iconKey: "message" },
] as const;

async function loadLaunchDirectorySnapshot(): Promise<{ directories: LaunchDirectory[]; revision: string }> {
  type Row = Omit<LaunchDirectory, "icon_url" | "source_links" | "submission_details"> & { sources: string[]; evidence: unknown };
  const client = await getPool().connect();
  try {
    await client.query("begin isolation level repeatable read read only");
    const result = await client.query<Row>(`
      select slug, name, website_url, submit_url, submission_status, categories, summary, best_for,
        cost_kind, cost_label, cost_tag, cost_note, review_time_label, link_type_kind,
        link_type_label, eligibility_label, example_listing_url,
        to_char(checked_on, 'YYYY-MM-DD') as checked_on, sources, evidence
      from public.launch_directories
      where is_published = true
      order by name
    `);
    const versions = await client.query<{ fingerprint: string }>(LAUNCH_DIRECTORY_REVISION_SQL);
    const revision = versions.rows[0]?.fingerprint;
    if (!revision || !/^[a-f0-9]{32}$/.test(revision)) throw new Error("Launch directory source revision is missing");
    await client.query("commit");
    const icons: Record<string, string> = directoryIcons;
    const directories = result.rows.map(({ sources, evidence, ...row }) => ({
      ...row,
      icon_url: icons[row.slug] ?? null,
      source_links: launchDirectorySources(evidence, sources),
      submission_details: launchSubmissionDetails(evidence),
    }));
    return { directories, revision };
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally { client.release(); }
}

export const getLaunchDirectorySnapshot = unstable_cache(loadLaunchDirectorySnapshot, ["stack127-launch-directories-snapshot"], {
  revalidate: false, tags: [LAUNCH_DIRECTORIES_TAG],
});

export async function getPublishedLaunchDirectories(): Promise<LaunchDirectory[]> {
  return (await getLaunchDirectorySnapshot()).directories;
}
