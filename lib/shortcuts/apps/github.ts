import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const github: AppShortcuts = {
  slug: "github",
  name: "GitHub",
  category: "Code hosting platform",
  platforms: [...platforms],
  intro:
    "GitHub's keyboard layer changes with the page you are on. These groups cover site navigation, repository sections, issue and pull request triage, comment editing, code browsing, and notifications.",
  versionContext:
    "Shortcuts documented on docs.github.com in August 2026. Character key shortcuts can be disabled in accessibility settings, and the GitHub Command Palette is in public preview and disabled by default.",
  sourceUrl: "https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts",
  sourceLabel: "official keyboard shortcuts",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "site-navigation",
      title: "Site wide navigation",
      intro: "Open help, search GitHub, jump between site areas, and reach the command palette from any page.",
      shortcuts: [
        {
          id: "shortcut-help",
          action: "Show keyboard shortcut dialog for the current page",
          keys: combo(platforms, ["?"]),
        },
        {
          id: "focus-search",
          action: "Focus the search bar",
          keys: combo(platforms, ["S"]),
          note: "Pressing / also focuses the search bar.",
        },
        {
          id: "command-palette",
          action: "Open GitHub Command Palette",
          keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]),
          note: "Opt-in through feature preview. Ctrl+Shift+K (Cmd+Shift+K) switches to command mode.",
        },
        {
          id: "goto-notifications",
          action: "Go to notifications",
          keys: combo(platforms, ["G", "N"]),
          note: "Two keystrokes pressed in sequence.",
        },
        {
          id: "open-githubdev",
          action: "Open repository or pull request in github.dev editor",
          keys: combo(platforms, ["."]),
          note: "Press > instead to open github.dev in a new browser tab.",
        },
      ],
    },
    {
      id: "repository-tabs",
      title: "Repository tabs",
      intro: "Sequence shortcuts that jump straight to repository sections.",
      shortcuts: [
        { id: "goto-code", action: "Go to Code tab", keys: combo(platforms, ["G", "C"]) },
        { id: "goto-issues", action: "Go to Issues tab", keys: combo(platforms, ["G", "I"]) },
        {
          id: "goto-pull-requests",
          action: "Go to Pull requests tab",
          keys: combo(platforms, ["G", "P"]),
        },
        { id: "goto-actions", action: "Go to Actions tab", keys: combo(platforms, ["G", "A"]) },
        { id: "goto-wiki", action: "Go to Wiki tab", keys: combo(platforms, ["G", "W"]) },
        { id: "goto-discussions", action: "Go to Discussions tab", keys: combo(platforms, ["G", "G"]) },
        { id: "goto-security", action: "Go to Security and quality tab", keys: combo(platforms, ["G", "S"]) },
      ],
    },
    {
      id: "issues-and-pulls",
      title: "Issues and pull requests",
      intro: "Creating, opening, and metadata triage on lists and issue pages.",
      shortcuts: [
        {
          id: "create-issue",
          action: "Create an issue",
          keys: combo(platforms, ["C"]),
          note: "Works on issue and pull request lists.",
        },
        {
          id: "open-issue",
          action: "Open highlighted issue or pull request",
          keys: combo(platforms, ["O"]),
          note: "Enter also opens it.",
        },
        { id: "request-reviewer", action: "Request a reviewer", keys: combo(platforms, ["Q"]) },
        { id: "set-assignee", action: "Set assignee", keys: combo(platforms, ["A"]) },
        {
          id: "apply-label",
          action: "Apply or filter by label",
          keys: combo(platforms, ["L"]),
        },
        {
          id: "link-issue",
          action: "Link an issue or pull request",
          keys: combo(platforms, ["X"]),
        },
        {
          id: "submit-review-comment",
          action: "Submit a review comment",
          keys: combo(platforms, ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Enter"]),
          note: "In the Files changed tab of a pull request.",
        },
      ],
    },
    {
      id: "comments-and-markdown",
      title: "Comments and markdown",
      intro: "Format a comment, open the editor, submit it, or move through markdown-friendly controls.",
      shortcuts: [
        {
          id: "submit-comment",
          action: "Submit comment",
          keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]),
        },
        {
          id: "toggle-write-preview",
          action: "Toggle Write and Preview tabs",
          keys: combo(platforms, ["Ctrl", "Shift", "P"], ["Cmd", "Shift", "P"]),
        },
        {
          id: "quote-reply",
          action: "Quote selected text in your reply",
          keys: combo(platforms, ["R"]),
        },
        { id: "bold-markdown", action: "Insert bold Markdown", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "italic-markdown", action: "Insert italic Markdown", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "code-markdown", action: "Insert inline code Markdown", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "link-markdown", action: "Insert a Markdown link", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "ordered-list", action: "Insert an ordered list", keys: combo(platforms, ["Ctrl", "Shift", "7"], ["Cmd", "Shift", "7"]) },
        { id: "unordered-list", action: "Insert an unordered list", keys: combo(platforms, ["Ctrl", "Shift", "8"], ["Cmd", "Shift", "8"]) },
      ],
    },
    {
      id: "code-browsing",
      title: "Source code browsing",
      intro: "Use single-key actions to move through file views, diffs, blame, and the code around a change.",
      shortcuts: [
        { id: "file-finder", action: "Activate the file finder", keys: combo(platforms, ["T"]) },
        { id: "jump-to-line", action: "Jump to a line in your code", keys: combo(platforms, ["L"]) },
        { id: "blame-view", action: "Open blame view", keys: combo(platforms, ["B"]) },
        { id: "expand-url", action: "Expand a file URL to its canonical form", keys: combo(platforms, ["Y"]) },
        { id: "toggle-diff-comments", action: "Show or hide diff comments", keys: combo(platforms, ["I"]) },
        { id: "toggle-annotations", action: "Show or hide diff annotations", keys: combo(platforms, ["A"]) },
        { id: "open-edit-file", action: "Open the source file in the editor", keys: combo(platforms, ["E"]) },
      ],
    },
    {
      id: "notifications",
      title: "Notifications",
      intro: "Open notification views and move through the updates waiting for your attention.",
      shortcuts: [
        {
          id: "mark-done",
          action: "Mark notification as done",
          keys: combo(platforms, ["E"]),
        },
        {
          id: "mark-read",
          action: "Mark notification as read",
          keys: combo(platforms, ["Shift", "I"]),
          note: "Shift+U marks it unread again.",
        },
        { id: "mark-unread", action: "Mark notification as unread", keys: combo(platforms, ["Shift", "U"]) },
        { id: "unsubscribe", action: "Unsubscribe from the notification", keys: combo(platforms, ["Shift", "M"]) },
      ],
    },
    {
      id: "issue-lists",
      title: "Issue and pull request lists",
      intro: "Filter lists by author, label, milestone, or assignee, then open the selected issue or pull request.",
      shortcuts: [
        { id: "focus-issue-filter", action: "Focus the issue or pull request filter", keys: combo(platforms, ["Ctrl", "/"], ["Cmd", "/"]) },
        { id: "filter-author", action: "Filter by author", keys: combo(platforms, ["U"]) },
        { id: "filter-label", action: "Filter by or edit labels", keys: combo(platforms, ["L"]) },
        { id: "filter-milestone", action: "Filter by or edit milestones", keys: combo(platforms, ["M"]) },
        { id: "filter-assignee", action: "Filter by or edit assignee", keys: combo(platforms, ["A"]) },
      ],
    },
    {
      id: "projects-and-actions",
      title: "Projects and Actions",
      intro: "Move through project boards and workflow logs when GitHub is acting more like an operations workspace.",
      shortcuts: [
        { id: "project-filter", action: "Focus the project filter field", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "project-edit-cell", action: "Toggle edit mode for a project cell", keys: combo(platforms, ["Enter"]) },
        { id: "project-select", action: "Select a project item", keys: combo(platforms, ["Shift", "Space"]) },
        { id: "project-open", action: "Open a selected project item", keys: combo(platforms, ["Space"]) },
        { id: "action-workflow-file", action: "Go to the workflow file", keys: combo(platforms, ["G", "F"]) },
        { id: "action-toggle-time", action: "Toggle timestamps in workflow logs", keys: combo(platforms, ["T"]) },
        { id: "action-fullscreen", action: "Toggle full-screen workflow logs", keys: combo(platforms, ["F"]) },
      ],
    },
  ],
};
