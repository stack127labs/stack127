import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows"] as const;

const shortcut = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys }),
  ...(note ? { note } : {}),
});

export const windowsFileExplorer: AppShortcuts = {
  slug: "windows-file-explorer",
  name: "Windows File Explorer",
  category: "File management",
  platforms: [...platforms],
  intro:
    "Microsoft publishes a dedicated File Explorer section in its current Windows keyboard shortcut reference. This map covers navigation, tabs, search, panes, and file actions.",
  versionContext:
    "Microsoft Windows keyboard shortcuts checked September 1, 2026. The source applies to Windows 10 and Windows 11, and some commands depend on the focused File Explorer pane.",
  sourceUrl: "https://support.microsoft.com/en-us/windows/keyboard-shortcuts-in-windows-dcc61a57-8ff0-cffe-9796-cb9706c75eec",
  sourceLabel: "official Microsoft Windows keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "file-explorer",
      title: "File Explorer",
      intro: "Use these commands to open folders, move through the file tree, and control the current window.",
      shortcuts: [
        shortcut("address-bar", "Focus the address bar", ["Alt", "D"]),
        shortcut("search", "Focus search", ["Ctrl", "E"]),
        shortcut("search-alt", "Focus search", ["Ctrl", "F"]),
        shortcut("new-window", "Open a new File Explorer window", ["Ctrl", "N"]),
        shortcut("close-window", "Close the active window", ["Ctrl", "W"]),
        shortcut("expand-parent-folders", "Display all folders above the selected folder", ["Ctrl", "Shift", "E"]),
        shortcut("new-folder", "Create a new folder", ["Ctrl", "Shift", "N"]),
        shortcut("preview-pane", "Show or hide the preview pane", ["Alt", "P"]),
        shortcut("properties", "Open the selected item properties", ["Alt", "Enter"]),
        shortcut("next-folder", "Go to the next folder", ["Alt", "Right Arrow"]),
        shortcut("parent-folder", "Go to the parent folder", ["Alt", "Up Arrow"]),
        shortcut("previous-folder", "Go to the previous folder", ["Alt", "Left Arrow"]),
        shortcut("previous-location", "Go to the previous location", ["Backspace"]),
        shortcut("expand-tree", "Expand the selected folder and select its first subfolder", ["Right Arrow"]),
        shortcut("collapse-tree", "Collapse the selected folder or select its parent folder", ["Left Arrow"]),
        shortcut("top", "Go to the top of the window", ["Home"]),
        shortcut("bottom", "Go to the bottom of the window", ["End"]),
        shortcut("maximize", "Maximize or minimize the active window", ["F11"]),
      ],
    },
    {
      id: "tabs-and-items",
      title: "Tabs and items",
      intro: "These current Windows commands work with File Explorer tabs and selected files or folders.",
      shortcuts: [
        shortcut("new-tab", "Open a new tab", ["Ctrl", "T"]),
        shortcut("next-tab", "Move to the next tab", ["Ctrl", "Tab"]),
        shortcut("previous-tab", "Move to the previous tab", ["Ctrl", "Shift", "Tab"]),
        shortcut("rename", "Rename the selected item", ["F2"]),
        shortcut("search-f3", "Search for a file or folder", ["F3"]),
        shortcut("address-bar-f4", "Focus the address bar", ["F4"]),
        shortcut("refresh", "Refresh the active window", ["F5"]),
        shortcut("cycle-pane", "Cycle through screen elements", ["F6"]),
        shortcut("expand-all", "Display all subfolders", ["Num Lock", "+"]),
        shortcut("collapse-all", "Collapse the selected folder", ["Num Lock", "-"]),
        shortcut("display-all", "Display all subfolders under the selected folder", ["Num Lock", "*"]),
      ],
    },
  ],
};

export default windowsFileExplorer;
