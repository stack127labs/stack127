import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const jira: AppShortcuts = {
  slug: "jira",
  name: "Jira",
  category: "Issue tracking",
  platforms: [...platforms],
  versionContext:
    "Jira Cloud, with no platform-specific modifier keys. The set depends on your page, so press ? or open Help > Keyboard shortcuts to see it.",
  sourceUrl: "https://support.atlassian.com/jira-software-cloud/docs/use-keyboard-shortcuts/",
  sourceLabel: "official Atlassian Jira Cloud keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "jira-cloud",
      title: "Jira Cloud",
      intro: "Use the context-sensitive Jira Cloud keys to create, open, assign, comment on, and move between work items.",
      shortcuts: [
        { id: "shortcut-help", action: "Show keyboard shortcuts", keys: combo(platforms, ["?"]) },
        { id: "create-work-item", action: "Create a work item", keys: combo(platforms, ["C"]) },
        { id: "open-selected", action: "Open the selected work item", keys: combo(platforms, ["O"]) },
        { id: "assign", action: "Assign the work item", keys: combo(platforms, ["A"]) },
        { id: "assign-self", action: "Assign the work item to yourself", keys: combo(platforms, ["I"]) },
        { id: "comment", action: "Add a comment", keys: combo(platforms, ["M"]) },
        { id: "next-item", action: "Move to the next item", keys: combo(platforms, ["J"]) },
        { id: "previous-item", action: "Move to the previous item", keys: combo(platforms, ["K"]) },
        { id: "next-column", action: "Move to the next column", keys: combo(platforms, ["N"]) },
        { id: "previous-column", action: "Move to the previous column", keys: combo(platforms, ["P"]) },
      ],
    },
  ],
};

export default jira;
