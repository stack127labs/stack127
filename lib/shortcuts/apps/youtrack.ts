import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const tri = (
  id: string,
  action: string,
  windows: string[],
  macos: string[],
  note?: string,
): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos, linux: windows }),
  ...(note ? { note } : {}),
});

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys, macos: keys, linux: keys }),
  ...(note ? { note } : {}),
});

export const youtrack: AppShortcuts = {
  slug: "youtrack",
  name: "YouTrack",
  category: "Project management",
  platforms: [...platforms],
  intro:
    "YouTrack Cloud publishes keyboard tables for issue lists, single issues, rich text, and whiteboards. This reference keeps those contexts separate.",
  versionContext:
    "YouTrack Cloud 2026.2 keyboard shortcuts checked September 1, 2026. The source gives Windows or Linux and macOS variants, and many commands depend on the focused issue list or editor.",
  sourceUrl: "https://www.jetbrains.com/help/youtrack/cloud/keyboard-shortcuts.html",
  sourceLabel: "official YouTrack keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "issue-list",
      title: "Issue lists",
      intro: "Use these commands to search, select, open, and move through issues.",
      shortcuts: [
        shared("clear-focus", "Clear focus from the search or issue list", ["Escape"]),
        shared("search", "Focus issue search", ["/"]),
        shared("next-issue", "Move to the next issue", ["Down Arrow"]),
        shared("previous-issue", "Move to the previous issue", ["Up Arrow"]),
        shared("first-issue", "Move to the first issue", ["Home"]),
        shared("last-issue", "Move to the last issue", ["End"]),
        tri("next-page", "Go to the next issue page", ["Ctrl", "Right Arrow"], ["Control", "Shift", "Right Arrow"]),
        tri("previous-page", "Go to the previous issue page", ["Ctrl", "Left Arrow"], ["Control", "Shift", "Left Arrow"]),
        shared("expand-preview", "Expand the issue preview", ["Right Arrow"]),
        shared("collapse-preview", "Collapse the issue preview", ["Left Arrow"]),
        shared("select-issue", "Select the focused issue", ["Space"]),
        tri("select-all", "Select all issues", ["Ctrl", "A"], ["Cmd", "A"]),
        tri("edit-issue", "Edit the focused issue", ["F2"], ["F2"]),
        tri("open-issue", "Open the focused issue", ["F3"], ["F3"]),
        tri("copy-id", "Copy the issue ID", ["Ctrl", "C"], ["Cmd", "C"]),
        tri("copy-url", "Copy the issue URL", ["Ctrl", "C", "then", "C"], ["Cmd", "C", "then", "C"]),
        tri("new-issue", "Create a new issue", ["Alt", "Insert"], ["Control", "N"]),
        tri("new-subtask", "Create a subtask", ["Ctrl", "Alt", "Insert"], ["Control", "Option", "N"]),
        tri("assign", "Assign the issue", ["Ctrl", "M"], ["Cmd", "M"]),
        tri("star", "Star or unstar the issue", ["Ctrl", "Shift", ")"], ["Control", "Shift", ")"]),
        tri("attach", "Attach a file", ["Ctrl", "Alt", "A"], ["Control", "Option", "A"]),
        tri("comment", "Add a comment", ["Ctrl", "Alt", "C"], ["Control", "Option", "C"]),
        tri("shortcut-help", "Show keyboard shortcuts", ["Ctrl", "/"], ["Control", "/"]),
      ],
    },
    {
      id: "issue-editor",
      title: "Issue editor",
      intro: "These commands apply while editing an issue or its comments.",
      shortcuts: [
        tri("submit", "Submit the issue or comment", ["Ctrl", "Enter"], ["Cmd", "Return"]),
        shared("cancel", "Cancel editing", ["Escape"]),
        tri("issue-comments", "Open issue comments", ["Ctrl", "Shift", "C"], ["Cmd", "Shift", "C"]),
        tri("issue-history", "Open issue history", ["Ctrl", "Shift", "H"], ["Cmd", "Shift", "H"]),
        tri("saved-searches", "Open saved searches", ["Ctrl", "Shift", "!"], ["Cmd", "Shift", "!"]),
        tri("bold", "Bold text", ["Ctrl", "B"], ["Cmd", "B"]),
        tri("italic", "Italicize text", ["Ctrl", "I"], ["Cmd", "I"]),
        tri("strikethrough", "Strikethrough text", ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]),
        tri("monospace", "Format text as monospace", ["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"]),
        tri("visual-markdown", "Toggle visual or Markdown mode", ["Ctrl", "Shift", "P"], ["Cmd", "Shift", "P"]),
      ],
    },
    {
      id: "whiteboards",
      title: "Whiteboards",
      intro: "Use these tool and object commands while a YouTrack whiteboard has focus.",
      shortcuts: [
        shared("select-tool", "Choose the selection tool", ["V"]),
        shared("card", "Add a card", ["N"]),
        shared("text", "Add text", ["T"]),
        shared("add-items", "Open the add-items menu", ["A"]),
        tri("copy", "Copy selected objects", ["Ctrl", "C"], ["Cmd", "C"]),
        tri("paste", "Paste objects", ["Ctrl", "V"], ["Cmd", "V"]),
        tri("cut", "Cut selected objects", ["Ctrl", "X"], ["Cmd", "X"]),
        tri("duplicate", "Duplicate selected objects", ["Ctrl", "D"], ["Cmd", "D"]),
        shared("delete", "Delete selected objects", ["Delete"]),
        shared("deselect", "Deselect objects", ["Escape"]),
        shared("finish", "Finish the current text or card edit", ["Enter"]),
        tri("description", "Submit a whiteboard description", ["Ctrl", "Enter"], ["Cmd", "Return"]),
      ],
    },
  ],
};

export default youtrack;
