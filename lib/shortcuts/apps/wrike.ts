import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const dual = (
  id: string,
  action: string,
  windows: string[],
  macos: string[],
  note?: string,
): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys, macos: keys }),
  ...(note ? { note } : {}),
});

const macOnly = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { macos: keys }),
  ...(note ? { note } : {}),
});

export const wrike: AppShortcuts = {
  slug: "wrike",
  name: "Wrike",
  category: "Project management",
  platforms: [...platforms],
  intro:
    "Wrike publishes shortcuts for task creation, search, comments, text formatting, table views, and Gantt chart navigation.",
  versionContext:
    "Wrike keyboard shortcut and Gantt chart shortcut pages checked September 1, 2026. Some commands depend on the current view, browser, or focus inside a task description.",
  sourceUrl: "https://help.wrike.com/hc/en-us/articles/210322725-Keyboard-Shortcuts",
  sourceLabel: "official Wrike keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "global",
      title: "Global and task editing",
      intro: "Use these commands to open common Wrike controls and format task descriptions or comments.",
      shortcuts: [
        dual("new-task", "Create a new task", ["Alt", "Shift", "N"], ["Cmd", "Shift", "N"]),
        dual("search", "Open search", ["Alt", "Shift", "S"], ["Cmd", "Shift", "S"]),
        dual("fullscreen", "Toggle fullscreen", ["Alt", "Shift", "F"], ["Cmd", "Shift", "F"]),
        dual("shortcut-list", "Show the shortcut list", ["Alt", "Shift", "?"], ["Cmd", "Shift", "?"]),
        dual("recent-tasks", "Open recent tasks", ["Ctrl", "Shift", "E"], ["Cmd", "Shift", "E"]),
        shared("line-break", "Insert a line break", ["Shift", "Enter"]),
        dual("bold", "Bold text", ["Ctrl", "B"], ["Cmd", "B"]),
        dual("italic", "Italicize text", ["Ctrl", "I"], ["Cmd", "I"]),
        dual("strikethrough", "Strikethrough text", ["Shift", "Ctrl", "X"], ["Shift", "Cmd", "X"]),
        dual("inline-code", "Format inline code", ["Shift", "Ctrl", "C"], ["Shift", "Cmd", "C"]),
        dual("code-block", "Format a code block", ["Shift", "Alt", "Ctrl", "C"], ["Shift", "Option", "Cmd", "C"]),
        shared("skip-description", "Skip the task description", ["Escape"]),
        dual("submit-comment", "Post a comment", ["Ctrl", "Enter"], ["Cmd", "Enter"], "Enter also posts when the profile uses the default single-key submit behavior."),
      ],
    },
    {
      id: "table",
      title: "Table view",
      intro: "These shortcuts apply in Wrike Table view while sorting and editing rows.",
      shortcuts: [
        dual("table-new-task", "Create a task in Table view", ["Alt", "Shift", "N"], ["Ctrl", "Shift", "N"]),
        dual("table-undo", "Undo a Table view change", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("table-redo", "Redo a Table view change", ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]),
        dual("collapse", "Collapse the selected item", ["Alt", "Shift", "Left Arrow"], ["Option", "Shift", "Left Arrow"]),
        dual("expand", "Expand the selected item", ["Alt", "Shift", "Right Arrow"], ["Option", "Shift", "Right Arrow"]),
      ],
    },
    {
      id: "gantt",
      title: "Gantt charts",
      intro: "Wrike's Gantt chart reference documents keyboard entry for dates and hierarchy changes.",
      shortcuts: [
        shared("date-number", "Enter a day number in a date field", ["Number"], "The Gantt chart reference documents number entry in a date field."),
        shared("today", "Set a date field to today", ["T"]),
        shared("tomorrow", "Set a date field to tomorrow", ["Y"]),
        shared("this-month", "Set a date field to the current month", ["TOM"]),
        macOnly("task-up", "Move a task up one level in the hierarchy", ["Cmd", "["]),
        macOnly("task-down", "Move a task down one level in the hierarchy", ["Cmd", "]"]),
      ],
    },
  ],
};

export default wrike;
