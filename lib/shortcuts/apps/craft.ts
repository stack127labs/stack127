import type { AppShortcuts, Shortcut, ShortcutKey } from "../types.ts";

const key = (platform: "windows" | "macos", keys: string[], alternatives?: string[][]): ShortcutKey => ({
  platform,
  keys,
  ...(alternatives ? { alternatives } : {}),
});

const pair = (
  id: string,
  action: string,
  windows: string[],
  macos: string[],
  windowsAlternatives?: string[][],
  macosAlternatives?: string[][],
  note?: string,
): Shortcut => ({
  id,
  action,
  keys: [
    key("windows", windows, windowsAlternatives),
    key("macos", macos, macosAlternatives),
  ],
  ...(note ? { note } : {}),
});

const shared = (id: string, action: string, keys: string[], alternatives?: string[][], note?: string): Shortcut =>
  pair(id, action, keys, keys, alternatives, alternatives, note);

const mac = (id: string, action: string, keys: string[], alternatives?: string[][], note?: string): Shortcut => ({
  id,
  action,
  keys: [key("macos", keys, alternatives)],
  ...(note ? { note } : {}),
});

export const craft: AppShortcuts = {
  slug: "craft",
  name: "Craft",
  category: "Notes and documents",
  platforms: ["windows", "macos"],
  intro:
    "Craft separates document navigation, task entry, block editing, formatting, organization, and tabs. Several commands are available only in the Mac app, so those bindings are kept platform-specific.",
  versionContext:
    "Current Craft keyboard shortcut reference checked September 1, 2026. Craft publishes separate Mac and Windows lists; users can also add app-specific shortcuts through macOS settings.",
  sourceUrl: "https://support.craft.do/en/introduction/shortcuts",
  sourceLabel: "Craft keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "general",
      title: "General",
      intro: "Use these commands to cancel, open settings, search, focus the editor, or show the sidebar.",
      shortcuts: [
        shared("cancel", "Cancel the current action", ["Esc"]),
        pair("settings", "Open Settings", ["Ctrl", ","], ["Cmd", ","]),
        pair("show-shortcuts", "Show all shortcuts", ["Ctrl", "Alt", ","], ["Cmd", "Option", ","]),
        pair("quick-search", "Open Quick Search", ["Ctrl", "O"], ["Cmd", "O"], [["Ctrl", "P"]]),
        pair("focus", "Focus the editor", ["Ctrl", "."], ["Cmd", "."]),
        pair("sidebar", "Toggle the sidebar", ["Ctrl", "\\"], ["Cmd", "\\"]),
      ],
    },
    {
      id: "navigation",
      title: "Navigation",
      intro: "Mac navigation commands move through document history, views, and daily notes.",
      shortcuts: [
        mac("back", "Go back", ["Cmd", "Left"], [["Cmd", "["]]),
        mac("forward", "Go forward", ["Cmd", "Right"], [["Cmd", "]"]]),
        mac("open-child", "Open the selected page", ["Cmd", "Option", "Right"], [["Cmd", "]"]]),
        mac("daily-note", "Open today's note", ["Cmd", "Option", "N"]),
        mac("open-link", "Open the selected link", ["Cmd", "Option", "Return"]),
        mac("view-one", "Open view 1", ["Cmd", "Option", "1"]),
        mac("view-two", "Open view 2", ["Cmd", "Option", "2"]),
        mac("view-three", "Open view 3", ["Cmd", "Option", "3"]),
        mac("view-four", "Open view 4", ["Cmd", "Option", "4"]),
        mac("view-five", "Open view 5", ["Cmd", "Option", "5"]),
        mac("zoom-in", "Zoom in", ["Cmd", "+"]),
        mac("zoom-out", "Zoom out", ["Cmd", "-"]),
        mac("zoom-reset", "Reset zoom", ["Cmd", "0"]),
      ],
    },
    {
      id: "documents",
      title: "Documents",
      intro: "Create, search, remove, and link documents from the current Craft workspace.",
      shortcuts: [
        pair("new-document", "Create a new document", ["Ctrl", "N"], ["Cmd", "N"]),
        pair("delete-document", "Delete the selected document", ["Delete"], ["Delete"]),
        pair("search-document", "Search the current document", ["Ctrl", "F"], ["Cmd", "F"]),
        mac("copy-deeplink", "Copy the document deeplink", ["Cmd", "Option", "L"]),
        mac("copy-deeplink-markdown", "Copy the document deeplink as Markdown", ["Cmd", "Option", "Shift", "L"]),
      ],
    },
    {
      id: "tasks",
      title: "Tasks",
      intro: "Task shortcuts create, complete, cancel, schedule, and move tasks without leaving the editor.",
      shortcuts: [
        mac("new-task", "Create a new task", ["Cmd", "J"]),
        shared("task-below", "Create a task below the current task", ["Space"]),
        mac("task-complete", "Mark the task complete", ["Cmd", "Option", "T"]),
        mac("task-canceled", "Mark the task canceled", ["Cmd", "Option", "Shift", "T"]),
        mac("schedule-task", "Schedule the task", ["Cmd", "Shift", "S"]),
        mac("schedule-today", "Schedule the task for today", ["Cmd", "Shift", "Option", "S"]),
        mac("set-deadline", "Set a deadline", ["Cmd", "Shift", "D"]),
        mac("set-reminder", "Set a reminder", ["Cmd", "Shift", "R"]),
        mac("reminder-one-hour", "Set a reminder for one hour", ["Cmd", "Shift", "Option", "R"]),
        shared("task-up", "Move to the previous task or calendar item", ["Arrow", "Up"]),
        shared("task-down", "Move to the next task or calendar item", ["Arrow", "Down"]),
        shared("task-open", "Open the selected task or calendar item", ["Return"]),
      ],
    },
    {
      id: "editing",
      title: "Editing",
      intro: "Block insertion, duplication, assistant, comments, and history commands apply to the focused editor.",
      shortcuts: [
        shared("insert-below", "Insert a block below", ["Space"]),
        shared("insert-above", "Insert a block above", ["Shift", "Space"]),
        shared("edit-text", "Edit the current text block", ["Return"]),
        shared("page-block", "Insert a page block", ["Shift", "Return"]),
        pair("duplicate", "Duplicate the current block", ["Ctrl", "D"], ["Cmd", "D"]),
        pair("assistant", "Open the Craft assistant", ["Ctrl", "Enter"], ["Cmd", "Return"]),
        pair("comment", "Add a comment", ["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"]),
        shared("context-menu", "Open the block context menu", ["Ctrl", "Return"]),
        pair("undo", "Undo", ["Ctrl", "Z"], ["Cmd", "Z"]),
        pair("redo", "Redo", ["Ctrl", "Y"], ["Cmd", "Shift", "Z"], [["Ctrl", "Shift", "Z"]]),
        pair("select-all", "Select all", ["Ctrl", "A"], ["Cmd", "A"]),
      ],
    },
    {
      id: "formatting",
      title: "Formatting",
      intro: "Formatting commands apply to the selected text or current block. List levels use the documented platform modifiers.",
      shortcuts: [
        pair("heading-one", "Apply Heading 1", ["Ctrl", "Shift", "1"], ["Cmd", "Option", "6"]),
        pair("heading-two", "Apply Heading 2", ["Ctrl", "Shift", "2"], ["Cmd", "Option", "7"]),
        pair("task-list", "Create a task list", ["Ctrl", "Shift", "3"], ["Cmd", "Option", "T"]),
        pair("bulleted-list", "Create a bulleted list", ["Ctrl", "Shift", "8"], ["Cmd", "Option", "8"]),
        pair("numbered-list", "Create a numbered list", ["Ctrl", "Shift", "7"], ["Cmd", "Option", "9"]),
        pair("bold", "Bold", ["Ctrl", "B"], ["Cmd", "B"]),
        pair("italic", "Italic", ["Ctrl", "I"], ["Cmd", "I"]),
        pair("code", "Apply code formatting", ["Ctrl", "Shift", "C"], ["Cmd", "Shift", "C"]),
        pair("strikethrough", "Strikethrough", ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "-"]),
        pair("link", "Add or edit a link", ["Ctrl", "K"], ["Cmd", "K"]),
        pair("highlight", "Highlight selected text", ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]),
        shared("indent", "Indent the current block", ["Tab"]),
        shared("outdent", "Outdent the current block", ["Shift", "Tab"]),
      ],
    },
    {
      id: "organization",
      title: "Organization",
      intro: "Move blocks, group content, and transfer content between documents with these commands.",
      shortcuts: [
        pair("move-up", "Move the current block up", ["Alt", "Up"], ["Cmd", "Option", "Up"]),
        pair("move-down", "Move the current block down", ["Alt", "Down"], ["Cmd", "Option", "Down"]),
        mac("move-page-up", "Move the current page up", ["Cmd", "Shift", "Option", "Up"]),
        mac("move-page-down", "Move the current page down", ["Cmd", "Shift", "Option", "Down"]),
        mac("new-page", "Create a new page", ["Cmd", "Ctrl", "N"]),
        mac("group", "Group selected blocks", ["Cmd", "G"]),
        pair("cut", "Cut", ["Ctrl", "X"], ["Cmd", "X"]),
        pair("copy", "Copy", ["Ctrl", "C"], ["Cmd", "C"]),
        pair("paste", "Paste", ["Ctrl", "V"], ["Cmd", "V"]),
        pair("paste-without-formatting", "Paste without formatting", ["Ctrl", "Shift", "V"], ["Cmd", "Shift", "V"]),
      ],
    },
    {
      id: "tabs-and-windows",
      title: "Tabs and windows",
      intro: "Open, close, and cycle Craft tabs and windows using the platform-specific bindings.",
      shortcuts: [
        pair("new-window", "Open a new window", ["Ctrl", "Shift", "N"], ["Cmd", "Shift", "N"]),
        pair("close-window", "Close the current window", ["Ctrl", "W"], ["Cmd", "W"], [["Ctrl", "F4"]]),
        pair("new-tab", "Open a new tab", ["Ctrl", "T"], ["Cmd", "T"]),
        pair("next-tab", "Switch to the next tab", ["Ctrl", "Tab"], ["Cmd", "Shift", "]"]),
        pair("previous-tab", "Switch to the previous tab", ["Ctrl", "Shift", "Tab"], ["Cmd", "Shift", "["]),
        pair("reopen-tab", "Reopen the last closed tab", ["Ctrl", "Shift", "T"], ["Cmd", "Shift", "T"]),
      ],
    },
  ],
};

export default craft;
