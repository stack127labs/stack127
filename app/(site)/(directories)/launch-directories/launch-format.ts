import type { SectionNav } from "@/app/ui/site/section-bar";
import type { LaunchDirectory } from "@/lib/launch-directories";
import { linkOptions } from "./launch-directory-options";

// Words and formats shared by the launch directory pages. Every value comes from the record;
// a missing fact returns null so the page can say "Not stated" instead of guessing.

export function launchSectionNav(current: string): SectionNav {
  return {
    label: "launch directories",
    href: "/launch-directories",
    current,
    items: [
      { label: "Directory", href: "/launch-directories" },
      { label: "Compare", href: "/launch-directories/compare" },
    ],
  };
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dateParts(value: string | null | undefined) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const month = match ? months[Number(match[2]) - 1] : undefined;
  return match && month ? { year: match[1], month, day: Number(match[3]) } : null;
}

/** A YYYY-MM-DD record date as `Oct 2, 2026`, the same on the server and in the browser. */
export function formatDate(value: string | null | undefined) {
  const parts = dateParts(value);
  return parts ? `${parts.month} ${parts.day}, ${parts.year}` : null;
}

/** `Oct 2`, for dense rows where the year is clear from the page. */
export function formatShortDate(value: string | null | undefined) {
  const parts = dateParts(value);
  return parts ? `${parts.month} ${parts.day}` : null;
}

export function domainOf(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

/** A short, readable address for a source link: host plus the first path segment. */
export function shortUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname.replace(/\/+$/, "");
    if (!path) return host;
    const [first, ...rest] = path.slice(1).split("/");
    return `${host}/${first}${rest.length ? "/…" : ""}`;
  } catch {
    return value;
  }
}

export function formatPrice(value: number) {
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

/** Cost in two or three words: `Free`, `Free, $19+`, `From $49`, or `Paid`. Null when unknown. */
export function costShort(directory: Pick<LaunchDirectory, "cost_kind" | "lowest_paid_price_usd">) {
  const price = directory.lowest_paid_price_usd;
  if (directory.cost_kind === "free") return "Free";
  if (directory.cost_kind === "free_and_paid") return price ? `Free, ${formatPrice(price)}+` : "Free + paid";
  if (directory.cost_kind === "paid") return price ? `From ${formatPrice(price)}` : "Paid";
  return null;
}

const linkWords = new Map(linkOptions.map((option) => [option.value, option.card]));

/** The link a listing gives, in a word or two. Null when we couldn't verify it. */
export function linkShort(directory: Pick<LaunchDirectory, "link_type_kind">) {
  if (directory.link_type_kind === "unknown") return null;
  return linkWords.get(directory.link_type_kind) ?? null;
}

/** The free path's review wait, such as `5 to 7 work days`. Null when the place states no time. */
export function waitShort(directory: Pick<LaunchDirectory, "review_wait">) {
  return directory.review_wait?.label ?? null;
}

export function isSubmitReady(directory: Pick<LaunchDirectory, "submission_status" | "submit_url">) {
  return directory.submission_status === "verified" && Boolean(directory.submit_url);
}

export function submitStatusText(directory: Pick<LaunchDirectory, "submission_status">) {
  return directory.submission_status === "unavailable" ? "Submit page down" : "No submit page found";
}

export const trafficLabels: Record<NonNullable<LaunchDirectory["traffic_bucket"]>, string> = {
  top_1k: "Top 1k sites",
  top_10k: "Top 10k sites",
  top_100k: "Top 100k sites",
  top_1m: "Top 1M sites",
  below_1m: "Below the top 1M",
};

/** Five steps, most visited first. Same scale as the ad networks traffic meter. */
export const trafficSteps: Record<NonNullable<LaunchDirectory["traffic_bucket"]>, number> = {
  top_1k: 5, top_10k: 4, top_100k: 3, top_1m: 2, below_1m: 1,
};

/** One plain line for the card: who it suits, then the first sentence of the summary. */
export function cardDescription(directory: Pick<LaunchDirectory, "summary" | "best_for">) {
  const firstSentence = directory.summary.split(/(?<=\.)\s/)[0] ?? directory.summary;
  const bestFor = directory.best_for.trim().replace(/\.$/, "");
  return bestFor ? `${bestFor}. ${firstSentence}` : firstSentence;
}
