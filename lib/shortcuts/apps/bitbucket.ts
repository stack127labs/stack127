import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;
const all = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: platforms.map((platform) => ({ platform, keys })),
  ...(note ? { note } : {}),
});

export const bitbucket: AppShortcuts = {
  slug: "bitbucket",
  name: "Bitbucket",
  category: "Code hosting",
  platforms: [...platforms],
  versionContext:
    "Current Bitbucket Cloud shortcut reference checked August 31, 2026. Single-letter commands work in the page context named by each group. Bitbucket lets users disable all keyboard shortcuts in Personal Bitbucket settings.",
  sourceUrl: "https://support.atlassian.com/bitbucket-cloud/docs/keyboard-shortcuts/",
  sourceLabel: "Bitbucket Cloud keyboard shortcuts",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "global",
      title: "Global navigation and search",
      intro:
        "Use these commands from Bitbucket Cloud pages to reveal the shortcut guide, control the left navigation, or move focus into search.",
      shortcuts: [
        all("show-shortcuts", "Display keyboard shortcuts for the current page", ["Shift", "?"]),
        all("left-navigation", "Expand or collapse the left navigation", ["["]),
        all("focus-search", "Focus the site search field", ["/"]),
        all("search-bitbucket", "Search Bitbucket Cloud", ["?"]),
      ],
    },
    {
      id: "repository",
      title: "Repository pages",
      intro:
        "Repository-page shortcuts expose the secondary sidebar and move directly into code search or the current file list's filter.",
      shortcuts: [
        all("right-sidebar", "Expand or collapse the right sidebar", ["]"]),
        all("search-code", "Search for code", ["C"]),
        all("filter-files", "Filter files", ["F"]),
      ],
    },
    {
      id: "pull-requests",
      title: "Pull request review",
      intro:
        "Review a pull request, switch among its main tabs, manage the changed-file tree, finish a review, or watch further activity.",
      shortcuts: [
        all("approve", "Approve the pull request", ["A"]),
        all("request-changes", "Request changes", ["R"]),
        all("overview", "Go to the Overview tab", ["1"]),
        all("files-changed", "Go to the Files changed tab", ["2"]),
        all("commits", "Go to the Commits tab", ["3"]),
        all("file-tree", "Expand or collapse the file tree", ["F"]),
        all("finish-review", "Finish the review", ["S"]),
        all("watch", "Watch the pull request", ["W"]),
      ],
    },
  ],
};

export default bitbucket;
