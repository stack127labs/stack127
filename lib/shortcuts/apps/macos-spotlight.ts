import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["macos"] as const;

export const macosSpotlight: AppShortcuts = {
  slug: "macos-spotlight",
  name: "macOS Spotlight",
  category: "Operating system",
  platforms: [...platforms],
  versionContext:
    "Spotlight keyboard shortcuts from Apple's current Mac User Guide, checked September 1, 2026. Result categories and filters can vary with the macOS version and enabled Spotlight sources.",
  sourceUrl: "https://support.apple.com/guide/mac-help/mh26783/mac",
  sourceLabel: "Apple Spotlight keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "search",
      title: "Search and results",
      intro: "Open Spotlight, inspect the selected result, and move through matching items.",
      shortcuts: [
        { id: "toggle", action: "Open or close Spotlight", keys: combo(platforms, ["Cmd", "Space"]) },
        { id: "quick-look", action: "Open Quick Look for the selected result", keys: combo(platforms, ["Space"]) },
        { id: "next-result", action: "Move to the next result", keys: combo(platforms, ["Down"]) },
        { id: "previous-result", action: "Move to the previous result", keys: combo(platforms, ["Up"]) },
        { id: "show-path", action: "Show the selected result's path", keys: combo(platforms, ["Cmd"]) },
        { id: "open-result", action: "Open the selected result", keys: combo(platforms, ["Return"]) },
        { id: "show-in-finder", action: "Show the result in its app or Finder", keys: combo(platforms, ["Cmd", "R"]) },
        { id: "finder-search", action: "Open a Finder search window", keys: combo(platforms, ["Option", "Cmd", "Space"]) },
      ],
    },
    {
      id: "categories-and-filters",
      title: "Categories and filters",
      intro: "Narrow Spotlight results by category or return to a previous search filter.",
      shortcuts: [
        { id: "applications", action: "Show application results", keys: combo(platforms, ["Cmd", "1"]) },
        { id: "files", action: "Show file results", keys: combo(platforms, ["Cmd", "2"]) },
        { id: "actions", action: "Show action results", keys: combo(platforms, ["Cmd", "3"]) },
        { id: "clipboard", action: "Show clipboard results", keys: combo(platforms, ["Cmd", "4"]) },
        { id: "filter", action: "Filter results", keys: combo(platforms, ["/"]) },
        { id: "search-history", action: "Go back in search history", keys: combo(platforms, ["Up"]) },
      ],
    },
  ],
};

export default macosSpotlight;
