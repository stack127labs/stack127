import { getPool } from "./db";
import { unstable_cache } from "next/cache";
import { LAUNCH_DIRECTORIES_TAG, PAGE_REGISTRY_TAG } from "./cache-tags";
import { LAUNCH_DIRECTORY_REVISION_SQL, LAUNCH_DIRECTORY_FACT_SELECT_SQL, launchDirectorySources, launchSubmissionDetails, parseLaunchPriceTiers, launchDirectoryNumber, type LaunchDirectorySource, type LaunchSubmissionDetails } from "./launch-directories-data";
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
  domain_rating: number | null;
  domain_rating_checked_on: string | null;
  traffic_bucket: "top_1k" | "top_10k" | "top_100k" | "top_1m" | "below_1m" | null;
  listing_indexed: boolean | null;
  review_wait: { label: string; min_days: number | null; max_days: number | null } | null;
  lowest_paid_price_usd: number | null;
  price_tiers: Array<{ name: string; price_usd: number | null; billing: "once" | "week" | "month" | "year" | "listing" | null; gets: string | null; link_type: LaunchDirectory["link_type_kind"] | null }>;
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
  type Row = Omit<LaunchDirectory, "icon_url" | "source_links" | "submission_details" | "review_wait" | "price_tiers" | "domain_rating" | "lowest_paid_price_usd"> & {
    sources: string[]; evidence: unknown; price_tiers: unknown;
    domain_rating: number | string | null; lowest_paid_price_usd: number | string | null;
    review_wait_label: string | null; review_wait_min_days: number | string | null; review_wait_max_days: number | string | null;
  };
  const client = await getPool().connect();
  try {
    await client.query("begin isolation level repeatable read read only");
    const result = await client.query<Row>(`
      select slug, name, website_url, submit_url, submission_status, categories, summary, best_for,
        cost_kind, cost_label, cost_tag, cost_note, review_time_label, link_type_kind,
        link_type_label, eligibility_label, example_listing_url,
        ${LAUNCH_DIRECTORY_FACT_SELECT_SQL},
        to_char(checked_on, 'YYYY-MM-DD') as checked_on, sources, evidence
      from public.launch_directories directory
      where is_published = true
      order by name
    `);
    const versions = await client.query<{ fingerprint: string }>(LAUNCH_DIRECTORY_REVISION_SQL);
    const revision = versions.rows[0]?.fingerprint;
    if (!revision || !/^[a-f0-9]{32}$/.test(revision)) throw new Error("Launch directory source revision is missing");
    await client.query("commit");
    const icons: Record<string, string> = directoryIcons;
    const directories = result.rows.map(({ sources, evidence, price_tiers, review_wait_label, review_wait_min_days, review_wait_max_days, ...row }) => ({
      ...row,
      domain_rating: launchDirectoryNumber(row.domain_rating),
      lowest_paid_price_usd: launchDirectoryNumber(row.lowest_paid_price_usd),
      review_wait: review_wait_label ? {
        label: review_wait_label, min_days: launchDirectoryNumber(review_wait_min_days), max_days: launchDirectoryNumber(review_wait_max_days),
      } : null,
      price_tiers: parseLaunchPriceTiers(price_tiers),
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

export const getLaunchDirectorySnapshot = unstable_cache(loadLaunchDirectorySnapshot, ["stack127-launch-directories-snapshot-v2"], {
  revalidate: false, tags: [LAUNCH_DIRECTORIES_TAG],
});

export async function getPublishedLaunchDirectories(): Promise<LaunchDirectory[]> {
  return (await getLaunchDirectorySnapshot()).directories;
}

/**
 * Exact published child params, including noindex pages, for the static export and card links.
 * Cached with the dataset and the parent's registry tag: a child publication change touches the
 * parent, which refreshes this list.
 */
export const listLaunchDirectorySlugs = unstable_cache(async (): Promise<string[]> => {
  const result = await getPool().query<{ slug: string }>(`
    select directory.slug from public.launch_directories directory
    join public.stack127_pages page on page.slug = 'launch-directories/' || directory.slug
    join public.stack127_directory_pages content on content.page_id = page.id
    where directory.is_published and page.is_published and page.page_family = 'directory'
    order by directory.slug
  `);
  return result.rows.map(directory => directory.slug);
}, ["stack127-launch-directory-page-slugs"], {
  revalidate: false, tags: [LAUNCH_DIRECTORIES_TAG, `${PAGE_REGISTRY_TAG}:launch-directories`],
});
