export type LaunchDirectorySource = { label: string; url: string; checked_on: string | null };

export type LaunchSubmissionDetails = {
  backlink: "required" | "optional" | "not_required" | "unknown";
  requirements: string[];
  review_time: string | null;
  launch_queue: string | null;
  observations: Array<{
    text: string;
    checked_at: string;
    source_url: string | null;
    method: "public_page" | "signed_in_flow" | "email";
  }>;
};

/** Project an explicitly public, checked object. Never expose the surrounding research evidence. */
export function launchSubmissionDetails(evidence: unknown): LaunchSubmissionDetails | null {
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) return null;
  const value = (evidence as Record<string, unknown>).public_submission;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const field = value as Record<string, unknown>;
  const text = (value: unknown, limit: number): value is string => typeof value === "string"
    && value.length > 0 && value === value.trim() && [...value].length <= limit;
  if (typeof field.backlink !== "string" || !["required", "optional", "not_required", "unknown"].includes(field.backlink)
    || !Array.isArray(field.requirements) || field.requirements.length > 8
    || !field.requirements.every((value) => text(value, 80))
    || !(field.review_time === null || text(field.review_time, 500))
    || !(field.launch_queue === null || text(field.launch_queue, 500))
    || !Array.isArray(field.observations) || field.observations.length < 1 || field.observations.length > 12) return null;
  const observations: LaunchSubmissionDetails["observations"] = [];
  for (const item of field.observations) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const observation = item as Record<string, unknown>;
    const date = launchDirectoryDate(observation.checked_at);
    if (!text(observation.text, 1200) || !date || date !== observation.checked_at
      || typeof observation.method !== "string" || !["public_page", "signed_in_flow", "email"].includes(observation.method)
      || !(observation.source_url === null || sourceUrl(observation.source_url))) return null;
    observations.push({
      text: observation.text, checked_at: date,
      source_url: observation.source_url === null ? null : sourceUrl(observation.source_url),
      method: observation.method as LaunchSubmissionDetails["observations"][number]["method"],
    });
  }
  return {
    backlink: field.backlink as LaunchSubmissionDetails["backlink"],
    requirements: [...field.requirements] as string[],
    review_time: field.review_time as string | null,
    launch_queue: field.launch_queue as string | null,
    observations,
  };
}

export const LAUNCH_DIRECTORY_REVISION_SQL = `select md5(coalesce(string_agg(to_jsonb(directory)::text, '' order by directory.slug), '')) as fingerprint from public.launch_directories directory`;

const evidenceLabels: Record<string, string> = {
  submission: "Submission", cost: "Cost", review_time: "Review time",
  eligibility: "Eligibility", link_type: "Link type", link_policy: "Link policy",
};

function sourceUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function launchDirectoryDate(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value)) return null;
  const day = value.slice(0, 10);
  const calendar = new Date(`${day}T00:00:00Z`);
  if (!Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== day) return null;
  if (value.length === 10) return day;
  const timestamp = new Date(value);
  return Number.isFinite(timestamp.getTime()) ? timestamp.toISOString().slice(0, 10) : null;
}

/** Only source URLs and their actual dates are public; research notes stay private. */
export function launchDirectorySources(evidence: unknown, sources: unknown): LaunchDirectorySource[] {
  const links: LaunchDirectorySource[] = [];
  const seen = new Map<string, number>();
  const add = (label: string, value: unknown, checked: unknown) => {
    const url = sourceUrl(value);
    if (!url) return;
    const key = `${label}\n${url}`;
    const checked_on = launchDirectoryDate(checked);
    const existing = seen.get(key);
    if (existing !== undefined) {
      if (checked_on && (!links[existing].checked_on || checked_on > links[existing].checked_on!)) links[existing].checked_on = checked_on;
      return;
    }
    seen.set(key, links.length);
    links.push({ label, url, checked_on });
  };
  if (evidence && typeof evidence === "object" && !Array.isArray(evidence)) {
    for (const [key, label] of Object.entries(evidenceLabels)) {
      const value = (evidence as Record<string, unknown>)[key];
      if (!value || typeof value !== "object" || Array.isArray(value)) continue;
      const field = value as Record<string, unknown>;
      add(label, field.source_url, field.checked_at ?? field.date);
      if (Array.isArray(field.related_source_urls)) {
        for (const related of field.related_source_urls) add(label, related, field.checked_at ?? field.date);
      }
      if (Array.isArray(field.observations)) {
        for (const observation of field.observations) {
          if (!observation || typeof observation !== "object" || Array.isArray(observation)) continue;
          const source = observation as Record<string, unknown>;
          add(label, source.source_url, source.checked_at ?? source.date);
        }
      }
    }
  }
  if (Array.isArray(sources)) {
    for (const source of sources) {
      const url = sourceUrl(source);
      if (url && !links.some((link) => link.url === url)) add("Source", url, null);
    }
  }
  return links;
}

export function latestLaunchEvidenceDate(evidence: unknown): string | null {
  if (!evidence || typeof evidence !== "object") return null;
  let latest: string | null = null;
  for (const [key, value] of Object.entries(evidence)) {
    const checked = key === "checked_at" || key === "date" ? launchDirectoryDate(value) : latestLaunchEvidenceDate(value);
    if (checked && (!latest || checked > latest)) latest = checked;
  }
  return latest;
}

export function launchDirectoryRevisionMatches(html: string, revision: string) {
  if (revision === "unpublished") return !html.includes("data-launch-directories-revision=");
  return /^[a-f0-9]{32}$/.test(revision) && html.includes(`data-launch-directories-revision="${revision}"`);
}
