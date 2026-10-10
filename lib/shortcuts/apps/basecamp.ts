import type { AppShortcuts, Shortcut, ShortcutKey } from "../types.ts";

const key = (platform: "windows" | "macos", keys: string[], alternatives?: string[][]): ShortcutKey => ({
  platform,
  keys,
  ...(alternatives ? { alternatives } : {}),
});

const both = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: [key("windows", keys), key("macos", keys)],
  ...(note ? { note } : {}),
});

export const basecamp: AppShortcuts = {
  slug: "basecamp",
  name: "Basecamp",
  category: "Project management",
  platforms: ["windows", "macos"],
  versionContext:
    "Current Basecamp 5 keyboard cheat sheet checked August 31, 2026. Commands are shared by Windows and macOS except where Basecamp explicitly publishes Command or Option alternatives.",
  sourceUrl: "https://basecamp.com/keyboard",
  sourceLabel: "Basecamp 5 keyboard cheat sheet",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "jump-and-global",
      title: "Jump menu and global navigation",
      intro: "Shift-letter commands move to Basecamp's main destinations. On Mac, Command+J and Command+K are additional ways to open the Jump menu.",
      shortcuts: [
        {
          id: "jump-menu",
          action: "Open the Jump menu",
          keys: [key("windows", ["Shift", "J"]), key("macos", ["Shift", "J"], [["Cmd", "J"], ["Cmd", "K"]])],
        },
        both("home", "Go Home", ["Shift", "H"]),
        both("activity", "Open Activity", ["1"]),
        both("calendar", "Open Calendar", ["2"]),
        both("reports", "Open Reports", ["3"]),
        both("everything", "Open Everything", ["4"]),
        both("account", "Open My Account", ["Shift", "U"]),
        both("tasks", "Open My Tasks", ["Shift", "T"]),
        both("events", "Open My Events", ["Shift", "E"]),
        both("do-today", "Open Do Today", ["Shift", "V"]),
        both("bookmarks", "Open My Bookmarks", ["Shift", "B"]),
        both("notes", "Open My Notes", ["Shift", "N"]),
        both("sidebar", "Open sidebar Pings and notifications", ["Shift", "S"]),
        both("new-ping", "Start a new Ping", ["Shift", "P"]),
        both("shhh", "Silence notifications with Shhh", ["Shift", "Z"]),
        both("assignments", "Open My Assignments", ["Shift", "A"]),
        both("my-activity", "Open My Activity", ["Shift", "Y"]),
        both("drafts", "Open My Drafts", ["Shift", "W"]),
        both("boosts", "Open My Boosts", ["Shift", "O"]),
        both("help", "Open keyboard shortcut help", ["?"]),
        both("logout", "Log out", [":", "then", "W", "then", "Q"], "Type the characters in sequence; this is not a simultaneous chord."),
      ],
    },
    {
      id: "projects-and-pages",
      title: "Projects and pages",
      intro: "These keys act on the current project, tool, or page. Shift+C moves focus to either Campfire chat or a comment form, depending on the page.",
      shortcuts: [
        both("project-home", "Go to the current project's home", ["Shift", "G"]),
        both("new-item", "Create a new item in the current project tool", ["Shift", "M"]),
        both("filter", "Filter the current page", ["Shift", "F"]),
        both("chat-comment", "Focus Campfire chat or the comment form", ["Shift", "C"]),
        both("assign-self", "Assign the current item to yourself", ["Shift", "K"]),
        both("mark-done", "Mark the current to-do or card done", ["Shift", "D"]),
        both("calendar-today", "Go to today in Calendar or the Lineup", ["Shift", "D"]),
        both("back", "Go back", ["Left"]),
        both("forward", "Go forward", ["Right"]),
        both("sidebar-read", "Mark the selected sidebar item read or unread", ["Shift", "X"]),
      ],
    },
    {
      id: "jump-search",
      title: "Jump menu search",
      intro: "These commands run after opening the Jump menu and entering a search. The Alt/Option version limits results to the current project.",
      shortcuts: [
        both("search-all", "Search across all projects", ["Shift", "Enter"]),
        {
          id: "search-current-project",
          action: "Search only the current project",
          keys: [key("windows", ["Shift", "Alt", "Enter"]), key("macos", ["Shift", "Option", "Enter"])],
        },
      ],
    },
  ],
};

export default basecamp;
