import type { DirectoryFilterOption as FilterOption } from "@/app/ui/directories/directory-filters";
import { terminalAppCategories, terminalAppTypeLabels, type TerminalApp } from "@/lib/terminal-apps";
import { installLabels, labelForValue, platformOptions } from "./cli-app-options";
import type { CliAppFilterOptions } from "./cli-app-view";

const typeLabels = new Map<string, string>(terminalAppTypeLabels);

function countOptions(counts: Map<string, number>, label: (value: string) => string): FilterOption[] {
  return [...counts.entries()]
    .map(([value, count]) => ({ count, label: label(value), value }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function count(apps: TerminalApp[], values: (app: TerminalApp) => string[]) {
  const counts = new Map<string, number>();
  for (const app of apps) for (const value of values(app)) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

/** Sidebar options and counts for the apps in view: the whole directory, or one category. */
export function cliAppFilterOptions(apps: TerminalApp[]): CliAppFilterOptions {
  const categoryCounts = count(apps, (app) => app.categories);
  const lower = (value: string | null) => (value ?? "unknown").toLowerCase();
  const unknownLabel = (value: string) => value === "unknown" ? "Unknown" : value;
  return {
    category: terminalAppCategories
      .filter((category) => categoryCounts.has(category.slug))
      .map((category) => ({
        count: categoryCounts.get(category.slug),
        iconKey: category.icon_key,
        label: category.name,
        value: category.slug,
      })),
    install: countOptions(count(apps, (app) => app.install_methods), (value) => installLabels.get(value) ?? value),
    language: countOptions(count(apps, (app) => [lower(app.language)]), unknownLabel),
    license: countOptions(count(apps, (app) => [lower(app.license)]), unknownLabel),
    platform: platformOptions.map((option) => ({
      ...option,
      count: apps.filter((app) => app.platforms.includes(option.value)).length,
    })),
    type: countOptions(count(apps, (app) => [app.primary_type, ...app.additional_types]), (value) => labelForValue(typeLabels, value)),
  };
}
