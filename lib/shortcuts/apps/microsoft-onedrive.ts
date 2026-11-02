import type { AppShortcuts, Shortcut } from "../types.ts";

const shortcut = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: [{ platform: "windows", keys }],
  ...(note ? { note } : {}),
});

export const microsoftOneDrive: AppShortcuts = {
  slug: "microsoft-onedrive",
  name: "Microsoft OneDrive",
  category: "Cloud storage",
  platforms: ["windows"],
  versionContext:
    "OneDrive for work or school, with Windows key names. Some commands only work in OneDrive on the web.",
  sourceUrl: "https://support.microsoft.com/en-US/accessibility/onedrive/keyboard-shortcuts-for-onedrive-for-work-or-school",
  sourceLabel: "official Microsoft OneDrive keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "files-and-selection",
      title: "Files and selection",
      intro: "Rename, open, delete, select, and share files from a OneDrive list.",
      shortcuts: [
        shortcut("rename", "Rename the selected item", ["F2"]),
        shortcut("delete", "Delete the selected item", ["Delete"]),
        shortcut("cancel", "Cancel the current action or selection", ["Esc"]),
        shortcut("download", "Download the selected item", ["Ctrl", "S"], "OneDrive web shortcut."),
        shortcut("share", "Share the selected item", ["S"], "OneDrive web shortcut."),
        shortcut("context-menu", "Open the context menu", ["Shift", "F10"], "The Menu key also works."),
        shortcut("select-all", "Select all items", ["Ctrl", "A"]),
        shortcut("deselect-all", "Deselect all items", ["Ctrl", "D"]),
        shortcut("toggle-selection", "Select or clear the focused item", ["Space"]),
        shortcut("open", "Open or download the focused item", ["Enter"]),
      ],
    },
    {
      id: "navigation-and-view",
      title: "Navigation and view",
      intro: "Move through the file list, change the presentation, refresh, and open help or details.",
      shortcuts: [
        shortcut("next-region", "Move to the next region", ["Tab"]),
        shortcut("previous-region", "Move to the previous region", ["Shift", "Tab"]),
        shortcut("next-item", "Move to the next item", ["Down"]),
        shortcut("previous-item", "Move to the previous item", ["Up"]),
        shortcut("refresh", "Refresh the file list", ["F5"]),
        shortcut("list-view", "Show the list view", ["V"]),
        shortcut("help", "Open keyboard shortcut help", ["?"]),
        shortcut("details", "Open or close the details pane", ["I"]),
        {
          id: "get-file-information",
          action: "Get information about the selected file",
          keys: [{ platform: "windows", keys: ["Right"], alternatives: [["Left"]], note: "OneDrive web shortcut." }],
        },
      ],
    },
    {
      id: "browser-focus",
      title: "Browser focus",
      intro: "These commands apply while using OneDrive in a browser and move focus between the page and browser controls.",
      shortcuts: [
        shortcut("open-url", "Open a URL in OneDrive", ["Ctrl", "O"], "OneDrive web shortcut."),
        shortcut("focus-browser-bar", "Move focus to the browser address bar", ["F6"], "OneDrive web shortcut."),
        shortcut("cycle-browser-focus", "Cycle focus between browser regions", ["Ctrl", "F6"], "OneDrive web shortcut."),
      ],
    },
  ],
};

export default microsoftOneDrive;
