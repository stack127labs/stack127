import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const pair = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

const windowsOnly = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: [{ platform: "windows", keys }],
  ...(note ? { note } : {}),
});

const macOnly = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: [{ platform: "macos", keys }],
  ...(note ? { note } : {}),
});

export const microsoftOneNote: AppShortcuts = {
  slug: "microsoft-onenote",
  name: "Microsoft OneNote",
  category: "Notes and writing",
  platforms: [...platforms],
  intro:
    "OneNote's Windows and Mac desktop shortcuts cover notes, notebooks, search, synchronization, page movement, and the common editing commands.",
  versionContext:
    "Current Microsoft OneNote desktop shortcut tables checked September 1, 2026. Windows, macOS, and web versions have different maps, so this record separates the Windows and Mac desktop commands and leaves web-only access keys out.",
  sourceUrl: "https://support.microsoft.com/en-us/accessibility/onenote/keyboard-shortcuts-in-onenote",
  sourceLabel: "official Microsoft OneNote keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "editing",
      title: "Editing and search",
      intro: "Use the clipboard, undo, search, and links while working in a note.",
      shortcuts: [
        pair("undo", "Undo the last action", ["Ctrl", "Z"], ["Cmd", "Z"]),
        pair("redo", "Redo the last action", ["Ctrl", "Y"], ["Cmd", "Y"]),
        pair("cut", "Cut the selected content", ["Ctrl", "X"], ["Cmd", "X"]),
        pair("copy", "Copy the selected content", ["Ctrl", "C"], ["Cmd", "C"]),
        pair("paste", "Paste the clipboard", ["Ctrl", "V"], ["Cmd", "V"]),
        pair("select-all", "Select all content", ["Ctrl", "A"], ["Cmd", "A"]),
        windowsOnly("search-notebooks", "Search across notebooks", ["Ctrl", "E"]),
        windowsOnly("search-page", "Search the current page", ["Ctrl", "F"]),
        macOnly("search", "Search OneNote", ["Cmd", "F"]),
        windowsOnly("open-search-result", "Open the selected search result", ["Enter"]),
        pair("close-search", "Close search", ["Esc"], ["Esc"]),
        pair("insert-link", "Insert a hyperlink", ["Ctrl", "K"], ["Cmd", "K"]),
        windowsOnly("send-page-link", "Send a link to the current page", ["Ctrl", "Shift", "E"]),
      ],
    },
    {
      id: "windows",
      title: "Windows desktop",
      intro: "Use these commands in OneNote for Windows to open notes, dock the window, sync, and lock the notebook.",
      shortcuts: [
        windowsOnly("new-window", "Open a new OneNote window", ["Ctrl", "M"]),
        windowsOnly("quick-note", "Open a new Quick Note", ["Ctrl", "Shift", "M"], "Alt+Windows logo key+N is also documented."),
        windowsOnly("dock-window", "Dock the OneNote window", ["Ctrl", "Alt", "D"]),
        windowsOnly("sync-current-windows", "Synchronize the current notebook", ["Ctrl", "S"], "Shift+F9 is also documented."),
        windowsOnly("sync-all-windows", "Synchronize all notebooks", ["F9"]),
        windowsOnly("lock-notebooks", "Lock password-protected sections", ["Ctrl", "Alt", "L"]),
      ],
    },
    {
      id: "macos",
      title: "Mac desktop",
      intro: "Use these commands in OneNote for Mac to create pages, switch sections, sync, and manage the notebook view.",
      shortcuts: [
        macOnly("new-page", "Create a new page", ["Cmd", "N"]),
        macOnly("open-notebook", "Open a notebook", ["Cmd", "O"]),
        macOnly("full-screen", "Toggle full-screen view", ["Cmd", "Control", "F"]),
        macOnly("close-window", "Close the current window", ["Cmd", "Shift", "W"]),
        macOnly("sync-current-macos", "Synchronize the current notebook", ["Cmd", "S"]),
        macOnly("sync-all-macos", "Synchronize all notebooks", ["Cmd", "Shift", "S"]),
        macOnly("previous-section", "Move to the previous section", ["Cmd", "Shift", "{"]),
        macOnly("next-section", "Move to the next section", ["Cmd", "Shift", "}"]),
        macOnly("page-list", "Show the page list", ["Cmd", "Control", "G"]),
        macOnly("section-list", "Show the section list", ["Ctrl", "Shift", "G"]),
        macOnly("preferences", "Open OneNote preferences", ["Cmd", ","]),
        macOnly("move-page", "Move or copy the current page", ["Cmd", "Shift", "M"]),
        macOnly("copy-page", "Copy the current page", ["Cmd", "Shift", "C"]),
      ],
    },
  ],
};

export default microsoftOneNote;
