import type { DirectoryFilterOption as FilterOption } from "@/app/ui/directories/directory-filters";

// Filter labels shared by the server page (options) and the browser (chips).
export const platformOptions: FilterOption[] = [
  { label: "Linux", value: "linux" },
  { label: "macOS", value: "macos" },
  { label: "Windows", value: "windows" },
  { label: "BSD", value: "bsd" },
  { label: "Web", value: "web" },
];

export const pricingOptions: FilterOption[] = [
  { label: "Free", value: "free" },
  { label: "Freemium", value: "freemium" },
  { label: "Paid", value: "paid" },
  { label: "Subscription", value: "subscription" },
  { label: "Usage based", value: "usage_based" },
  { label: "Unknown", value: "unknown" },
];

export const sourceModelOptions: FilterOption[] = [
  { label: "Open source", value: "open_source" },
  { label: "Source available", value: "source_available" },
  { label: "Freeware", value: "freeware" },
  { label: "Closed source", value: "closed_source" },
  { label: "Unknown", value: "unknown" },
];

export const maintenanceOptions: FilterOption[] = [
  { label: "Active", value: "active" },
  { label: "Slow", value: "slow" },
  { label: "Stale", value: "stale" },
  { label: "Archived", value: "archived" },
  { label: "Unknown", value: "unknown" },
];

export const installLabels = new Map([
  ["brew", "Homebrew"],
  ["brew-cask", "Brew cask"],
  ["cargo", "cargo"],
  ["npm", "npm"],
  ["pip", "pip"],
  ["apt", "apt"],
  ["pacman", "pacman"],
  ["nix", "nix"],
  ["winget", "winget"],
  ["scoop", "scoop"],
  ["go", "go install"],
  ["binary", "binary"],
  ["docker", "Docker"],
  ["source", "from source"],
]);

export function labelForValue(map: Map<string, string>, value: string) {
  return map.get(value) ?? value.replaceAll("_", " ");
}

export const cliAppPageSize = 30;
