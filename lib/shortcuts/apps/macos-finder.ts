import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["macos"] as const;

export const macosFinder: AppShortcuts = {
  slug: "macos-finder",
  name: "macOS Finder",
  category: "File management",
  platforms: [...platforms],
  versionContext:
    "Finder and system shortcuts from Apple's current Mac keyboard-shortcuts reference, checked September 1, 2026. A command can change with the current Finder selection or window state.",
  sourceUrl: "https://support.apple.com/102650",
  sourceLabel: "Apple Mac keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "file-actions",
      title: "File actions",
      intro: "Duplicate, eject, search, inspect, and reveal selected Finder items.",
      shortcuts: [
        { id: "duplicate", action: "Duplicate selected files", keys: combo(platforms, ["Cmd", "D"]) },
        { id: "eject", action: "Eject the selected disk or volume", keys: combo(platforms, ["Cmd", "E"]) },
        { id: "search", action: "Start a Spotlight search in Finder", keys: combo(platforms, ["Cmd", "F"]) },
        { id: "get-info", action: "Show Get Info for the selected file", keys: combo(platforms, ["Cmd", "I"]) },
        { id: "show-original", action: "Show the original for a selected alias", keys: combo(platforms, ["Cmd", "R"]) },
        { id: "new-folder", action: "Create a new folder", keys: combo(platforms, ["Shift", "Cmd", "N"]) },
        { id: "move-to-trash", action: "Move the selected item to the Trash", keys: combo(platforms, ["Cmd", "Delete"]) },
        { id: "empty-trash", action: "Empty the Trash", keys: combo(platforms, ["Shift", "Cmd", "Delete"]) },
      ],
    },
    {
      id: "windows-and-tabs",
      title: "Windows and tabs",
      intro: "Open and close Finder windows and tabs, then show or hide the main Finder bars.",
      shortcuts: [
        { id: "new-window", action: "Open a new Finder window", keys: combo(platforms, ["Cmd", "N"]) },
        { id: "new-tab", action: "Open a new Finder tab", keys: combo(platforms, ["Cmd", "T"]) },
        { id: "close-window", action: "Close the front Finder window", keys: combo(platforms, ["Cmd", "W"]) },
        { id: "close-all-windows", action: "Close all Finder windows", keys: combo(platforms, ["Option", "Cmd", "W"]) },
        { id: "toolbar", action: "Show or hide the toolbar", keys: combo(platforms, ["Option", "Cmd", "T"]) },
        { id: "path-bar", action: "Show or hide the path bar", keys: combo(platforms, ["Option", "Cmd", "P"]) },
        { id: "sidebar", action: "Show or hide the sidebar", keys: combo(platforms, ["Option", "Cmd", "S"]) },
        { id: "status-bar", action: "Show or hide the status bar", keys: combo(platforms, ["Cmd", "/"]) },
      ],
    },
    {
      id: "common-locations",
      title: "Common locations and search",
      intro: "Use the Finder shortcuts for common folders and the Go to Folder dialog.",
      shortcuts: [
        { id: "computer", action: "Open the Computer window", keys: combo(platforms, ["Shift", "Cmd", "C"]) },
        { id: "desktop", action: "Open the Desktop folder", keys: combo(platforms, ["Shift", "Cmd", "D"]) },
        { id: "recents", action: "Open Recents", keys: combo(platforms, ["Shift", "Cmd", "F"]) },
        { id: "go-to-folder", action: "Open Go to Folder", keys: combo(platforms, ["Shift", "Cmd", "G"]) },
        { id: "home", action: "Open the home folder", keys: combo(platforms, ["Shift", "Cmd", "H"]) },
        { id: "icloud-drive", action: "Open iCloud Drive", keys: combo(platforms, ["Shift", "Cmd", "I"]) },
        { id: "network", action: "Open the Network window", keys: combo(platforms, ["Shift", "Cmd", "K"]) },
        { id: "downloads", action: "Open Downloads", keys: combo(platforms, ["Option", "Cmd", "L"]) },
        { id: "documents", action: "Open Documents", keys: combo(platforms, ["Shift", "Cmd", "O"]) },
        { id: "airdrop", action: "Open AirDrop", keys: combo(platforms, ["Shift", "Cmd", "R"]) },
        { id: "utilities", action: "Open Utilities", keys: combo(platforms, ["Shift", "Cmd", "U"]) },
        { id: "finder-spotlight", action: "Open a Finder window with a Spotlight search field", keys: combo(platforms, ["Option", "Cmd", "Space"]) },
      ],
    },
  ],
};

export default macosFinder;
