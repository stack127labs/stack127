// Helpers for the app directory views, safe on the server and in the browser.
import { getAppDirectoryView, stateLabels, type IndieCost, type IndieCategory } from "@/lib/indie-hacker-apps/model";

/** The directory, its full research category (for every job label), and its view (only its own jobs and cost sets). */
export function appDirectoryContext(slug: string) {
  const { directory, category, view } = getAppDirectoryView(slug);
  return { directory, category, view, jobLabels: new Map(category.jobs.map(([id, label]) => [id, label])) };
}

export const hiddenDetailsPrefix = (slug: string) => `app-directory-${slug}`;

/** A price with its plan and any doubt about it, or "—" when the size doesn't apply. */
export function costText(row: IndieCost | undefined) {
  if (!row || row.state === "not_applicable") return "—";
  return [row.v, row.plan, stateLabels[row.state]].filter(Boolean).join(" · ");
}

/** The size picker options of one cost set, e.g. "100,000 pageviews". */
export function sizeLevels(view: IndieCategory, set: string) {
  const { levels, unit } = view.sets[set];
  return levels.map((level) => (unit ? `${level} ${unit}` : level));
}

/** The small label on apps whose main job belongs to another directory. */
export function mainJobNote(app: { main: boolean; mainJob: string }) {
  return app.main || !app.mainJob ? "" : `also does this · mainly ${app.mainJob.toLowerCase()}`;
}
