import { combo } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: combo(platforms, keys),
  ...(note ? { note } : {}),
});

const mod = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: combo(platforms, keys, keys.map((key) => (key === "Ctrl" ? "Cmd" : key === "Alt" ? "Option" : key))),
  ...(note ? { note } : {}),
});

export const linear: AppShortcuts = {
  slug: "linear",
  name: "Linear",
  category: "Project management",
  platforms: [...platforms],
  versionContext:
    "Current Linear issue, search, favorites, layout, and editor documentation checked October 10, 2026. Public docs cover common defaults and may not include every workspace- or permission-dependent action.",
  sourceUrl: "https://linear.app/docs/select-issues",
  sourceLabel: "official Linear issue-selection and keyboard documentation",
  lastVerified: "2026-10-10",
  groups: [
    {
      id: "navigation-and-search",
      title: "Navigation and search",
      intro: "Open the shortcut help, search Linear, switch views, and jump through the main issue and document areas.",
      shortcuts: [
        shared("shortcut-help", "Open keyboard shortcut help", ["?"]),
        shared("search", "Search Linear", ["/"]),
        mod("find-in-view", "Find in the current view", ["Ctrl", "F"]),
        mod("command-menu", "Open the command menu", ["Ctrl", "K"]),
        shared("recent-issues", "Open recent issues or searches", ["O", "then", "I"]),
        shared("favorites", "Open favorites", ["O", "then", "F"]),
        shared("documents", "Open the document list", ["O", "then", "D"]),
        shared("active-issues", "Go to active issues", ["G", "then", "A"]),
        shared("backlog", "Go to the backlog", ["G", "then", "B"]),
        shared("archived-issues", "Go to archived issues", ["G", "then", "X"]),
        mod("board-list", "Switch between board and list layout", ["Ctrl", "B"]),
        shared("create-issue", "Create an issue", ["C"]),
        shared("full-screen-issue", "Open the issue form full-screen", ["V"]),
        mod("save-view", "Save the current view", ["Alt", "V"]),
        shared("work-on-issue", "Open the work-on issue menu", ["W", "then", "O"]),
        mod("last-used-tool", "Open the last used tool", ["Ctrl", "Alt", "."], "On macOS, the documented form is Cmd+Option+Period."),
      ],
    },
    {
      id: "issue-selection",
      title: "Issue selection and priority",
      intro: "Move through issues, select one or many, and use the issue actions available from the selection.",
      shortcuts: [
        {
          id: "next-issue",
          action: "Move to the next issue",
          keys: platforms.map((platform) => ({ platform, keys: ["J"], alternatives: [["Down"]] })),
        },
        {
          id: "previous-issue",
          action: "Move to the previous issue",
          keys: platforms.map((platform) => ({ platform, keys: ["K"], alternatives: [["Up"]] })),
        },
        shared("select-issue", "Select the focused issue", ["X"]),
        shared("select-more", "Extend the issue selection", ["Shift", "X"]),
        shared("clear-selection", "Clear the issue selection", ["Esc"]),
        mod("select-all", "Select all issues in the view", ["Ctrl", "A"]),
        shared("set-priority", "Set priority for the selected issue", ["P"]),
        mod("delete-issue", "Delete the selected issue", ["Ctrl", "Delete"]),
        mod("restore-issue", "Restore the last deleted issue", ["Ctrl", "Z"]),
        mod("move-to-top", "Move an issue to the top of the list", ["Ctrl", "Shift", "Alt", "Up"], "On macOS, use Cmd+Shift+Option+Up."),
        mod("move-to-bottom", "Move an issue to the bottom of the list", ["Ctrl", "Shift", "Alt", "Down"], "On macOS, use Cmd+Shift+Option+Down."),
        mod("move-up", "Move an issue up one position", ["Ctrl", "Alt", "Up"], "On macOS, use Cmd+Option+Up."),
        mod("move-down", "Move an issue down one position", ["Ctrl", "Alt", "Down"], "On macOS, use Cmd+Option+Down."),
        shared("swimlane", "Change the board swimlane", ["T"]),
        mod("favorite-focused", "Toggle favorite on the focused item", ["Alt", "F"]),
      ],
    },
    {
      id: "editor",
      title: "Editor formatting",
      intro: "Format selected text, insert links and line breaks, and undo editor changes without opening a toolbar.",
      shortcuts: [
        mod("bold", "Bold selected text", ["Ctrl", "B"]),
        mod("italic", "Italicize selected text", ["Ctrl", "I"]),
        mod("strikethrough", "Strikethrough selected text", ["Ctrl", "Shift", "S"]),
        mod("underline", "Underline selected text", ["Ctrl", "U"]),
        mod("inline-code", "Format selected text as inline code", ["Ctrl", "E"]),
        mod("link", "Add a link", ["Ctrl", "K"]),
        mod("code-block", "Insert a code block", ["Ctrl", "Shift", "\\"]),
        mod("select-all-text", "Select all editor text", ["Ctrl", "A"]),
        mod("undo", "Undo the last editor change", ["Ctrl", "Z"]),
        mod("redo", "Redo the last editor change", ["Ctrl", "Shift", "Z"]),
        shared("line-break", "Insert a line break", ["Shift", "Enter"]),
        mod("upload", "Upload a file in the editor", ["Ctrl", "Shift", "U"]),
        shared("dismiss-issue-form", "Dismiss or save the issue draft", ["Esc"]),
      ],
    },
  ],
};

export default linear;
