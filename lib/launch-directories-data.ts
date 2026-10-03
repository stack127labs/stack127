export type LaunchDirectorySource = { label: string; url: string; checked_on: string | null };

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
