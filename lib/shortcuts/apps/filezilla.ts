import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const shared = (id: string, action: string, keys: string[], alternatives?: string[][], note?: string): Shortcut => ({
  id,
  action,
  keys: platforms.map((platform) => ({ platform, keys, ...(alternatives ? { alternatives } : {}) })),
  ...(note ? { note } : {}),
});

export const filezilla: AppShortcuts = {
  slug: "filezilla",
  name: "FileZilla",
  category: "File transfer",
  platforms: [...platforms],
  intro:
    "FileZilla's official wiki lists shortcuts for panes, transfers, bookmarks, searches, queues, tabs, and local or remote file navigation.",
  versionContext:
    "Current FileZilla Wiki keyboard shortcut page checked September 1, 2026. The wiki publishes one desktop shortcut set without platform columns, so those values are retained across Windows, macOS, and Linux.",
  sourceUrl: "https://wiki.filezilla-project.org/Keyboard_shortcuts",
  sourceLabel: "FileZilla keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "views-and-files",
      title: "Views and files",
      intro: "Rename, refresh, search, and move through local or remote file views.",
      shortcuts: [
        shared("rename", "Rename the selected file", ["F2"]),
        shared("remote-search", "Search remote files", ["F3"]),
        shared("refresh", "Refresh local and remote views", ["F5"]),
        shared("next-view", "Switch to the next view", ["Tab"]),
        shared("parent-folder", "Navigate to the parent folder", ["Alt", "Up"]),
        shared("select-up", "Move up one item", ["Up"]),
        shared("select-down", "Move down one item", ["Down"]),
        shared("tree-up", "Move up one level in a tree view", ["Left"]),
        shared("tree-down", "Move down one level in a tree view", ["Right"]),
        shared("open-transfer", "Transfer the selected item or expand a directory", ["Enter"]),
      ],
    },
    {
      id: "transfer-and-server",
      title: "Transfers and server",
      intro: "Start transfers, stop operations, and reconnect or disconnect from the server.",
      shortcuts: [
        shared("transfer", "Transfer the selected item to the other pane", ["Alt", "Down"]),
        shared("stop", "Stop the current operation", ["Ctrl", "C"]),
        shared("disconnect", "Disconnect from the server", ["Ctrl", "D"]),
        shared("edited-files", "Show files currently being edited", ["Ctrl", "E"]),
        shared("quick-search", "Enable Quick Search", ["Ctrl", "F"]),
        shared("directory-filters", "Open directory listing filters", ["Ctrl", "I"]),
        shared("manual-transfer", "Open Manual Transfer", ["Ctrl", "M"]),
        shared("reconnect", "Reconnect to the server", ["Ctrl", "R"]),
        shared("preserve-timestamps", "Preserve timestamps of transferred files", ["Ctrl", "U"]),
        shared("synchronized-browsing", "Toggle synchronized browsing", ["Ctrl", "Y"]),
      ],
    },
    {
      id: "bookmarks-and-tabs",
      title: "Bookmarks and tabs",
      intro: "Manage bookmarks, site connections, tabs, and the transfer queue.",
      shortcuts: [
        shared("bookmark-add", "Add a bookmark", ["Ctrl", "B"]),
        shared("bookmark-manage", "Manage bookmarks", ["Ctrl", "Shift", "B"]),
        shared("new-directory", "Create a new directory", ["Ctrl", "Shift", "N"]),
        shared("directory-compare", "Enable directory comparison", ["Ctrl", "O"]),
        shared("process-queue", "Process the queue", ["Ctrl", "P"]),
        shared("site-manager", "Open the Site Manager", ["Ctrl", "S"]),
        shared("new-tab", "Open a new tab", ["Ctrl", "T"]),
        shared("close-tab", "Close the current tab", ["Ctrl", "W"]),
        shared("next-tab", "Switch to the next tab", ["Ctrl", "PageDown"]),
        shared("previous-tab", "Switch to the previous tab", ["Ctrl", "PageUp"]),
        shared("quit", "Exit FileZilla", ["Ctrl", "Q"]),
      ],
    },
  ],
};

export default filezilla;
