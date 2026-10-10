import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const simplenote: AppShortcuts = {
  slug: "simplenote",
  name: "Simplenote",
  category: "Notes and writing",
  platforms: [...platforms],
  versionContext:
    "Simplenote desktop shortcuts checked September 1, 2026. The source separates Electron on Linux and Windows from the macOS app, and its full in-app list may include more commands than the common entries shown here.",
  sourceUrl: "https://simplenote.com/help/",
  sourceLabel: "official Simplenote help and keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "notes",
      title: "Notes and search",
      intro: "These desktop commands create notes, search the note list, print a note, and remove the current note from the macOS app.",
      shortcuts: [
        { id: "new-note", action: "Create a new note", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "I"], macos: ["Cmd", "N"], linux: ["Ctrl", "Shift", "I"] }) },
        { id: "search-notes", action: "Search notes", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "S"], macos: ["Cmd", "L"], linux: ["Ctrl", "Shift", "S"] }) },
        { id: "print-note", action: "Print the current note", keys: perPlatform(platforms, { windows: ["Ctrl", "P"], macos: ["Cmd", "P"], linux: ["Ctrl", "P"] }) },
        { id: "delete-note", action: "Delete the current note", keys: perPlatform(platforms, { macos: ["Shift", "Cmd", "Backspace"] }), note: "The official table lists this shortcut for macOS." },
      ],
    },
    {
      id: "editing-and-view",
      title: "Editing and view",
      intro: "Editing and view commands add checklist items, change the writing view, show the shortcut list, and adjust the desktop font size.",
      shortcuts: [
        { id: "checklist", action: "Insert a checklist item", keys: combo(platforms, ["Ctrl", "Shift", "C"], ["Cmd", "Shift", "C"]) },
        { id: "focus-mode", action: "Toggle focus mode", keys: combo(platforms, ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"]) },
        { id: "markdown-preview", action: "Toggle Markdown preview", keys: combo(platforms, ["Ctrl", "Shift", "P"], ["Cmd", "Shift", "P"]) },
        { id: "show-shortcuts", action: "Show keyboard shortcuts", keys: perPlatform(platforms, { windows: ["Ctrl", "/"], macos: ["Cmd", ","], linux: ["Ctrl", "/"] }) },
        { id: "font-increase", action: "Increase font size", keys: combo(platforms, ["Ctrl", "+"], ["Cmd", "+"]) },
        { id: "font-decrease", action: "Decrease font size", keys: combo(platforms, ["Ctrl", "-"], ["Cmd", "-"]) },
        { id: "font-reset", action: "Reset font size", keys: combo(platforms, ["Ctrl", "0"], ["Cmd", "0"]) },
      ],
    },
  ],
};

export default simplenote;
