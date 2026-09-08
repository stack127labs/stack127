import { combo } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;
const dual = (id: string, action: string, desktop: string[], mac: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: platforms.flatMap((platform) => [{ platform, keys: platform === "macos" ? mac : desktop }]),
  ...(note ? { note } : {}),
});
const same = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: combo(platforms, keys),
  ...(note ? { note } : {}),
});

export const obsidian: AppShortcuts = {
  slug: "obsidian",
  name: "Obsidian",
  category: "Notes and docs",
  platforms: [...platforms],
  intro:
    "Obsidian separates system editing shortcuts from customizable command hotkeys. This reference covers the documented editing and navigation defaults across Windows, Linux, and macOS, while leaving plugin and user-assigned commands to Obsidian's Hotkeys settings.",
  versionContext:
    "Obsidian editing and navigation shortcuts from the current official help, checked September 1, 2026. Command hotkeys can be changed or assigned multiple times in Settings > Hotkeys, and displayed keys follow a US layout.",
  sourceUrl: "https://obsidian.md/help/editing-shortcuts",
  sourceLabel: "official Obsidian editing shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "editing",
      title: "Editing",
      intro: "Use these defaults for common text editing actions in a note. Obsidian distinguishes them from configurable command hotkeys.",
      shortcuts: [
        dual("copy", "Copy", ["Ctrl", "C"], ["Cmd", "C"]),
        dual("cut", "Cut", ["Ctrl", "X"], ["Cmd", "X"]),
        dual("paste", "Paste", ["Ctrl", "V"], ["Cmd", "V"]),
        dual("paste-plain", "Paste without formatting", ["Ctrl", "Shift", "V"], ["Cmd", "Shift", "V"]),
        dual("undo", "Undo", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("redo", "Redo", ["Ctrl", "Y"], ["Cmd", "Shift", "Z"], "Windows and Linux list Ctrl+Y; macOS uses Cmd+Shift+Z."),
        dual("delete-line", "Delete the current line", ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"], "Only applies when no text is selected."),
        same("new-line", "Insert a new line", ["Enter"]),
        same("backspace", "Delete the previous character", ["Backspace"]),
        same("delete-forward", "Delete the next character", ["Delete"]),
      ],
    },
    {
      id: "navigation",
      title: "Text navigation",
      intro: "Move the cursor by character, word, line, page, or whole note with these platform-specific navigation defaults.",
      shortcuts: [
        same("character-left", "Move one character left", ["Left"]),
        same("character-right", "Move one character right", ["Right"]),
        same("line-up", "Move to the previous line", ["Up"]),
        same("line-down", "Move to the next line", ["Down"]),
        dual("word-left", "Move to the beginning of the previous word", ["Ctrl", "Left"], ["Option", "Left"]),
        dual("word-right", "Move to the end of the next word", ["Ctrl", "Right"], ["Option", "Right"]),
        dual("line-start", "Move to the beginning of the current line", ["Home"], ["Cmd", "Left"]),
        dual("line-end", "Move to the end of the current line", ["End"], ["Cmd", "Right"]),
        dual("note-start", "Move to the beginning of the note", ["Ctrl", "Home"], ["Cmd", "Up"]),
        dual("note-end", "Move to the end of the note", ["Ctrl", "End"], ["Cmd", "Down"]),
        dual("page-up", "Move up one page", ["Page Up"], ["Fn", "Up"]),
        dual("page-down", "Move down one page", ["Page Down"], ["Fn", "Down"]),
      ],
    },
    {
      id: "selection",
      title: "Selection",
      intro: "Extend or simplify a text selection with the same movement pattern used for cursor navigation.",
      shortcuts: [
        same("cancel-selection", "Simplify the selection", ["Escape"]),
        dual("select-all", "Select all", ["Ctrl", "A"], ["Cmd", "A"]),
        same("extend-character-left", "Extend selection one character left", ["Shift", "Left"]),
        same("extend-character-right", "Extend selection one character right", ["Shift", "Right"]),
        dual("extend-word-left", "Extend selection to the previous word", ["Ctrl", "Shift", "Left"], ["Option", "Shift", "Left"]),
        dual("extend-word-right", "Extend selection to the next word", ["Ctrl", "Shift", "Right"], ["Option", "Shift", "Right"]),
        dual("extend-line-start", "Extend selection to the line start", ["Shift", "Home"], ["Cmd", "Shift", "Left"]),
        dual("extend-line-end", "Extend selection to the line end", ["Shift", "End"], ["Cmd", "Shift", "Right"]),
        dual("extend-note-start", "Extend selection to the beginning of the note", ["Ctrl", "Shift", "Home"], ["Cmd", "Shift", "Up"]),
        dual("extend-note-end", "Extend selection to the end of the note", ["Ctrl", "Shift", "End"], ["Cmd", "Shift", "Down"]),
      ],
    },
  ],
};

export default obsidian;
