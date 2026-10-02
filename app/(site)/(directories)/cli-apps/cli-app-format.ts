import type { TerminalApp } from "@/lib/terminal-apps";
import { terminalAppTypeLabels } from "@/lib/terminal-app-taxonomy";

// Shared by the cards and the server-rendered detail panel.
export function formatStars(value: number | null) {
  if (value === null) {
    return "unknown";
  }

  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: value > 9999 ? "compact" : "standard",
  }).format(value);
}

export function formatDate(value: Date | string | null) {
  if (!value) {
    return "unknown";
  }

  return new Intl.DateTimeFormat("en", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function labelForType(value: string) {
  return terminalAppTypeLabels.get(value) ?? value.replaceAll("_", " ");
}

export function labelForPricing(value: TerminalApp["pricing_model"]) {
  return value.replaceAll("_", " ");
}

export function labelForSource(value: TerminalApp["source_model"]) {
  return value.replaceAll("_", " ");
}

export function formatList(values: string[], labels?: Map<string, string>) {
  if (values.length === 0) {
    return "unknown";
  }

  return values.map((value) => labels?.get(value) ?? value.replaceAll("_", " ")).join(", ");
}
