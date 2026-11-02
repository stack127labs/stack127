import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;
const electronPlatforms = ["windows", "linux"] as const;

export const simplenote: AppShortcuts = {
  slug: "simplenote",
  name: "Simplenote",
  category: "Notes and writing",
  platforms: [...platforms],
  versionContext:
    "Simplenote desktop. Windows and Linux share one app; macOS has its own.",
  sourceUrl: "https://simplenote.com/help/",
  sourceLabel: "official Simplenote help and keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "notes",
      title: "Notes and search",
      intro: "These desktop commands create and search notes. The delete key is for the macOS app.",
      shortcuts: [
        { id: "new-note", action: "Create a new note", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "I"], macos: ["Cmd", "N"], linux: ["Ctrl", "Shift", "I"] }) },
        { id: "search-notes", action: "Search notes", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "S"], macos: ["Cmd", "L"], linux: ["Ctrl", "Shift", "S"] }) },
        { id: "print-note", action: "Print the current note", keys: perPlatform(platforms, { windows: ["Ctrl", "P"], macos: ["Cmd", "P"], linux: ["Ctrl", "P"] }) },
        { id: "delete-note", action: "Delete the current note", keys: perPlatform(platforms, { macos: ["Shift", "Cmd", "Backspace"] }), note: "macOS only." },
      ],
    },
    {
      id: "editing-and-view",
      title: "Editing and view",
      intro: "Editing and view commands add checklist items, change the writing view, show the shortcut list, and adjust the desktop font size.",
      shortcuts: [
        { id: "checklist", action: "Insert a checklist item", keys: combo(electronPlatforms, ["Ctrl", "Shift", "C"]) },
        { id: "focus-mode", action: "Toggle focus mode", keys: combo(electronPlatforms, ["Ctrl", "Shift", "F"]) },
        { id: "markdown-preview", action: "Toggle Markdown preview", keys: combo(electronPlatforms, ["Ctrl", "Shift", "P"]) },
        { id: "show-shortcuts", action: "Show keyboard shortcuts", keys: perPlatform(electronPlatforms, { windows: ["Ctrl", "/"], linux: ["Ctrl", "/"] }), note: "Lists every shortcut in the Windows and Linux app." },
        { id: "font-increase", action: "Increase font size", keys: combo(platforms, ["Ctrl", "+"], ["Cmd", "+"]) },
        { id: "font-decrease", action: "Decrease font size", keys: combo(platforms, ["Ctrl", "-"], ["Cmd", "-"]) },
        { id: "font-reset", action: "Reset font size", keys: combo(platforms, ["Ctrl", "0"], ["Cmd", "0"]) },
      ],
    },
  ],
};

export default simplenote;
